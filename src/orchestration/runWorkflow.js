import { assertQuestion } from '../domain/schema.js';
import { computeDriftMetrics } from '../driftwatch/metrics.js';
import { interpretRun } from '../orbit/interpret.js';
import { runDemoAgents } from './demoAgents.js';

function stableId(value) {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `od-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function runWorkflow(rawQuestion) {
  const question = assertQuestion(rawQuestion);
  const observations = runDemoAgents(question);
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
    runId: stableId(question),
    mode: 'deterministic-demo',
    question,
    observations,
    metrics,
    orbit,
    traces,
  });
}
