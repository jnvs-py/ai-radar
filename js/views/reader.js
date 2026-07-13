export function renderReader(signals) {
  const container = document.createElement('div');
  const signal = signals[0];
  
  if (!signal) return container;

  container.innerHTML = `
    <article class="reader-container" aria-label="Modo Lector">
      <h1 class="reader-title">${signal.title}</h1>
      
      <div class="reader-meta">
        Publicado: ${new Date(signal.date).toLocaleDateString()} &nbsp;|&nbsp; 
        Confianza: ${signal.confidence}% &nbsp;|&nbsp; 
        Fuente: <a href="${signal.source.url}" target="_blank" rel="noopener">${signal.source.name}</a>
      </div>
      
      <p>El ritmo de la inteligencia artificial sigue acelerándose. Recientemente, se ha reportado una señal significativa que podría alterar el panorama actual.</p>
      
      <p>${signal.evidence}</p>
      
      <div class="reader-callout">
        <strong>KEY FINDING</strong><br>
        ${signal.impact}
      </div>
      
      <p>Para los equipos de ingeniería y constructores de producto, esta es una señal que no debe pasarse por alto. La recomendación principal es la siguiente:</p>
      
      <p><em>${signal.action}</em></p>
      
      <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 3rem 0;">
      
      <h3>Fuentes Originales</h3>
      <ol style="padding-left: 1.5rem; margin-top: 1rem;">
        <li><a href="${signal.source.url}" target="_blank" rel="noopener">${signal.source.name}</a></li>
      </ol>
    </article>
  `;
  
  return container;
}
