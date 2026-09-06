import test from 'node:test';
import assert from 'node:assert/strict';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';
import {
  buildRunArtifact,
  RUN_ARTIFACT_SCHEMA,
  serializeRunArtifact,
} from '../src/provenance/runArtifact.js';

test('run artifacts preserve provider identity and epistemic note', async () => {
  const run = await runWorkflow('How should a run artifact preserve provenance?');
  const artifact = buildRunArtifact(run);

  assert.equal(artifact.schemaVersion, RUN_ARTIFACT_SCHEMA);
  assert.equal(artifact.provider.id, 'deterministic-demo');
  assert.equal(artifact.runId, run.runId);
  assert.match(artifact.epistemicNote, /not measures of factual truth/);
});

test('identical deterministic runs serialize byte-for-byte identically', async () => {
  const question = 'How should reproducible run artifacts behave?';
  const first = serializeRunArtifact(await runWorkflow(question));
  const second = serializeRunArtifact(await runWorkflow(question));
  assert.equal(first, second);
});
