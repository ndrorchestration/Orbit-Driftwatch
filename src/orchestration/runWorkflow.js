import { assertQuestion } from '../domain/schema.js';
import { computeDriftMetrics } from '../driftwatch/metrics.js';
import { interpretRun } from '../orbit/interpret.js';
import { deterministicProvider } from '../providers/deterministicProvider.js';
import {
  assertObservations,
  assertProvider,
  WorkflowProviderError,
} from '../providers/providerContract.js';
import {
  assertClaimSourceBindings,
  assertSources,
  normalizeProviderPayload,
} from '../provenance/sourceEvidence.js';

export const DEFAULT_PROVIDER_TIMEOUT_MS = 10_000;
export const MAX_PROVIDER_TIMEOUT_MS = 60_000;

function stableId(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `od-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function normalizeTimeout(options) {
  const value = options?.providerTimeoutMs ?? DEFAULT_PROVIDER_TIMEOUT_MS;
  if (!Number.isFinite(value) || value <= 0 || value > MAX_PROVIDER_TIMEOUT_MS) {
    throw new TypeError(`providerTimeoutMs must be > 0 and <= ${MAX_PROVIDER_TIMEOUT_MS}.`);
  }
  return value;
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out after ${timeoutMs}ms`)), timeoutMs);
    Promise.resolve(promise).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); },
    );
  });
}

export async function runWorkflow(rawQuestion, candidateProvider = deterministicProvider, options = {}) {
  const question = assertQuestion(rawQuestion);
  const provider = assertProvider(candidateProvider);
  const providerTimeoutMs = normalizeTimeout(options);

  let observations;
  let sources;
  try {
    const providerCall = Promise.resolve().then(() => provider.runAgents(question));
    const payload = normalizeProviderPayload(await withTimeout(providerCall, providerTimeoutMs));
    observations = assertObservations(payload.observations);
    sources = assertSources(payload.sources);
    assertClaimSourceBindings(observations, sources);
  } catch (error) {
    throw new WorkflowProviderError(provider.id, error);
  }

  const hasExternalEvidence = sources.length > 0 || observations.some((observation) =>
    observation.claims.some((claim) => (claim.sourceRefs?.length ?? 0) > 0 || (claim.conflictingSourceRefs?.length ?? 0) > 0));

  const traces = [
    { ordinal: 1, stage: 'intake', status: 'complete' },
    ...observations.map((item, index) => ({ ordinal: index + 2, stage: `agent:${item.role}`, status: 'complete' })),
    ...(hasExternalEvidence ? [{ ordinal: 6, stage: 'evidence:binding', status: 'complete' }] : []),
    { ordinal: hasExternalEvidence ? 7 : 6, stage: 'driftwatch:metrics', status: 'complete' },
    { ordinal: hasExternalEvidence ? 8 : 7, stage: 'orbit:interpretation', status: 'complete' },
  ];

  const metrics = computeDriftMetrics(observations);
  const orbit = interpretRun(observations, metrics);

  return Object.freeze({
    runId: stableId(`${provider.id}@${provider.version}:${question}`),
    mode: provider.kind ?? 'provider',
    provider: Object.freeze({ id: provider.id, version: provider.version, kind: provider.kind ?? 'unspecified' }),
    question,
    observations,
    sources,
    metrics,
    orbit,
    traces,
  });
}
