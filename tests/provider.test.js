import test from 'node:test';
import assert from 'node:assert/strict';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';
import { runDemoAgents } from '../src/orchestration/demoAgents.js';
import { WorkflowProviderError } from '../src/providers/providerContract.js';

test('provider failures are explicit and fail closed', async () => {
  const failingProvider = {
    id: 'failing-provider',
    version: '1.0.0',
    async runAgents() {
      throw new Error('simulated outage');
    },
  };

  await assert.rejects(
    () => runWorkflow('How should provider outages be represented?', failingProvider),
    (error) => error instanceof WorkflowProviderError && /simulated outage/.test(error.message),
  );
});

test('malformed provider output is rejected instead of normalized silently', async () => {
  const malformedProvider = {
    id: 'malformed-provider',
    version: '1.0.0',
    async runAgents(question) {
      return runDemoAgents(question).slice(0, 3);
    },
  };

  await assert.rejects(
    () => runWorkflow('How should malformed role output be handled?', malformedProvider),
    /exactly 4 agent observations/,
  );
});

test('provider configuration requires stable identity and version', async () => {
  await assert.rejects(
    () => runWorkflow('How should invalid providers be rejected?', { runAgents() {} }),
    /Provider id must be a non-empty string/,
  );
});
