-- Create table to track processed webhook events for idempotency
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_id ON public.stripe_webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_event_type ON public.stripe_webhook_events(event_type);

-- Add RLS policies
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role can manage webhook events" ON public.stripe_webhook_events;

-- Only service role can access (webhooks are backend-only)
CREATE POLICY "Service role can manage webhook events"
  ON public.stripe_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
