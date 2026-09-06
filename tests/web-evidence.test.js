import test from 'node:test';
import assert from 'node:assert/strict';
import { extractWebSources, sourceCatalogForPrompt } from '../api/lib/webEvidence.js';

test('extractWebSources normalizes and deduplicates URLs from nested response data', () => {
  const response = {
    output: [
      { type: 'web_search_call', action: { sources: [
        { title: 'Primary source', url: 'https://example.com/a' },
        { title: 'Duplicate', url: 'https://example.com/a' },
      ] } },
      { type: 'message', content: [{ type: 'output_text', annotations: [
        { type: 'url_citation', title: 'Second source', url: 'https://example.org/b' },
      ] }] },
    ],
  };
  const sources = extractWebSources(response);
  assert.equal(sources.length, 2);
  assert.deepEqual(sources.map((source) => source.id), ['web:1', 'web:2']);
  assert.equal(sources[0].url, 'https://example.com/a');
  assert.equal(sources[1].url, 'https://example.org/b');
  assert.match(sourceCatalogForPrompt(sources), /web:1 \| Primary source/);
});

test('extractWebSources ignores non-http protocols and malformed URLs', () => {
  const response = { output: [{ sources: [
    { title: 'Bad', url: 'javascript:alert(1)' },
    { title: 'Also bad', url: 'not-a-url' },
  ] }] };
  assert.deepEqual(extractWebSources(response), []);
});

test('extractWebSources caps the source surface', () => {
  const response = { output: [{ sources: Array.from({ length: 30 }, (_, index) => ({
    title: `Source ${index}`,
    url: `https://example.com/${index}`,
  })) }] };
  assert.equal(extractWebSources(response).length, 20);
});
