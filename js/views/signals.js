export function renderSignals(signals, meta) {
  const container = document.createElement('div');
  
  if (!signals || signals.length === 0) {
    container.innerHTML = '<p>No hay señales para mostrar.</p>';
    return container;
  }

  let html = `
    <header class="signals-header">
      <h1 id="page-title">Ranking de Señales</h1>
      <div class="text-secondary text-sm mb-4">Origen: <strong>${meta?.sourceName || 'Desconocido'}</strong> &middot; ${signals.length} señales visibles</div>
      <div class="signals-filters" aria-label="Filtros">
        <button class="badge badge-primary">All</button>
        <button class="badge badge-neutral">Critical</button>
        <button class="badge badge-neutral">Rising</button>
      </div>
    </header>
    
    <div class="signals-list" aria-label="Lista de señales">
  `;

  signals.forEach((signal, idx) => {
    const isHighConf = signal.confidence > 85;
    const confBadge = isHighConf ? 'badge-success' : 'badge-warning';
    
    html += `
      <article class="signal-row">
        <div class="text-secondary">#${idx + 1}</div>
        <div>
          <div class="signal-title">${signal.title}</div>
          <div class="signal-meta">
            <span>${signal.categories.join(', ')}</span>
            <span>•</span>
            <span>${signal.source.name}</span>
          </div>
        </div>
        <div><span class="badge ${confBadge}">${signal.confidence}% CONF</span></div>
        <div class="text-secondary">${signal.trend === 'up' ? '↗↗' : signal.trend === 'down' ? '↘' : '→'}</div>
        <div class="text-secondary text-sm">${signal.evidence.substring(0, 60)}...</div>
        <div><span class="badge badge-neutral">${signal.status.replace(/_/g, ' ')}</span></div>
        <div class="text-secondary text-sm">${new Date(signal.date).toLocaleDateString()}</div>
      </article>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;
  return container;
}
