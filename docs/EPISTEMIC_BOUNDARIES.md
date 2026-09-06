# Epistemic Boundaries

This document defines what Orbit Driftwatch may and may not claim from the current implementation.

## Current claim states

### VERIFIED BY REPOSITORY TESTS

- identical input produces identical deterministic workflow output;
- the expected four role identities are executed in order;
- observability metrics follow their documented formulas;
- unsupported claims remain visible in Orbit's Open Questions view;
- underspecified inputs fail rather than producing a fabricated run.

### IMPLEMENTED, NOT EXTERNALLY VALIDATED

- role-based orchestration;
- workflow trace representation;
- evidence/support tags;
- disagreement and convergence telemetry;
- Orbit plain-language interpretation.

### NOT IMPLEMENTED YET

- external model inference;
- live retrieval;
- source authentication;
- factual claim verification against external evidence;
- durable run persistence/replay;
- production authentication/authorization;
- production rate limiting and abuse controls.

### NOT ESTABLISHED

The repository does not currently establish that:

- multi-agent workflows outperform single-agent workflows;
- disagreement predicts error;
- convergence predicts correctness;
- evidence coverage predicts answer quality;
- any threshold corresponds to a calibrated risk level;
- the system is production-ready;
- the system is scientifically validated.

## Vocabulary discipline

Use **observed**, **computed**, **tagged**, **implemented**, and **tested** when those words match the evidence.

Avoid **truth score**, **certified**, **validated accuracy**, **proven improvement**, **safe**, or **production-ready** unless a later evidence artifact independently supports the claim.

## Cross-repository provenance

Orbit Driftwatch is informed by Orbit and Driftwatch design work, but it does not inherit evidence from either project. A concept adapted from another repository becomes evidence here only after it is implemented and verified in this repository.
