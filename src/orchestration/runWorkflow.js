import { assertQuestion } from '../domain/schema.js';
import { computeDriftMetrics } from '../driftwatch/metrics.js';
import { interpretRun } from '../orbit/interpret.js';
import { deterministicProvider } from '../providers/deterministicProvider.js';
import {
  assertObservations,
  assertProvider,
  WorkflowProviderError,
} from '../providers/providerContract.js';

function stableId(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `od-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export async function runWorkflow(rawQuestion, candidateProvider = deterministicProvider) {
  const question = assertQuestion(rawQuestion);
  const provider = assertProvider(candidateProvider);

  let observations;
  try {
    observations = await provider.runAgents(question);
    assertObservations(observations);
  } catch (error) {
    throw new WorkflowProviderError(provider.id, error);
  }

  const traces = [
    { ordinal: 1, stage: 'intake', status: 'complete' },
    ...observations.map((item, index) => ({
      ordinal: index + 2,
      stage: `agent:${item.role}`,
      status: 'complete',
    })),
    { ordinal: 6, stage: 'driftwatch:metrics', status: 'complete' },
    { ordinal: 7, stage: 'orbit:interpretation', status: 'complete' },
  ];

  const metrics = computeDriftMetrics(observations);
  const orbit = interpretRun(observations, metrics);

  return Object.freeze({
    runId: stableId(`${provider.id}@${provider.version}:${question}`),
    mode: provider.kind ?? 'provider',
    provider: Object.freeze({
      id: provider.id,
      version: provider.version,
      kind: provider.kind ?? 'unspecified',
    }),
    question,
    observations,
    metrics,
    orbit,
    traces,
  });
}
