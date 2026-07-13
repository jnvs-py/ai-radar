CREATE TABLE IF NOT EXISTS signals (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_id    text UNIQUE NOT NULL,
  date         date NOT NULL,
  title        text NOT NULL,
  source_name  text NOT NULL,
  source_url   text NOT NULL,
  evidence     text NOT NULL,
  impact       text NOT NULL,
  action       text NOT NULL,
  status       text NOT NULL CHECK (
    status IN (
      'en_negociacion',
      'resuelto_parcialmente',
      'modelo_emergente',
      'claim_no_verificado',
      'pendiente_de_lanzamiento',
      'observacion'
    )
  ),
  captured_at  timestamptz NOT NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_signals_date ON signals (date);
CREATE INDEX idx_signals_status ON signals (status);
CREATE INDEX idx_signals_signal_id ON signals (signal_id);
