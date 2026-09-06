import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';
import { serializeRunArtifact } from '../src/provenance/runArtifact.js';

const question = 'How should a university design a transparent policy for generative AI in take-home assignments?';
const artifactUrl = new URL('../examples/frozen-run.json', import.meta.url);
const digestUrl = new URL('../examples/frozen-run.sha256', import.meta.url);

test('frozen example matches its recorded SHA-256 digest', async () => {
  const bytes = await readFile(artifactUrl);
  const sidecar = (await readFile(digestUrl, 'utf8')).trim();
  const expected = sidecar.split(/\s+/)[0];
  const actual = createHash('sha256').update(bytes).digest('hex');
  assert.equal(actual, expected);
});

test('current deterministic provider exactly reproduces the frozen artifact', async () => {
  const frozen = await readFile(artifactUrl, 'utf8');
  const regenerated = serializeRunArtifact(await runWorkflow(question));
  assert.equal(regenerated, frozen);
});
