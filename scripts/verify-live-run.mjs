import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { verifyLiveRunPayload } from '../src/provenance/liveRunEvidence.js';

const [baseUrl, expectedSha, ...questionParts] = process.argv.slice(2);
const question = questionParts.join(' ').trim() || 'What are the strongest current arguments for and against requiring external evaluation before an AI system pilot?';

if (!baseUrl || !expectedSha) {
  console.error('usage: node scripts/verify-live-run.mjs <base-url> <expected-sha> [question]');
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
const healthJson = JSON.parse(health.text);
expect(healthJson.service === 'orbit-driftwatch', 'unexpected service identity');
expect(healthJson.commit === expectedSha, `deployment SHA mismatch: expected ${expectedSha}, got ${healthJson.commit}`);
expect(healthJson.provider?.configured === true, 'hosted provider is not configured');

const run = await request('/api/run-agents', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ question }),
});
expect(run.response.status === 200, `/api/run-agents returned ${run.response.status}: ${run.text.slice(0, 240)}`);

const payload = JSON.parse(run.text);
const verification = verifyLiveRunPayload(payload);
const artifact = {
  schema: 'orbit-driftwatch/live-verification@1',
  deployment: { baseUrl: base, commit: expectedSha },
  question,
  verification,
  payload,
};
const canonical = `${JSON.stringify(artifact, null, 2)}\n`;
const digest = createHash('sha256').update(canonical).digest('hex');
const filename = `live-verification-${expectedSha.slice(0, 12)}.json`;
await writeFile(filename, canonical, 'utf8');
await writeFile(`${filename}.sha256`, `${digest}  ${filename}\n`, 'utf8');

console.log(JSON.stringify({
  verified: true,
  artifact: filename,
  sha256: digest,
  ...verification,
}, null, 2));
