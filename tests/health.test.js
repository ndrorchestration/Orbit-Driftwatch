import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/health.js';

function response() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; },
  };
}

test('health exposes bounded runtime identity without secrets', () => {
  const previous = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'test-secret-not-returned';
  process.env.VERCEL_GIT_COMMIT_SHA = 'abc123';
  const res = response();
  handler({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.headers['cache-control'], 'no-store');
  assert.equal(res.body.service, 'orbit-driftwatch');
  assert.equal(res.body.commit, 'abc123');
  assert.equal(res.body.provider.configured, true);
  assert.equal(JSON.stringify(res.body).includes('test-secret-not-returned'), false);
  if (previous === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = previous;
  delete process.env.VERCEL_GIT_COMMIT_SHA;
});

test('health fails method mismatch closed', () => {
  const res = response();
  handler({ method: 'POST' }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.allow, 'GET');
});
