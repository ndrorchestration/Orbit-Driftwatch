import { defaultPilotReadinessScenario, evaluateClaimReadiness, EvidenceStatus } from './claim-audit/evaluateClaim.js';
import { escapeHtml } from './ui/sanitize.js';

const root = document.querySelector('#claim-audit');
const scenario = defaultPilotReadinessScenario();

function esc(value) {
  return escapeHtml(String(value));
}

function cloneScenario() {
  return {
    ...scenario,
    gates: scenario.gates.map((gate) => ({ ...gate })),
  };
}

let activeScenario = cloneScenario();

function downloadAudit(result) {
  const payload = {
    schema: 'orbit-driftwatch/claim-audit/v1',
    generatedAt: new Date().toISOString(),
    scenario: activeScenario,
    result,
  };
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'claim-to-evidence-audit.json';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function gateCard(gate) {
  const optional = gate.required === false;
  const verified = gate.status === EvidenceStatus.VERIFIED;
  const statusClass = verified ? 'audit-pass' : optional ? 'audit-neutral' : 'audit-blocked';
  return `
    <article class="audit-gate ${statusClass}">
      <div class="audit-gate-head">
        <div>
          <span class="audit-class">${esc(gate.evidenceClass)}</span>
          <h3>${esc(gate.label)}</h3>
        </div>
        <span class="audit-status">${esc(gate.status)}</span>
      </div>
      <p>${esc(gate.detail)}</p>
      ${optional ? '<small>Later evidence class · not required for this pilot-readiness decision</small>' : `
        <label class="audit-toggle">
          <input data-gate-id="${esc(gate.id)}" type="checkbox" ${verified ? 'checked' : ''} />
          <span>Mark this gate VERIFIED for the demo</span>
        </label>`}
    </article>`;
}

function render() {
  const result = evaluateClaimReadiness(activeScenario);
  const verdictClass = result.claimSupported ? 'verdict-pass' : 'verdict-blocked';
  const coverage = Math.round(result.coverage * 100);

  root.innerHTML = `
    <section class="shell audit-shell">
      <nav class="audit-nav"><a href="./index.html">← Orbit Driftwatch</a><span>Claim-to-Evidence Audit</span></nav>
      <header class="hero audit-hero">
        <div class="eyebrow">DETERMINISTIC PORTFOLIO DEMONSTRATION</div>
        <h1>Can the evidence support the claim?</h1>
        <p class="lede">A small, inspectable example of fail-closed claim evaluation. It separates software checks, provenance, independent review, freeze state, authorization, and empirical evidence instead of collapsing them into one “pass.”</p>
        <div class="status-row">
          <span class="pill">No model required</span>
          <span class="pill">Procedural evidence only</span>
          <span class="pill">Fail closed</span>
          <span class="pill">Exportable audit artifact</span>
        </div>
      </header>

      <section class="panel audit-claim-panel">
        <div class="section-label">CLAIM UNDER REVIEW</div>
        <blockquote>${esc(activeScenario.claim)}</blockquote>
        <p>${esc(activeScenario.purpose)}</p>
      </section>

      <section class="audit-layout">
        <div>
          <div class="audit-section-heading">
            <div><span class="section-label">DECLARED EVIDENCE</span><h2>Gate-by-gate evidence state</h2></div>
            <button id="reset-audit" class="secondary" type="button">Reset scenario</button>
          </div>
          <div class="audit-gates">${activeScenario.gates.map(gateCard).join('')}</div>
        </div>

        <aside class="panel audit-result">
          <div class="section-label">DECISION</div>
          <div class="audit-verdict ${verdictClass}">${esc(result.verdict)}</div>
          <div class="audit-coverage">
            <div><span>Required gates verified</span><strong>${result.verifiedCount}/${result.requiredCount}</strong></div>
            <div class="meter"><span style="width:${coverage}%"></span></div>
          </div>
          <div class="audit-result-block">
            <span>Strongest supported claim</span>
            <p>${esc(result.strongestSupportedClaim)}</p>
          </div>
          <div class="audit-result-block">
            <span>Next unresolved gate</span>
            <p>${result.nextGate ? `${esc(result.nextGate.label)} — ${esc(result.nextGate.status)}` : 'None within the declared required scope.'}</p>
          </div>
          <div class="audit-result-block">
            <span>Unresolved gate IDs</span>
            <code>${result.unresolvedGateIds.length ? esc(result.unresolvedGateIds.join(', ')) : 'none'}</code>
          </div>
          <p class="caveat">${esc(result.caveat)}</p>
          <button id="download-audit" type="button">Export audit JSON</button>
        </aside>
      </section>

      <section class="panel audit-explainer">
        <div class="section-label">WHY THIS MATTERS</div>
        <h2>Passing checks and authorization are different claims.</h2>
        <div class="audit-explainer-grid">
          <div><strong>1</strong><span>Tests establish scoped implementation behavior.</span></div>
          <div><strong>2</strong><span>Provenance establishes what evidence belongs to which artifact or run.</span></div>
          <div><strong>3</strong><span>Independent review establishes a separate acceptance event.</span></div>
          <div><strong>4</strong><span>Authorization establishes permission to proceed.</span></div>
          <div><strong>5</strong><span>Empirical efficacy requires later observations; it is not created by the earlier gates.</span></div>
        </div>
      </section>
    </section>`;

  root.querySelectorAll('[data-gate-id]').forEach((input) => {
    input.addEventListener('change', (event) => {
      const id = event.currentTarget.dataset.gateId;
      const original = scenario.gates.find((gate) => gate.id === id);
      const gate = activeScenario.gates.find((candidate) => candidate.id === id);
      gate.status = event.currentTarget.checked ? EvidenceStatus.VERIFIED : original.status;
      render();
    });
  });

  root.querySelector('#reset-audit')?.addEventListener('click', () => {
    activeScenario = cloneScenario();
    render();
  });
  root.querySelector('#download-audit')?.addEventListener('click', () => downloadAudit(result));
}

render();
