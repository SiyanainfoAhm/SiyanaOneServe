-- Send daily reminders for aging, unresolved tickets.
-- 01:30 UTC is 07:00 Asia/Kolkata (IST).

CREATE OR REPLACE FUNCTION public.sosticket_send_daily_reminders()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE
  v_ticket record;
  v_threshold integer;
  v_html text;
  v_subject text;
BEGIN
  FOR v_ticket IN
    SELECT
      t.id,
      t.ticket_no,
      t.title,
      t.priority,
      t.status,
      t.created_at,
      t.project_id,
      t.assignee_id,
      assignee.email AS assignee_email,
      assignee.full_name AS assignee_name,
      manager.email AS manager_email,
      manager.full_name AS manager_name,
      project.name AS project_name
    FROM public.sosticket_tickets t
    JOIN public.sosticket_projects project ON project.id = t.project_id
    LEFT JOIN public.sosticket_users assignee ON assignee.id = t.assignee_id
    LEFT JOIN public.sosticket_users manager ON manager.id = project.owner_id
    WHERE t.status <> 'Resolved'
      AND t.priority IN ('High', 'Critical', 'Normal', 'Low')
      AND coalesce(assignee.status, 'active') = 'active'
      AND coalesce(manager.status, 'active') = 'active'
      AND coalesce(trim(manager.email), '') <> ''
      AND (
        (t.priority IN ('High', 'Critical') AND t.created_at < now() - interval '1 day')
        OR (t.priority = 'Normal' AND t.created_at < now() - interval '4 days')
        OR (t.priority = 'Low' AND t.created_at < now() - interval '7 days')
      )
  LOOP
    v_threshold := CASE
      WHEN v_ticket.priority IN ('High', 'Critical') THEN 1
      WHEN v_ticket.priority = 'Normal' THEN 4
      WHEN v_ticket.priority = 'Low' THEN 7
    END;

    v_html := public.sosticket_mail_html(
      'Daily ticket reminder',
      'Ticket requires attention',
      'This unresolved Siyana OneServe ticket has exceeded the reminder threshold.',
      jsonb_build_array(
        jsonb_build_object('label', 'Ticket', 'value', v_ticket.ticket_no),
        jsonb_build_object('label', 'Title', 'value', v_ticket.title),
        jsonb_build_object('label', 'Project', 'value', v_ticket.project_name),
        jsonb_build_object('label', 'Priority', 'value', v_ticket.priority),
        jsonb_build_object('label', 'Status', 'value', v_ticket.status),
        jsonb_build_object('label', 'Created', 'value', to_char(v_ticket.created_at AT TIME ZONE 'Asia/Kolkata', 'DD Mon YYYY, HH12:MI AM')),
        jsonb_build_object('label', 'Reminder threshold', 'value', v_threshold || ' day(s)'),
        jsonb_build_object('label', 'Assignee', 'value', coalesce(v_ticket.assignee_name, 'Unassigned'))
      ),
      'Please review and update this ticket. Reminders will continue each morning until the status becomes Resolved.'
    );

    v_subject := 'Reminder · ' || v_ticket.ticket_no || ' · ' || v_ticket.title;

    IF nullif(trim(v_ticket.assignee_email), '') IS NOT NULL THEN
      PERFORM public.sosticket_send_flow_email(
        v_ticket.assignee_email,
        v_subject,
        v_html,
        v_ticket.manager_email,
        v_ticket.id
      );
    ELSE
      PERFORM public.sosticket_send_flow_email(
        v_ticket.manager_email,
        v_subject,
        v_html,
        NULL,
        v_ticket.id
      );
    END IF;
  END LOOP;
END;
$$;

REVOKE ALL ON FUNCTION public.sosticket_send_daily_reminders() FROM PUBLIC;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'sosticket-daily-reminders') THEN
    PERFORM cron.unschedule('sosticket-daily-reminders');
  END IF;

  PERFORM cron.schedule(
    'sosticket-daily-reminders',
    '30 1 * * *',
    $job$SELECT public.sosticket_send_daily_reminders();$job$
  );
END;
$$;
