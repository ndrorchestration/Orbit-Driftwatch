import { ROLES } from '../domain/schema.js';

export class WorkflowProviderError extends Error {
  constructor(providerId, cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(`Provider ${providerId} failed closed: ${detail}`);
    this.name = 'WorkflowProviderError';
    this.providerId = providerId;
    this.cause = cause;
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
    if (typeof observation.label !== 'string' || typeof observation.summary !== 'string') {
      throw new TypeError(`Observation ${observation.role} is missing label or summary text.`);
    }
    if (!Number.isFinite(observation.stance) || observation.stance < -1 || observation.stance > 1) {
      throw new TypeError(`Observation ${observation.role} stance must be a finite number in [-1, 1].`);
    }
    if (!Array.isArray(observation.claims)) {
      throw new TypeError(`Observation ${observation.role} claims must be an array.`);
    }

    for (const claim of observation.claims) {
      if (typeof claim?.text !== 'string' || typeof claim?.supported !== 'boolean' || !Array.isArray(claim?.evidence)) {
        throw new TypeError(`Observation ${observation.role} contains a malformed claim.`);
      }
      if (!claim.evidence.every((item) => typeof item === 'string' && item.length > 0)) {
        throw new TypeError(`Observation ${observation.role} contains malformed evidence tags.`);
      }
    }
  }

  return observations;
}
