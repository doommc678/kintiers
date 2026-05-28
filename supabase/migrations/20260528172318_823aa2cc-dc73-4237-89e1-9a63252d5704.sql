
CREATE TABLE public.players (
  uuid uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ign text NOT NULL,
  region text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  tiers jsonb NOT NULL DEFAULT '[]'::jsonb,
  trials jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.players TO anon, authenticated;
GRANT ALL ON public.players TO service_role;

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read players"
  ON public.players FOR SELECT
  TO anon, authenticated
  USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.players;
ALTER TABLE public.players REPLICA IDENTITY FULL;
