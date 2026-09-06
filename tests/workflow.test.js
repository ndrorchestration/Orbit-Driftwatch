import test from 'node:test';
import assert from 'node:assert/strict';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';

test('workflow is deterministic for the same question', () => {
  const question = 'How should a university govern generative AI use?';
  assert.deepEqual(runWorkflow(question), runWorkflow(question));
});

test('workflow exposes ordered role and interpretation traces', () => {
  const run = runWorkflow('How should evidence-aware orchestration be presented?');
  assert.equal(run.mode, 'deterministic-demo');
  assert.deepEqual(run.observations.map((item) => item.role), [
    'planner',
    'researcher',
    'skeptic',
    'verifier',
  ]);
  assert.equal(run.traces.length, 7);
  assert.equal(run.traces.at(-1).stage, 'orbit:interpretation');
});

test('workflow rejects underspecified input', () => {
  assert.throws(() => runWorkflow('short'), /at least 8/);
});
