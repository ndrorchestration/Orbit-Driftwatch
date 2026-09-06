# Security

## Current foundation

The current application is static and deterministic. It does not require API keys, authentication tokens, external model credentials, or a backend.

Do not commit secrets to this repository.

## Future provider integration requirements

Before adding hosted model providers:

- keep provider credentials out of browser bundles;
- use least-privilege server-side/environment secret storage;
- validate and bound user input and provider output;
- add timeout, retry, rate-limit, and failure-state behavior;
- prevent provider errors from being converted into fabricated successful output;
- document data sent to third parties;
- add dependency and security scanning appropriate to the deployed stack.

Security or privacy claims must be scoped to the exact implementation and deployment being evaluated.
