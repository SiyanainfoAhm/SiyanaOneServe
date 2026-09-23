-- Ticket numbers are globally unique by prefix (org name), but the counter was
-- per-project. Projects under the same org (e.g. Siyana OneServe + TenderFlow)
-- both mint SIYANA-YYYY-##### and collide. Allocate the next number from the
-- max existing ticket for that prefix+year under an advisory lock.

CREATE OR REPLACE FUNCTION public.sosticket_next_ticket_no(p_project_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_org text;
  v_year int := extract(year FROM (now() AT TIME ZONE 'Asia/Kolkata'))::int;
  v_n int;
  v_max_ticket int;
  v_max_counter int;
BEGIN
  SELECT upper(left(regexp_replace(split_part(o.name, ' ', 1), '[^A-Za-z]', '', 'g'), 6))
  INTO v_org
  FROM public.sosticket_projects p
  JOIN public.sosticket_organizations o ON o.id = p.organization_id
  WHERE p.id = p_project_id;

  IF v_org IS NULL OR v_org = '' THEN
    v_org := 'GOV';
  END IF;

  -- Serialize allocation for this prefix + year across all projects.
  PERFORM pg_advisory_xact_lock(hashtext('sosticket_no:' || v_org || ':' || v_year::text));

  SELECT coalesce(max((regexp_match(t.ticket_no, '-([0-9]{5})$'))[1]::int), 0)
  INTO v_max_ticket
  FROM public.sosticket_tickets t
  WHERE t.ticket_no LIKE v_org || '-' || v_year::text || '-%';

  SELECT coalesce(max(c.last_n), 0)
  INTO v_max_counter
  FROM public.sosticket_ticket_counters c
  JOIN public.sosticket_projects p ON p.id = c.project_id
  JOIN public.sosticket_organizations o ON o.id = p.organization_id
  WHERE c.year = v_year
    AND upper(left(regexp_replace(split_part(o.name, ' ', 1), '[^A-Za-z]', '', 'g'), 6)) = v_org;

  v_n := greatest(v_max_ticket, v_max_counter) + 1;

  INSERT INTO public.sosticket_ticket_counters (project_id, year, last_n)
  VALUES (p_project_id, v_year, v_n)
  ON CONFLICT (project_id, year)
  DO UPDATE SET last_n = GREATEST(public.sosticket_ticket_counters.last_n, EXCLUDED.last_n);

  RETURN v_org || '-' || v_year::text || '-' || lpad(v_n::text, 5, '0');
END;
$$;
