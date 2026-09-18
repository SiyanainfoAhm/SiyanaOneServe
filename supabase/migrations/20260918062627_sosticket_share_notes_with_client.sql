-- Shared notes: government users see staff comments as well as their own.
-- New workbench notes are posted as client-visible; flip leftover internal rows.

UPDATE public.sosticket_ticket_messages
SET visibility = 'client'
WHERE visibility = 'internal';
