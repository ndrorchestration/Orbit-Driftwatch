import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('static showcase entrypoint is wired to the expected assets', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /src\/styles\.css/);
  assert.match(html, /src\/app\.js/);
  assert.match(html, /id="app"/);
  assert.match(html, /Observable Multi-Agent Reasoning/);
});

test('browser entrypoint preserves an accessible live results region', async () => {
  const app = await readFile(new URL('../src/app.js', import.meta.url), 'utf8');
  assert.match(app, /aria-live="polite"/);
  assert.match(app, /runWorkflow/);
});
