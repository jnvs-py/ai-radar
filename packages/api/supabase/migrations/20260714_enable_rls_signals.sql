ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_can_read" ON public.signals
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "authenticated_can_insert" ON public.signals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
