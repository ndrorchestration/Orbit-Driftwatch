const ENDPOINT = '/api/run-agents';

/**
 * Browser adapter for the server-side model boundary. No model credential is
 * accepted here; deployment secrets belong exclusively to the server runtime.
 */
export const remoteModelProvider = Object.freeze({
  id: 'openai-responses-server',
  version: '1.0.0',
  kind: 'hosted-model',
  async runAgents(question) {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!response.ok) {
      let detail = `HTTP ${response.status}`;
      try {
        const payload = await response.json();
        if (typeof payload?.error === 'string') detail = payload.error.slice(0, 240);
      } catch {}
      throw new Error(`Hosted model request failed: ${detail}`);
    }
    const payload = await response.json();
    return payload;
  },
});
