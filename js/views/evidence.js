export function renderEvidence(signals) {
  const container = document.createElement('div');
  const signal = signals[0];
  
  if (!signal) return container;

  container.innerHTML = `
    <h1 id="page-title" class="mb-4">Evidencia y Fuentes</h1>
    
    <div class="dashboard-grid">
      <section class="card" aria-label="Timeline de Evidencia">
        <h2 class="mb-4">${signal.title}</h2>
        <p class="mb-4 text-secondary">${signal.evidence}</p>
        
        <div style="border-left: 2px solid var(--border-color); margin-left: 1rem; padding-left: 1.5rem;">
          <div class="mb-4">
            <span class="badge badge-success mb-2">96% Trust</span>
            <div><strong>${signal.source.name}</strong> publicó el paper original.</div>
            <div class="text-secondary text-sm">Hace 2 horas</div>
          </div>
          <div class="mb-4">
            <span class="badge badge-warning mb-2">88% Trust</span>
            <div><strong>GitHub Trending</strong> muestra repositorios replicando el modelo.</div>
            <div class="text-secondary text-sm">Hace 5 horas</div>
          </div>
        </div>
      </section>
      
      <section class="card" aria-label="Distribución de Fuentes">
        <h2 class="mb-4">Consenso: <span class="text-success">${signal.confidence}%</span></h2>
        
        <div class="mb-4">
          <h3 class="mb-2 text-sm text-secondary">Fuentes Principales</h3>
          <ul style="list-style: none;">
            <li class="mb-2 pb-2" style="border-bottom: 1px solid var(--border-color)">
              <a href="${signal.source.url}" target="_blank" rel="noopener">📄 ${signal.source.name}</a>
            </li>
            <li class="mb-2 pb-2" style="border-bottom: 1px solid var(--border-color)">
              <a href="#" class="text-secondary">💻 GitHub (Replicaciones)</a>
            </li>
          </ul>
        </div>
      </section>
    </div>
  `;
  
  return container;
}
