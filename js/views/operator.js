export function renderOperator(signals) {
  const container = document.createElement('div');
  
  const liveFeeds = signals.map(s => {
    let colorClass = s.confidence > 90 ? 'text-danger' : s.trend === 'up' ? 'text-success' : 'text-secondary';
    return `<div><span class="${colorClass}">[${new Date(s.date).toLocaleTimeString()}]</span> ${s.title.substring(0, 40)}...</div>`;
  }).join('');

  const tableRows = signals.map(s => `
    <tr>
      <td>${s.id}</td>
      <td class="text-secondary">${s.source.name}</td>
      <td class="${s.confidence > 90 ? 'text-success' : ''}">${(s.confidence / 100).toFixed(2)}</td>
      <td>${s.status}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="operator-grid">
      
      <div class="operator-panel" aria-label="Live Signal Feed">
        <div class="operator-header">Q1: Live Signal Feed</div>
        <div class="operator-content" style="line-height: 1.8;">
          ${liveFeeds}
        </div>
      </div>
      
      <div class="operator-panel" aria-label="Network Graph Placeholder">
        <div class="operator-header">Q2: Network Graph</div>
        <div class="operator-content" style="display: flex; align-items: center; justify-content: center; color: var(--text-secondary);">
          [Interactive Nodes Visualization]
        </div>
      </div>
      
      <div class="operator-panel" aria-label="Raw Data Table">
        <div class="operator-header">Q3: Raw Data Table</div>
        <div class="operator-content" style="padding: 0;">
          <table class="operator-table">
            <thead>
              <tr>
                <th>signal_id</th>
                <th>source</th>
                <th>conf</th>
                <th>status</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="operator-panel" aria-label="Processing Metrics">
        <div class="operator-header">Q4: Processing Metrics</div>
        <div class="operator-content">
          <div class="mb-4">📈 Ingestion Rate <span style="float: right" class="text-success">142/min</span></div>
          <div class="mb-4">⏱️ Pipeline Latency <span style="float: right">230ms avg</span></div>
          <div class="mb-4">📦 Queue Depth <span style="float: right" class="text-warning">47 pending</span></div>
          <div class="mb-4">🧠 Embed Cache Hit <span style="float: right">89%</span></div>
        </div>
      </div>
      
      <div class="operator-cmd">
        <span>></span>
        <input type="text" placeholder="query: cluster:c-017 AND confidence:>0.8 AND date:>7d" aria-label="Command line query">
      </div>
      
    </div>
  `;
  
  return container;
}
