
const CONFIG = {
  useFixtures: false,
  apiUrl: 'https://luymyxnbfieuelbsaqzv.supabase.co/functions/v1',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx1eW15eG5iZmlldWVsYnNhcXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5NjI0MTcsImV4cCI6MjA5OTUzODQxN30.j1tBKi10A1v53UmW3XLf8XU5kFQ4cdFyTGLIwNue-hU'
};

const CONFIDENCE_MAP = {
  'modelo_emergente': 85,
  'en_negociacion': 75,
  'pendiente_de_lanzamiento': 72,
  'resuelto_parcialmente': 90,
  'claim_no_verificado': 45,
  'observacion': 65
};

const TREND_MAP = {
  'modelo_emergente': 'up',
  'en_negociacion': 'up',
  'pendiente_de_lanzamiento': 'up',
  'resuelto_parcialmente': 'down',
  'claim_no_verificado': 'neutral',
  'observacion': 'neutral'
};

const CATEGORIES = ['AI', 'LLM'];

function enrichSignal(signal) {
  return {
    ...signal,
    confidence: signal.confidence ?? CONFIDENCE_MAP[signal.status] ?? 70,
    trend: signal.trend ?? TREND_MAP[signal.status] ?? 'neutral',
    categories: signal.categories ?? [...CATEGORIES],
    date: signal.date || signal.capturedAt
  };
}

async function fetchSignals() {
  if (CONFIG.useFixtures) {
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const res = await fetch('fixtures/signals.json');
      if (!res.ok) throw new Error('Error al cargar fixtures');
      return await res.json();
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  try {
    const res = await fetch(`${CONFIG.apiUrl}/signals?limit=50`, {
      headers: { 'Authorization': `Bearer ${CONFIG.anonKey}` }
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    return {
      contract: { name: 'ai-radar-daily-signals', version: '1.0.0' },
      date: data.date || new Date().toISOString().split('T')[0],
      capturedAt: new Date().toISOString(),
      query: { description: 'Live Supabase query', language: 'es', requestedLimit: 50 },
      signals: (data.signals || []).map(enrichSignal),
      meta: { source: 'supabase', sourceName: 'Supabase', total: data.count ?? data.signals?.length ?? 0 }
    };
  } catch (e) {
    console.warn('[AI-RADAR] Supabase fetch failed, falling back to fixtures:', e.message);
    const res = await fetch('fixtures/signals.json');
    if (!res.ok) throw new Error('Error al cargar fixtures');
    const fixtureData = await res.json();
    return {
      ...fixtureData,
      signals: (fixtureData.signals || []).map(enrichSignal),
      meta: { source: 'fixture', sourceName: 'Fixtures locales', total: fixtureData.signals?.length ?? 0 }
    };
  }
}

export const API = {
  fetchSignals
};
