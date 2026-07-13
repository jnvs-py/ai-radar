export function renderComponent(container, state, renderSuccessCb) {
  if (!container) return;
  container.innerHTML = '';
  container.dataset.state = state.status;

  switch (state.status) {
    case 'loading':
      container.innerHTML = `
        <div class="state-loading" aria-label="Cargando datos...">
          <div class="skeleton skeleton-title"></div>
          <div class="skeleton skeleton-text"></div>
          <div class="skeleton skeleton-text"></div>
        </div>
      `;
      break;
    case 'empty':
      container.innerHTML = `
        <div class="state-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
          <p>${state.message || 'No se encontraron resultados.'}</p>
        </div>
      `;
      break;
    case 'error':
      container.innerHTML = `
        <div class="state-error" aria-live="polite">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-danger"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <p>${state.error || 'Ocurrió un error al cargar los datos.'}</p>
          ${state.onRetry ? `<button class="btn btn-primary mt-4" id="retry-btn">Reintentar</button>` : ''}
        </div>
      `;
      if (state.onRetry) {
        container.querySelector('#retry-btn').addEventListener('click', state.onRetry);
      }
      break;
    case 'success':
      if (renderSuccessCb) {
        container.appendChild(renderSuccessCb(state.data));
      }
      break;
  }
}
