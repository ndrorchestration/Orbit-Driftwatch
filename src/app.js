import { runWorkflow } from './orchestration/runWorkflow.js';

const app = document.querySelector('#app');
const defaultQuestion = 'How should a university design a transparent policy for generative AI in take-home assignments?';

app.innerHTML = `
  <section class="shell">
    <header class="hero">
      <div class="eyebrow">ORBIT DRIFTWATCH · FOUNDATION</div>
      <h1>Observable multi-agent reasoning.</h1>
      <p class="lede">Watch a role-based workflow separate claims, disagreement, evidence state, and unresolved questions—then translate the machinery into plain language.</p>
      <div class="status-row">
        <span class="pill">Deterministic demo</span>
        <span class="pill">No API key</span>
        <span class="pill">No truth-score claims</span>
      </div>
    </header>

    <section class="composer panel">
      <label for="question">Research or reasoning question</label>
      <textarea id="question" rows="4"></textarea>
      <div class="composer-footer">
        <p>Current mode demonstrates system mechanics; it does not retrieve sources or perform model inference.</p>
        <button id="run-button" type="button">Run observable workflow</button>
      </div>
    </section>

    <section id="results" class="results" aria-live="polite"></section>
  </section>
`;

const questionInput = document.querySelector('#question');
const runButton = document.querySelector('#run-button');
const results = document.querySelector('#results');
questionInput.value = defaultQuestion;

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function meter(label, value, detail) {
  const pct = Math.round(value * 100);
  return `
    <div class="metric">
      <div class="metric-head"><span>${esc(label)}</span><strong>${pct}%</strong></div>
      <div class="meter"><span style="width:${pct}%"></span></div>
      <small>${esc(detail)}</small>
    </div>
  `;
}

function render(run) {
  const agentCards = run.observations.map((agent) => `
    <article class="agent-card">
      <div class="agent-head">
        <span class="agent-dot"></span>
        <h3>${esc(agent.label)}</h3>
        <span class="agent-role">${esc(agent.role)}</span>
      </div>
      <p>${esc(agent.summary)}</p>
      <ul class="claim-list">
        ${agent.claims.map((claim) => `
          <li class="claim ${claim.supported && claim.evidence.length ? 'supported' : 'open'}">
            <span>${claim.supported && claim.evidence.length ? 'SUPPORTED TAG' : 'OPEN'}</span>
            ${esc(claim.text)}
          </li>
        `).join('')}
      </ul>
    </article>
  `).join('');

  results.innerHTML = `
    <section class="run-heading">
      <div>
        <span class="eyebrow">RUN ${esc(run.runId)}</span>
        <h2>${esc(run.question)}</h2>
      </div>
      <span class="mode-badge">${esc(run.mode)}</span>
    </section>

    <section class="agent-grid">${agentCards}</section>

    <section class="telemetry-grid">
      <article class="panel telemetry">
        <div class="section-label">DRIFTWATCH · OBSERVABILITY</div>
        <h2>What is the workflow doing?</h2>
        ${meter('Role disagreement', run.metrics.disagreement, 'Normalized stance range; not factual disagreement calibration.')}
        ${meter('Evidence coverage', run.metrics.evidenceCoverage, 'Fraction of claims carrying a supported workflow evidence tag.')}
        ${meter('Convergence complement', run.metrics.convergence, 'Defined here as 1 − disagreement for transparent demo behavior.')}
        <div class="stat-row">
          <div><strong>${run.metrics.unsupportedClaims}</strong><span>unsupported claims</span></div>
          <div><strong>${run.metrics.observedRoles}</strong><span>observed roles</span></div>
          <div><strong>${run.traces.length}</strong><span>trace events</span></div>
        </div>
      </article>

      <article class="panel orbit">
        <div class="section-label">ORBIT · INTERPRETATION</div>
        <h2>What does that mean?</h2>
        <div class="orbit-block primary"><span>TODAY</span><p>${esc(run.orbit.today)}</p></div>
        <div class="orbit-block"><span>PATTERNS</span><ul>${run.orbit.patterns.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div>
        <div class="orbit-block"><span>OPEN QUESTIONS</span><ul>${run.orbit.openQuestions.map((item) => `<li>${esc(item)}</li>`).join('')}</ul></div>
        <p class="caveat">${esc(run.orbit.caveat)}</p>
      </article>
    </section>

    <section class="trace panel">
      <div class="section-label">EXECUTION TRACE</div>
      <div class="trace-line">
        ${run.traces.map((trace) => `<span><b>${trace.ordinal}</b>${esc(trace.stage)}</span>`).join('<i>→</i>')}
      </div>
    </section>
  `;
}

function execute() {
  try {
    render(runWorkflow(questionInput.value));
  } catch (error) {
    results.innerHTML = `<div class="error">${esc(error.message)}</div>`;
  }
}

runButton.addEventListener('click', execute);
execute();
