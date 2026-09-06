import test from 'node:test';
import assert from 'node:assert/strict';
import { computeDriftMetrics } from '../src/driftwatch/metrics.js';
import { interpretRun } from '../src/orbit/interpret.js';
import { runDemoAgents } from '../src/orchestration/demoAgents.js';

test('Orbit interpretation preserves unresolved claims and caveat', () => {
  const observations = runDemoAgents('What should this observable workflow demonstrate?');
  const view = interpretRun(observations, computeDriftMetrics(observations));

  assert.equal(view.openQuestions.length, 2);
  assert.match(view.today, /2 claims remain unsupported/);
  assert.match(view.caveat, /do not measure factual truth/);
});
