# Frozen Example Run

`frozen-run.json` is the canonical deterministic showcase artifact for provider `deterministic-demo@1.0.0` using the question:

> How should a university design a transparent policy for generative AI in take-home assignments?

The artifact is intentionally committed alongside `frozen-run.sha256` and is verified in CI in two independent ways:

1. its bytes must match the recorded SHA-256 digest;
2. regenerating the run through the current deterministic provider must produce byte-for-byte identical JSON.

This establishes reproducibility of the **demo apparatus** at the current schema/provider boundary. It does not establish that any claim in the demo is factually true, that the metrics are calibrated, or that the multi-agent pattern improves answer quality.
