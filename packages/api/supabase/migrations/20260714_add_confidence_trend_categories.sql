ALTER TABLE public.signals
  ADD COLUMN confidence INTEGER,
  ADD COLUMN trend TEXT,
  ADD COLUMN categories TEXT[];
