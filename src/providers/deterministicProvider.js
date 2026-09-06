import { runDemoAgents } from '../orchestration/demoAgents.js';

/**
 * Stable offline fixture implementing the same asynchronous boundary future
 * hosted/local model providers must implement.
 */
export const deterministicProvider = Object.freeze({
  id: 'deterministic-demo',
  version: '1.0.0',
  kind: 'offline-fixture',
  async runAgents(question) {
    return runDemoAgents(question);
  },
});
