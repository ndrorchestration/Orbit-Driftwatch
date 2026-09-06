const [baseUrl, expectedSha] = process.argv.slice(2);
if (!baseUrl || !expectedSha) {
  console.error('usage: node scripts/verify-deployment.mjs <base-url> <expected-sha>');
  process.exit(2);
}

const base = baseUrl.replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, { redirect: 'manual', ...options });
  const text = await response.text();
  return { response, text };
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

const health = await request('/api/health');
expect(health.response.status === 200, `/api/health returned ${health.response.status}`);
expect(health.response.headers.get('cache-control')?.includes('no-store'), '/api/health missing no-store');
const healthJson = JSON.parse(health.text);
expect(healthJson.service === 'orbit-driftwatch', 'unexpected service identity');
expect(healthJson.commit === expectedSha, `deployment SHA mismatch: expected ${expectedSha}, got ${healthJson.commit}`);
expect(healthJson.retrieval?.sourceBinding === true, 'source-binding capability not reported');

const root = await request('/');
expect(root.response.status === 200, `/ returned ${root.response.status}`);
expect(/Orbit/i.test(root.text), 'root page does not identify Orbit');

const providerGet = await request('/api/run-agents');
expect(providerGet.response.status === 405, `GET /api/run-agents expected 405, got ${providerGet.response.status}`);

const malformedPost = await request('/api/run-agents', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ question: 'short' }),
});
expect([400, 503].includes(malformedPost.response.status), `provider boundary returned unexpected ${malformedPost.response.status}`);

console.log(JSON.stringify({
  verified: true,
  baseUrl: base,
  expectedSha,
  providerConfigured: healthJson.provider?.configured === true,
  evidenceBoundary: 'deployment/runtime contract only; hosted execution and factual correctness require separate evidence',
}, null, 2));
