import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDriftMetrics } from '../src/driftwatch/metrics.js';
import { runDemoAgents } from '../src/orchestration/demoAgents.js';

test('computes transparent deterministic observability metrics', () => {
  const metrics = computeDriftMetrics(runDemoAgents('A sufficiently long test question?'));
  assert.deepEqual(metrics, {
    disagreement: 0.4,
    evidenceCoverage: 0.667,
    unsupportedClaims: 2,
    convergence: 0.6,
    observedRoles: 4,
  });
});

test('fails closed when observations are missing', () => {
  assert.throws(() => computeDriftMetrics([]), /At least one agent observation/);
});
