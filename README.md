# Orbit Driftwatch

**Observable Multi-Agent Reasoning**

Orbit Driftwatch is a public showcase application for making multi-agent workflow behavior visible and understandable. It combines two design directions from the `ndrorchestration` ecosystem:

- **Driftwatch-derived observability:** explicit roles, workflow state, traces, disagreement, evidence coverage, and failure visibility.
- **Orbit-derived interpretation:** turn internal readings into plain-language **Today**, **Patterns**, and **Open Questions** views.

> **Current status: FOUNDATION / DETERMINISTIC PROVIDER.** The repository demonstrates orchestration, observability, provider-boundary, failure-handling, and run-artifact mechanics with deterministic local agents. It does **not** yet perform external retrieval, model inference, factual research, or validated truth scoring. Internal telemetry describes the workflow; it is not a measure of factual correctness.

## Why this exists

Most AI demos show only a prompt and a final answer. Orbit Driftwatch is designed to expose the system in between:

```text
Question
  ↓
Provider boundary
  ↓
Planner → Researcher → Skeptic → Verifier
  ↓             ↓
trace          claims/evidence
  └──────┬──────┘
         ↓
     Driftwatch
 observability metrics
         ↓
       Orbit
 plain-language meaning
         ↓
 Explainable run summary + portable artifact
```

The goal is to demonstrate AI systems architecture, role-based orchestration, evaluation hooks, observable state, evidence-aware workflow design, and accessible interpretation without claiming that architecture alone improves accuracy.

## What is implemented

- Deterministic four-role workflow: Planner, Researcher, Skeptic, Verifier.
- Asynchronous provider contract with stable provider identity/version.
- Fail-closed provider-output validation and explicit provider errors.
- Explicit per-agent claims, evidence tags, stance values, and lifecycle traces.
- Mechanically defined observability metrics:
  - role disagreement,
  - evidence coverage,
  - unsupported-claim count,
  - convergence complement,
  - observed role count.
- Orbit interpretation layer translating telemetry into Today / Patterns / Open Questions.
- Deterministic JSON run artifacts preserving provider identity, observations, metrics, interpretation, and trace state.
- Browser-based showcase UI with no build step or API key.
- Node built-in test suite and GitHub Actions CI.
- Written architecture, security, showcase, and epistemic-boundary documentation.

## Run locally

No dependencies are required for the current foundation.

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

Run verification:

```bash
npm test
```

## Repository structure

```text
Orbit-Driftwatch/
├── index.html
├── src/
│   ├── app.js
│   ├── domain/
│   ├── orchestration/
│   ├── providers/
│   ├── driftwatch/
│   ├── orbit/
│   └── provenance/
├── tests/
├── docs/
├── ARCHITECTURE.md
└── .github/workflows/ci.yml
```

## Evidence boundary

Orbit Driftwatch intentionally separates implementation status from efficacy claims.

| Statement | Current status |
|---|---|
| Role-based orchestration exists | IMPLEMENTED |
| Provider contract and fail-closed validation exist | IMPLEMENTED + TESTED |
| Workflow traces exist | IMPLEMENTED |
| Metrics are deterministically computed | IMPLEMENTED + TESTED |
| Orbit translates metrics into plain language | IMPLEMENTED + TESTED |
| Portable deterministic run artifacts exist | IMPLEMENTED + TESTED |
| External model agents are integrated | NOT YET IMPLEMENTED |
| External retrieval/source verification is integrated | NOT YET IMPLEMENTED |
| Metrics predict truth or answer quality | NOT ESTABLISHED |
| Multi-agent workflow outperforms a single agent | NOT ESTABLISHED |
| Production reliability/security | NOT ESTABLISHED |

See [`docs/EPISTEMIC_BOUNDARIES.md`](docs/EPISTEMIC_BOUNDARIES.md) for the full claim contract.

## Relationship to other projects

Orbit Driftwatch is an independent integration/showcase application. It may reuse or adapt patterns from **Orbit Everyday** and **Driftwatch**, but cross-repository lineage does not transfer validation or evidence. DGAF, Tektite, MORSE, Amethyst, and Agent Control Plane remain separate projects with separate evidence boundaries.

## Next engineering gates

1. Add a real hosted/local model implementation behind the provider contract without exposing credentials in the browser.
2. Add retrieval with source identity and claim-to-source binding.
3. Add durable run persistence/replay beyond client-side artifact export.
4. Add adversarial/failure-path tests for partial roles, timeouts, and hostile/malformed provider text.
5. Add a deployable public showcase and one frozen example run.
6. Only then evaluate whether any metric correlates with external quality judgments.

## License

Apache-2.0. See [`LICENSE`](LICENSE).
