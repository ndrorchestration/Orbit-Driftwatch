import { ROLES } from '../domain/schema.js';

export const PROVIDER_LIMITS = Object.freeze({
  maxLabelChars: 80,
  maxSummaryChars: 2000,
  maxClaimsPerRole: 20,
  maxClaimChars: 2000,
  maxEvidenceTagsPerClaim: 20,
  maxEvidenceTagChars: 256,
});

export class WorkflowProviderError extends Error {
  constructor(providerId, cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Provider ${providerId} failed closed: ${detail}`);
    this.name = 'WorkflowProviderError';
    this.providerId = providerId;
    this.cause = cause;
  }
}

function assertBoundedText(value, field, maxChars) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} must be a non-empty string.`);
  }
  if (value.length > maxChars) {
    throw new TypeError(`${field} exceeds the ${maxChars}-character limit.`);
  }
}

export function assertProvider(provider) {
  if (!provider || typeof provider !== 'object') {
    throw new TypeError('A provider object is required.');
  }
  if (typeof provider.id !== 'string' || provider.id.trim() === '') {
    throw new TypeError('Provider id must be a non-empty string.');
  }
  if (typeof provider.version !== 'string' || provider.version.trim() === '') {
    throw new TypeError('Provider version must be a non-empty string.');
  }
  if (typeof provider.runAgents !== 'function') {
    throw new TypeError('Provider must implement runAgents(question).');
  }
  return provider;
}

export function assertObservations(observations) {
  if (!Array.isArray(observations) || observations.length !== ROLES.length) {
    throw new TypeError(`Provider must return exactly ${ROLES.length} agent observations.`);
  }

  const roles = observations.map((item) => item?.role);
  if (!ROLES.every((role, index) => roles[index] === role)) {
    throw new TypeError(`Provider roles must be ordered exactly as: ${ROLES.join(', ')}.`);
  }

  for (const observation of observations) {
    assertBoundedText(observation.label, `Observation ${observation.role} label`, PROVIDER_LIMITS.maxLabelChars);
    assertBoundedText(observation.summary, `Observation ${observation.role} summary`, PROVIDER_LIMITS.maxSummaryChars);

    if (!Number.isFinite(observation.stance) || observation.stance < -1 || observation.stance > 1) {
      throw new TypeError(`Observation ${observation.role} stance must be a finite number in [-1, 1].`);
    }
    if (!Array.isArray(observation.claims)) {
      throw new TypeError(`Observation ${observation.role} claims must be an array.`);
    }
    if (observation.claims.length > PROVIDER_LIMITS.maxClaimsPerRole) {
      throw new TypeError(`Observation ${observation.role} exceeds the claim-count limit.`);
    }

    for (const claim of observation.claims) {
      if (typeof claim?.supported !== 'boolean' || !Array.isArray(claim?.evidence)) {
        throw new TypeError(`Observation ${observation.role} contains a malformed claim.`);
      }
      assertBoundedText(claim.text, `Observation ${observation.role} claim text`, PROVIDER_LIMITS.maxClaimChars);
      if (claim.evidence.length > PROVIDER_LIMITS.maxEvidenceTagsPerClaim) {
        throw new TypeError(`Observation ${observation.role} claim exceeds the evidence-tag limit.`);
      }
      for (const evidence of claim.evidence) {
        assertBoundedText(
          evidence,
          `Observation ${observation.role} evidence tag`,
          PROVIDER_LIMITS.maxEvidenceTagChars,
        );
      }
    }
  }

  return observations;
}
