import test from 'node:test';
import assert from 'node:assert/strict';
import { remoteModelProvider } from '../src/providers/remoteModelProvider.js';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';
import { runDemoAgents } from '../src/orchestration/demoAgents.js';

function withFetch(fake, fn) {
  const previous = globalThis.fetch;
  globalThis.fetch = fake;
  return Promise.resolve().then(fn).finally(() => { globalThis.fetch = previous; });
}

test('server-backed provider produces a provider-bound run through the normal contract', async () => {
  await withFetch(async (url, options) => {
    assert.equal(url, '/api/run-agents');
    assert.equal(options.method, 'POST');
    return new Response(JSON.stringify({ observations: runDemoAgents('Hosted provider test question?'), sources: [] }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }, async () => {
    const run = await runWorkflow('Hosted provider test question?', remoteModelProvider);
    assert.equal(run.provider.id, 'openai-responses-server');
    assert.equal(run.provider.kind, 'hosted-model');
    assert.equal(run.observations.length, 4);
  });
});

test('server-backed provider outage fails closed', async () => {
  await withFetch(async () => new Response(JSON.stringify({ error: 'provider unavailable' }), {
    status: 503,
    headers: { 'content-type': 'application/json' },
  }), async () => {
    await assert.rejects(
      () => runWorkflow('How should a hosted provider outage behave?', remoteModelProvider),
      /Hosted model request failed: provider unavailable/,
    );
  });
});

test('malformed server-backed output is rejected by the shared contract', async () => {
  await withFetch(async () => new Response(JSON.stringify({ observations: runDemoAgents('Malformed provider test?').slice(0, 3), sources: [] }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  }), async () => {
    await assert.rejects(
      () => runWorkflow('Malformed provider test?', remoteModelProvider),
      /exactly 4 agent observations/,
    );
  });
});
