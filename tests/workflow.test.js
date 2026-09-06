import test from 'node:test';
import assert from 'node:assert/strict';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';

test('workflow is deterministic for the same question and provider', async () => {
  const question = 'How should a university govern generative AI use?';
  assert.deepEqual(await runWorkflow(question), await runWorkflow(question));
});

test('workflow exposes ordered role and interpretation traces', async () => {
  const run = await runWorkflow('How should evidence-aware orchestration be presented?');
  assert.equal(run.mode, 'offline-fixture');
  assert.equal(run.provider.id, 'deterministic-demo');
  assert.deepEqual(run.observations.map((item) => item.role), [
    'planner',
    'researcher',
    'skeptic',
    'verifier',
  ]);
  assert.equal(run.traces.length, 7);
  assert.equal(run.traces.at(-1).stage, 'orbit:interpretation');
});

test('workflow rejects underspecified input', async () => {
  await assert.rejects(() => runWorkflow('short'), /at least 8/);
});
