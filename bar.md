# Orbit-Driftwatch External Quality Bar

This bar combines two external references with one internal evidence discipline:

- OpenAI Agents SDK: minimal, legible agent primitives; deterministic workflow patterns; guardrails; tracing; runnable examples.
- Arize Phoenix: trace-first observability; evaluation/experimentation; fast local startup; clear operational inspection surfaces.
- DGAF evidence discipline: fail-closed claims, immutable provenance boundaries, explicit separation of implemented/tested/verified/empirical states.

## Checkable mechanisms

1. **A first-time reviewer can identify the system's core primitives and execution path from the first screen/README section without reading implementation files.** The agent roles, provider boundary, evidence flow, and output artifact must be named explicitly and map to real modules.

2. **A meaningful deterministic example is runnable from a clean checkout with one short command sequence and without external credentials.** The result must be reproducible and tied to a stable artifact/digest.

3. **Every displayed claim that cites evidence carries explicit source identity, and orphaned or malformed source references fail closed.** A reviewer can trace `question -> source -> agent/claim -> verification/output` without inferring hidden relationships.

4. **Runtime observability exposes the execution structure rather than only a final answer.** At minimum, role activity, claims/evidence, disagreement or conflicts, unsupported-claim state, and provider identity are inspectable in the produced run record or UI.

5. **Guardrails are demonstrated through negative controls, not merely documented.** Malformed provider output, outages/timeouts, invalid source bindings, hostile markup, and contract-boundary violations are rejected by executable tests.

6. **The repository distinguishes implementation, test execution, live-runtime verification, and empirical quality claims.** No green CI result or deterministic demo may be presented as proof of factual correctness, multi-agent superiority, production security/reliability, or scientific efficacy.

7. **The five-minute portfolio path is shorter than the deep architecture path.** README/UI ordering should let a reviewer understand what the project does, run or inspect one result, see why it matters, and find its limitations before encountering deep implementation detail.

8. **A hosted-provider path, when enabled, keeps credentials server-only and preserves provider/source provenance end-to-end.** Browser code must never accept or expose the model credential; a live verification record must bind the observed run to provider identity and source/claim bindings.

9. **The observable UI has a verified render before craft can PASS.** Until a deployable or locally rendered artifact can be inspected, the craft critic remains BLIND rather than inferring quality from HTML/CSS source.

10. **Repository-level merge claims are evidence-bounded.** Passing workflows prove those workflows passed on the bound SHA; they do not prove required-check enforcement unless branch/ruleset configuration is independently observable.

## Exit comparison

Orbit-Driftwatch wins the comparison only when an independent reviewer can quickly execute or inspect a real run, trace claims to evidence, observe failure handling and agent structure, understand exactly what remains unverified, and reproduce the repository's advertised deterministic evidence without privileged context.
