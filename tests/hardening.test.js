import test from 'node:test';
import assert from 'node:assert/strict';
import { runDemoAgents } from '../src/orchestration/demoAgents.js';
import { runWorkflow } from '../src/orchestration/runWorkflow.js';
import { WorkflowProviderError } from '../src/providers/providerContract.js';
import { boundedErrorMessage, escapeHtml, MAX_UI_ERROR_CHARS } from '../src/ui/sanitize.js';

function provider(id, mutate) {
  return {
    id,
    version: '1.0.0',
    async runAgents(question) {
      const observations = runDemoAgents(question);
      return mutate(observations);
    },
  };
}

test('provider timeout fails closed', async () => {
  const slow = {
    id: 'slow-provider',
    version: '1.0.0',
    async runAgents() {
      return new Promise(() => {});
    },
  };
  await assert.rejects(
    () => runWorkflow('How should provider timeouts fail closed?', slow, { providerTimeoutMs: 5 }),
    (error) => error instanceof WorkflowProviderError && /timed out after 5ms/.test(error.message),
  );
});

test('duplicate or out-of-order roles are rejected', async () => {
  const duplicate = provider('duplicate-role-provider', (observations) => {
    observations[1] = { ...observations[1], role: 'planner' };
    return observations;
  });
  await assert.rejects(
    () => runWorkflow('How should duplicate roles be handled?', duplicate),
    /roles must be ordered exactly/,
  );
});

test('out-of-range stance is rejected', async () => {
  const invalidStance = provider('invalid-stance-provider', (observations) => {
    observations[2] = { ...observations[2], stance: 1.25 };
    return observations;
  });
  await assert.rejects(
    () => runWorkflow('How should invalid stance values be handled?', invalidStance),
    /stance must be a finite number in \[-1, 1\]/,
  );
});

test('oversized provider text is rejected', async () => {
  const oversized = provider('oversized-provider', (observations) => {
    observations[0] = { ...observations[0], summary: 'x'.repeat(2001) };
    return observations;
  });
  await assert.rejects(
    () => runWorkflow('How should oversized provider output be handled?', oversized),
    /exceeds the 2000-character limit/,
  );
});

test('malformed evidence tags are rejected', async () => {
  const malformed = provider('bad-evidence-provider', (observations) => {
    observations[0].claims[0] = { ...observations[0].claims[0], evidence: [''] };
    return observations;
  });
  await assert.rejects(
    () => runWorkflow('How should malformed evidence tags be handled?', malformed),
    /evidence tag must be a non-empty string/,
  );
});

test('partial work followed by provider failure produces no successful run', async () => {
  const partialFailure = {
    id: 'partial-failure-provider',
    version: '1.0.0',
    async runAgents(question) {
      runDemoAgents(question).slice(0, 2);
      throw new Error('failure after partial provider work');
    },
  };
  await assert.rejects(
    () => runWorkflow('How should partial provider failure be represented?', partialFailure),
    /failure after partial provider work/,
  );
});

test('provider-controlled markup is escaped before UI insertion', () => {
  const hostile = '<img src=x onerror="alert(1)"><script>alert(2)</script>';
  const escaped = escapeHtml(hostile);
  assert.equal(escaped.includes('<script>'), false);
  assert.equal(escaped.includes('<img'), false);
  assert.match(escaped, /&lt;script&gt;/);
  assert.match(escaped, /&quot;alert\(1\)&quot;/);
});

test('user-visible error messages are bounded', () => {
  const message = boundedErrorMessage(new Error('x'.repeat(5000)));
  assert.equal(message.length, MAX_UI_ERROR_CHARS);
  assert.equal(message.endsWith('…'), true);
});
