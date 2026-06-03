1212121abdullah
const express = require('express');
const os = require('os');
const app = express();
const PORT = process.env.PORT || 3000;

let visitorCount = 0;

app.get('/', (req, res) => {
  visitorCount++;
  const containerId = os.hostname();
  const timestamp = new Date().toISOString();

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Node.js on K8s | AWS Free Tier</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0a0e1a;
      --card: #111827;
      --accent: #00f5c4;
      --accent2: #7c3aed;
      --text: #e2e8f0;
      --muted: #64748b;
      --border: #1e293b;
    }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'JetBrains Mono', monospace;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background-image: radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.08) 0%, transparent 60%),
                        radial-gradient(ellipse at 80% 20%, rgba(0,245,196,0.06) 0%, transparent 60%);
    }
    .container {
      max-width: 680px;
      width: 100%;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(0,245,196,0.1);
      border: 1px solid rgba(0,245,196,0.3);
      color: var(--accent);
      font-size: 0.7rem;
      padding: 4px 12px;
      border-radius: 99px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 1.5rem;
    }
    .badge::before { content: '●'; animation: pulse 2s infinite; }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
    h1 {
      font-family: 'Syne', sans-serif;
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 0.5rem;
    }
    h1 span { color: var(--accent); }
    .subtitle { color: var(--muted); font-size: 0.85rem; margin-bottom: 2.5rem; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .card.full { grid-column: 1 / -1; }
    .card label {
      display: block;
      font-size: 0.65rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
      color: var(--muted);
      margin-bottom: 6px;
    }
    .card .value {
      font-size: 0.9rem;
      color: var(--text);
      word-break: break-all;
    }
    .card .value.big {
      font-family: 'Syne', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--accent);
    }
    .footer {
      margin-top: 2rem;
      font-size: 0.7rem;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
    }
    .footer a { color: var(--accent2); text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">live · kubernetes</div>
    <h1>Node.js on <span>K8s</span></h1>
    <p class="subtitle">Running on AWS Free Tier · EC2 + Minikube + ECR + GitHub Actions</p>
    <div class="grid">
      <div class="card">
        <label>Visitor Count</label>
        <div class="value big">${visitorCount}</div>
      </div>
      <div class="card">
        <label>Container / Pod ID</label>
        <div class="value">${containerId}</div>
      </div>
      <div class="card full">
        <label>Server Timestamp</label>
        <div class="value">${timestamp}</div>
      </div>
      <div class="card full">
        <label>Node.js Version</label>
        <div class="value">${process.version} · ${process.platform} · ${process.arch}</div>
      </div>
    </div>
    <div class="footer">
      <span>DevOps CI/CD Project · S2026</span>
      <a href="/health">/health endpoint →</a>
    </div>
  </div>
</body>
</html>
  `);
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    containerId: os.hostname(),
    visitors: visitorCount
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Container ID: ${os.hostname()}`);
});
