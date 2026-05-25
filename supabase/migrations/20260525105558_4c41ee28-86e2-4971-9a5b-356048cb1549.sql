CREATE TABLE public.submitted_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key UUID NOT NULL UNIQUE,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  yeti_ticket_id TEXT,
  yeti_ticket_number TEXT,
  yeti_customer_id TEXT,
  yeti_response JSONB,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  customer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_submitted_bookings_status ON public.submitted_bookings(status);
CREATE INDEX idx_submitted_bookings_email ON public.submitted_bookings(customer_email);
CREATE INDEX idx_submitted_bookings_created ON public.submitted_bookings(created_at DESC);

ALTER TABLE public.submitted_bookings ENABLE ROW LEVEL SECURITY;

-- No policies = no client access. Edge function uses service_role which bypasses RLS.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_submitted_bookings_updated_at
BEFORE UPDATE ON public.submitted_bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();