export function renderDashboard(signals, meta) {
  const container = document.createElement('div');
  
  const total = signals.length;
  const critical = signals.filter(s => s.confidence >= 85).length;
  const avgConf = total > 0 ? Math.round(signals.reduce((acc, s) => acc + s.confidence, 0) / total) : 0;
  const uniqueSources = new Set(signals.map(s => s.source?.name).filter(Boolean));
  const sourceCount = uniqueSources.size;

  container.innerHTML = `
    <h1 id="page-title" class="mb-4">Dashboard</h1>

    <div class="text-secondary text-sm mb-4">
      Origen de datos: <strong>${meta?.sourceName || 'Desconocido'}</strong> &middot; ${meta?.total ?? total} señales totales
    </div>
    
    <section class="kpi-row" aria-label="Métricas principales">
      <div class="card kpi-card">
        <h3>Total Signals</h3>
        <div class="value">${total}</div>
      </div>
      <div class="card kpi-card">
        <h3>Critical Alerts</h3>
        <div class="value text-danger">${critical}</div>
      </div>
      <div class="card kpi-card">
        <h3>Confidence Avg</h3>
        <div class="value text-success">${avgConf}%</div>
      </div>
      <div class="card kpi-card">
        <h3>Sources Active</h3>
        <div class="value">${sourceCount}</div>
      </div>
    </section>
    
    <section class="dashboard-grid">
      <div class="card">
        <h2 class="mb-4">Radar Sectorial</h2>
        <div style="height: 300px; display: flex; align-items: center; justify-content: center; border: 1px dashed var(--border-color); border-radius: 50%; width: 300px; margin: 0 auto;">
          <span class="text-secondary">[Radar Chart Placeholder]</span>
        </div>
      </div>
      
      <div class="card">
        <h2 class="mb-4">Actividad Reciente</h2>
        <ul style="list-style: none; padding: 0;">
          ${signals.slice(0, 5).map(s => `
            <li class="mb-4 pb-4" style="border-bottom: 1px solid var(--border-color);">
              <div class="signal-title">${s.title}</div>
              <div class="text-secondary text-sm">${s.source?.name || '—'} &middot; ${new Date(s.date).toLocaleString()}</div>
            </li>
          `).join('')}
        </ul>
      </div>
    </section>
  `;
  
  return container;
}
