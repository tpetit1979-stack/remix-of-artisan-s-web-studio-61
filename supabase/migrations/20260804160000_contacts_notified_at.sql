-- Guards the notify-contact edge function against replay/enumeration abuse:
-- a contact can only trigger one notification email, ever, and only within
-- a short window after submission (enforced in the function, not here).

ALTER TABLE public.contacts
  ADD COLUMN IF NOT EXISTS notified_at timestamptz;

COMMENT ON COLUMN public.contacts.notified_at IS
  'Set once by the notify-contact edge function after successfully sending the tenant notification email. A conditional UPDATE (WHERE notified_at IS NULL) prevents double-send on retry/replay.';
