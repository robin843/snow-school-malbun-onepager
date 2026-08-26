ALTER TABLE public.submitted_bookings
  ADD COLUMN IF NOT EXISTS booking_status text NOT NULL DEFAULT 'provisional',
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS yeti_reservation_token text,
  ADD COLUMN IF NOT EXISTS reservation_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS total_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'CHF',
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS instructor_id text,
  ADD COLUMN IF NOT EXISTS customer_number text,
  ADD COLUMN IF NOT EXISTS invoice_number text,
  ADD COLUMN IF NOT EXISTS invoice_due_date date;

CREATE INDEX IF NOT EXISTS submitted_bookings_ticket_id_idx ON public.submitted_bookings (yeti_ticket_id);
CREATE INDEX IF NOT EXISTS submitted_bookings_booking_status_idx ON public.submitted_bookings (booking_status);
CREATE INDEX IF NOT EXISTS submitted_bookings_reservation_expires_idx ON public.submitted_bookings (reservation_expires_at);