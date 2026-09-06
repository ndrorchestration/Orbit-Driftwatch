import test from 'node:test';
import assert from 'node:assert/strict';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';
import { buildRunArtifact } from '../src/provenance/runArtifact.js';
import { runDemoAgents } from '../src/orchestration/demoAgents.js';

function sourceProvider(mutator) {
  return {
    id: 'source-test-provider',
    version: '1.0.0',
    async runAgents(question) {
      const observations = runDemoAgents(question);
      observations[1].claims[0] = {
        ...observations[1].claims[0],
        sourceRefs: ['src:1'],
        conflictingSourceRefs: [],
      };
      const payload = {
        observations,
        sources: [{
          id: 'src:1',
          title: 'Example source',
          url: 'https://example.com/source',
          retrievedAt: '2026-09-06T09:00:00Z',
          contentDigest: `sha256:${'a'.repeat(64)}`,
        }],
      };
      return mutator ? mutator(payload) : payload;
    },
  };
}

test('source identities and claim bindings survive into exported artifacts', async () => {
  const run = await runWorkflow('How should external evidence provenance be preserved?', sourceProvider());
  const artifact = buildRunArtifact(run);
  assert.equal(artifact.sources[0].id, 'src:1');
  assert.deepEqual(artifact.observations[1].claims[0].sourceRefs, ['src:1']);
  assert.equal(run.traces.some((item) => item.stage === 'evidence:binding'), true);
});

test('orphaned source references fail closed', async () => {
  await assert.rejects(
    () => runWorkflow('How should orphaned source references be rejected?', sourceProvider((payload) => ({ ...payload, sources: [] }))),
    /Orphaned source reference/,
  );
});

test('duplicate source identities fail closed', async () => {
  await assert.rejects(
    () => runWorkflow('How should duplicate source identities be rejected?', sourceProvider((payload) => ({ ...payload, sources: [...payload.sources, payload.sources[0]] }))),
    /Duplicate source id/,
  );
});

test('conflicting source references are preserved explicitly', async () => {
  const run = await runWorkflow('How should conflicting evidence remain explicit?', sourceProvider((payload) => {
    payload.observations[1].claims[0] = {
      ...payload.observations[1].claims[0],
      sourceRefs: [],
      conflictingSourceRefs: ['src:1'],
    };
    return payload;
  }));
  assert.deepEqual(run.observations[1].claims[0].conflictingSourceRefs, ['src:1']);
});
