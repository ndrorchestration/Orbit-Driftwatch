# Security

## Current architecture

Orbit Driftwatch has two execution paths with different security boundaries:

1. **Deterministic browser control** — reproducible local/static workflow that requires no model credential.
2. **Hosted provider path** — optional server-side execution through the OpenAI Responses API, including server-side web-search retrieval and source-bound synthesis.

The hosted path reads `OPENAI_API_KEY` from the server environment. Browser code must never accept, embed, return, or expose that credential. `.env.example` documents the key as server-side only.

The repository includes tests for bounded provider output, malformed responses, provider outages/timeouts, source-reference integrity, hostile markup, and health/runtime identity that does not return the secret value. Those tests establish the tested software properties only; they do not establish production security or complete attack coverage.

## Reporting a vulnerability

Do not publish secrets, exploit details, private data, or credential material in a public issue. Use GitHub's private vulnerability-reporting/Security Advisory path if enabled for this repository, or another private maintainer channel already provided to you.

Include the exact revision/deployment involved, reproduction conditions, observed impact, and sanitized evidence when possible.

## Credential boundary

- Keep `OPENAI_API_KEY` server-side only.
- Do not use browser-exposed prefixes or client configuration for model credentials.
- Do not log, return, serialize, or persist the key in run artifacts or health responses.
- Use deployment-provider secret storage rather than committing `.env` files.
- Rotate any credential believed to have been exposed; deleting it from a later commit does not erase prior Git history or external caches.

## Hosted provider and retrieval boundary

The server path sends bounded request content to the configured OpenAI provider and may invoke provider-hosted web search. A deployment using that path therefore has third-party data-flow, availability, rate-limit, and provider-risk considerations that do not exist in the deterministic control.

Provider/retrieval output is validated before downstream use, and source IDs are checked for bounded/deduplicated relationships. These controls do **not** make retrieved content or model synthesis automatically true or safe.

## Deployment requirements

Before describing a hosted deployment as verified or production-ready:

- bind the observed deployment to an exact source revision;
- confirm credentials remain server-only in the deployed runtime;
- verify intended provider/retrieval identity and failure behavior;
- review platform access controls, logging, retention, rate limits, and dependency/security posture;
- complete any repository/deployment administration gates separately from application CI.

The current repository documents live hosted execution and public deployment as unresolved evidence gates. Passing deterministic CI does not close those gates.

## Evidence boundary

Security or privacy claims must be scoped to the exact implementation and deployment evaluated. Unit tests, static checks, code review, or absence of known vulnerability reports do not establish security certification, production hardening, or comprehensive vulnerability coverage.

Cross-repository patterns and DGAF-style evidence discipline do not transfer security validation from another project into Orbit Driftwatch.
