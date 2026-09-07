import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyLiveRunPayload } from '../src/provenance/liveRunEvidence.js';

function payload() {
  return {
    provider: {
      id: 'openai-responses-server',
      model: 'gpt-5.6-luna',
      retrieval: 'web_search',
      researchResponseId: 'resp_research123',
      synthesisResponseId: 'resp_synthesis456',
    },
    generatedAt: '2026-09-07T07:15:00.000Z',
    sources: [
      {
        id: 'src-1',
        title: 'Example source',
        url: 'https://example.com/source',
        retrievedAt: '2026-09-07T07:14:00.000Z',
      },
    ],
    observations: [
      ['planner', 0.2],
      ['researcher', 0.4],
      ['skeptic', -0.3],
      ['verifier', 0.1],
    ].map(([role, stance], index) => ({
      role,
      label: role,
      summary: `${role} summary`,
      stance,
      claims: [{
        text: `${role} claim`,
        supported: index !== 2,
        evidence: ['fixture'],
        sourceRefs: index === 0 ? ['src-1'] : [],
        conflictingSourceRefs: [],
      }],
    })),
  };
}

test('accepts a provider-bound source-linked live payload', () => {
  const report = verifyLiveRunPayload(payload());
  assert.equal(report.verifiedStructure, true);
  assert.equal(report.sourceCount, 1);
  assert.equal(report.sourceRefs, 1);
  assert.equal(report.observationCount, 4);
});

test('fails closed when upstream response provenance is absent', () => {
  const candidate = payload();
  candidate.provider.researchResponseId = null;
  assert.throws(() => verifyLiveRunPayload(candidate), /researchResponseId/);
});

test('fails closed when a claim has no emitted source binding anywhere', () => {
  const candidate = payload();
  for (const observation of candidate.observations) observation.claims[0].sourceRefs = [];
  assert.throws(() => verifyLiveRunPayload(candidate), /claim-to-source binding/);
});

test('fails closed on orphaned source references', () => {
  const candidate = payload();
  candidate.observations[0].claims[0].sourceRefs = ['missing-source'];
  assert.throws(() => verifyLiveRunPayload(candidate), /Orphaned source reference/);
});
