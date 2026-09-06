# Showcase Narrative

## Core skill

**AI systems architecture, multi-agent orchestration, and research workflow design.**

## One-sentence project description

Orbit Driftwatch is an observable multi-agent reasoning workspace that exposes role activity, claims, evidence state, disagreement, and unresolved questions, then translates those internal readings into an understandable user-facing summary.

## What a reviewer should notice

1. The system has explicit roles rather than a single undifferentiated prompt.
2. Intermediate state is inspectable rather than hidden behind the final answer.
3. Claims can remain unresolved instead of being forced into a confident synthesis.
4. Internal telemetry is translated into ordinary language.
5. The project explicitly distinguishes implementation evidence from efficacy claims.

## Handshake-ready gate

Do not describe this as a working AI research system until all of the following are true:

- [ ] at least one real model provider is integrated behind the role contract;
- [ ] secrets stay server-side or otherwise outside public client bundles;
- [ ] retrieval/source identity is implemented if factual research is demonstrated;
- [ ] failures and malformed model outputs have explicit tests;
- [ ] a public deployment works from a clean browser session;
- [ ] one example run is captured with exact source/version provenance;
- [ ] README screenshots match the deployed product;
- [ ] accessibility and responsive behavior receive a manual pass;
- [ ] claims in the Handshake description are checked against repository evidence.

Until then, present it as an **architecture/observability foundation** or **deterministic systems demo**.

## Future 500-character description target

> I built Orbit Driftwatch, an observable multi-agent reasoning workspace that coordinates specialized roles while exposing claims, evidence state, disagreement, and workflow traces. Driftwatch monitors the internal process; Orbit translates those readings into plain-language patterns and unresolved questions. I designed the orchestration, evaluation hooks, state model, failure boundaries, and interface to make complex agent behavior inspectable rather than hidden behind a final answer.
