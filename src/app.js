import { runWorkflow } from './orchestration/runWorkflow.js';
import { serializeRunArtifact } from './provenance/runArtifact.js';
import { boundedErrorMessage, escapeHtml } from './ui/sanitize.js';

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
        <span class="pill">Provider contract</span>
        <span class="pill">Fail-closed boundary</span>
        <span class="pill">Exportable run artifact</span>
        <span class="pill">No truth-score claims</span>
      </div>
    </header>

    <section class="composer panel">
      <label for="question">Research or reasoning question</label>
      <textarea id="question" rows="4"></textarea>
      <div class="composer-footer">
        <p>Current provider demonstrates system mechanics; it does not retrieve sources or perform model inference.</p>
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
  return escapeHtml(value);
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

function downloadRun(run) {
  const blob = new Blob([serializeRunArtifact(run)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${run.runId}.orbit-driftwatch.json`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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
        <p class="provider-line">Provider: ${esc(run.provider.id)} · v${esc(run.provider.version)} · ${esc(run.provider.kind)}</p>
      </div>
      <div class="run-actions">
        <span class="mode-badge">${esc(run.mode)}</span>
        <button id="download-run" class="secondary" type="button">Export run JSON</button>
      </div>
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

  document.querySelector('#download-run')?.addEventListener('click', () => downloadRun(run));
}

async function execute() {
  runButton.disabled = true;
  runButton.textContent = 'Running…';
  try {
    render(await runWorkflow(questionInput.value));
  } catch (error) {
    results.innerHTML = `<div class="error">${esc(boundedErrorMessage(error))}</div>`;
  } finally {
    runButton.disabled = false;
    runButton.textContent = 'Run observable workflow';
  }
}

runButton.addEventListener('click', execute);
execute();
