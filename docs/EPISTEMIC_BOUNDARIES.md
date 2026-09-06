# Epistemic Boundaries

This document defines what Orbit Driftwatch may and may not claim from the current implementation.

## Current claim states

### VERIFIED BY REPOSITORY TESTS

- identical input/provider identity produces identical deterministic workflow output;
- the expected four role identities are executed in order;
- observability metrics follow their documented formulas;
- unsupported claims remain visible in Orbit's Open Questions view;
- underspecified inputs fail rather than producing a fabricated run;
- provider outages become explicit workflow failures;
- malformed provider output is rejected rather than silently normalized;
- deterministic run artifacts preserve provider identity and serialize byte-for-byte identically.

### IMPLEMENTED, NOT EXTERNALLY VALIDATED

- role-based orchestration;
- asynchronous provider contract;
- workflow trace representation;
- evidence/support tags;
- disagreement and convergence telemetry;
- Orbit plain-language interpretation;
- versioned run-artifact export.

### NOT IMPLEMENTED YET

- external model inference;
- live retrieval;
- source authentication;
- factual claim verification against external evidence;
- durable server-side run persistence/replay;
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

## Provider failures

Provider exceptions and schema violations fail closed. A failed provider run produces no synthetic replacement observations. This behavior verifies the failure contract only; it does not establish availability or resilience of any future external provider.

## Run artifacts

A run artifact is evidence of what this application recorded for a run. It is not evidence that the recorded claims are factually correct. Provider identity and version are preserved so later comparisons do not silently collapse distinct execution conditions.

## Cross-repository provenance

Orbit Driftwatch is informed by Orbit and Driftwatch design work, but it does not inherit evidence from either project. A concept adapted from another repository becomes evidence here only after it is implemented and verified in this repository.
