ALTER TABLE public.submitted_bookings
  ADD COLUMN IF NOT EXISTS confirm_attempt_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_confirm_attempt_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS last_confirm_code text,
  ADD COLUMN IF NOT EXISTS last_confirm_http_status integer,
  ADD COLUMN IF NOT EXISTS confirmed_at timestamp with time zone;