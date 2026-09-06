# Showcase Narrative

## Core skill

**AI systems architecture, multi-agent orchestration, and research workflow design.**

## One-sentence project description

Orbit Driftwatch is an observable multi-agent reasoning workspace that exposes role activity, claims, evidence state, disagreement, and unresolved questions, then translates those internal readings into an understandable user-facing summary and portable run artifact.

## What a reviewer should notice

1. The system has explicit roles rather than a single undifferentiated prompt.
2. Execution providers sit behind a defined asynchronous contract.
3. Provider failures and malformed outputs fail closed.
4. Intermediate state is inspectable rather than hidden behind the final answer.
5. Claims can remain unresolved instead of being forced into a confident synthesis.
6. Internal telemetry is translated into ordinary language.
7. Completed runs can be exported with provider identity and epistemic caveats.
8. A frozen example artifact is reproducible and digest-bound in CI.
9. The project explicitly distinguishes implementation evidence from efficacy claims.

## Handshake-ready gate

Do not describe this as a working AI research system until all of the following are true:

- [x] provider-neutral asynchronous execution contract exists;
- [x] deterministic/offline provider remains available for reproducible tests;
- [x] provider outage and malformed-output paths are tested;
- [x] portable run artifacts preserve provider identity;
- [x] one deterministic example run is frozen, digest-bound, and reproduced in CI;
- [ ] at least one real model provider is integrated behind the role contract;
- [ ] secrets stay server-side or otherwise outside public client bundles;
- [ ] retrieval/source identity is implemented if factual research is demonstrated;
- [ ] timeout/partial-role/hostile-output paths have explicit tests;
- [ ] a public deployment works from a clean browser session;
- [ ] README screenshots match the deployed product;
- [ ] accessibility and responsive behavior receive a manual pass;
- [ ] claims in the Handshake description are checked against repository evidence.

Until then, present it as an **architecture/observability foundation** or **deterministic systems demo**.

## Future 500-character description target

> I built Orbit Driftwatch, an observable multi-agent reasoning workspace that coordinates specialized roles while exposing claims, evidence state, disagreement, and workflow traces. Driftwatch monitors the internal process; Orbit translates those readings into plain-language patterns and unresolved questions. I designed the provider boundary, orchestration, evaluation hooks, state model, failure handling, provenance artifacts, and interface to make complex agent behavior inspectable rather than hidden behind a final answer.
