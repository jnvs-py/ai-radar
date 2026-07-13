import { API } from './api.js';
import { renderSignals } from './views/signals.js';
import { renderDashboard } from './views/dashboard.js';
import { renderEvidence } from './views/evidence.js';
import { renderReader } from './views/reader.js';
import { renderOperator } from './views/operator.js';
import { renderComponent } from './state.js';

let appData = null;

async function init() {
  console.info('[AI-RADAR] Initializing application...');
  window.addEventListener('hashchange', handleRouteChange);
  
  const container = document.getElementById('main-content');
  
  try {
    renderComponent(container, { status: 'loading' });
    appData = await API.fetchSignals();
    handleRouteChange();
  } catch (error) {
    renderComponent(container, { 
      status: 'error', 
      error: error.message,
      onRetry: init
    });
  }
}

function handleRouteChange() {
  if (!appData) return;
  
  const hash = window.location.hash || '#dashboard';
  console.info(`[AI-RADAR] Router: Navigated to ${hash}`);
  
  const container = document.getElementById('main-content');
  
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === hash) {
      link.classList.add('active');
    }
  });

  const meta = appData.meta || {};
  const signals = appData.signals || [];
  const state = signals.length === 0 
    ? { status: 'empty', message: 'No se encontraron senales para mostrar.' }
    : { status: 'success', data: signals };

  renderComponent(container, state, (data) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'view-wrapper';
    
    switch (hash) {
      case '#signals':
        wrapper.appendChild(renderSignals(data, meta));
        break;
      case '#evidence':
        wrapper.appendChild(renderEvidence(data));
        break;
      case '#reader':
        wrapper.appendChild(renderReader(data));
        break;
      case '#operator':
        wrapper.appendChild(renderOperator(data));
        break;
      case '#dashboard':
      default:
        wrapper.appendChild(renderDashboard(data, meta));
        break;
    }
    
    return wrapper;
  });
}

document.addEventListener('DOMContentLoaded', init);
