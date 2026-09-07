import { assertClaimSourceBindings, assertSources } from './sourceEvidence.js';
import { assertObservations } from '../providers/providerContract.js';

const RESPONSE_ID_PATTERN = /^resp_[A-Za-z0-9_-]{6,}$/;

function nonEmptyString(value, field, max = 256) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field} must be a non-empty string.`);
  if (value.length > max) throw new TypeError(`${field} exceeds ${max} characters.`);
  return value;
}

export function verifyLiveRunPayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Live run payload must be an object.');
  }

  const observations = assertObservations(payload.observations);
  const sources = assertSources(payload.sources);
  assertClaimSourceBindings(observations, sources);

  const provider = payload.provider;
  if (!provider || typeof provider !== 'object') throw new TypeError('provider metadata is required.');
  if (provider.id !== 'openai-responses-server') throw new TypeError('unexpected provider identity.');
  nonEmptyString(provider.model, 'provider.model', 128);
  if (provider.retrieval !== 'web_search') throw new TypeError('unexpected retrieval identity.');

  for (const field of ['researchResponseId', 'synthesisResponseId']) {
    const value = nonEmptyString(provider[field], `provider.${field}`, 256);
    if (!RESPONSE_ID_PATTERN.test(value)) throw new TypeError(`provider.${field} is not a Responses API response id.`);
  }

  const generatedAt = nonEmptyString(payload.generatedAt, 'generatedAt', 64);
  if (Number.isNaN(Date.parse(generatedAt))) throw new TypeError('generatedAt must be an ISO-compatible timestamp.');

  if (sources.length === 0) throw new TypeError('live retrieval verification requires at least one emitted source.');

  let supportedClaims = 0;
  let unsupportedClaims = 0;
  let sourceRefs = 0;
  let conflictingSourceRefs = 0;

  for (const observation of observations) {
    for (const claim of observation.claims) {
      if (claim.supported) supportedClaims += 1;
      else unsupportedClaims += 1;
      sourceRefs += (claim.sourceRefs ?? []).length;
      conflictingSourceRefs += (claim.conflictingSourceRefs ?? []).length;
    }
  }

  if (sourceRefs === 0) {
    throw new TypeError('live retrieval verification requires at least one claim-to-source binding.');
  }

  return Object.freeze({
    verifiedStructure: true,
    providerId: provider.id,
    model: provider.model,
    retrieval: provider.retrieval,
    researchResponseId: provider.researchResponseId,
    synthesisResponseId: provider.synthesisResponseId,
    generatedAt,
    observationCount: observations.length,
    sourceCount: sources.length,
    supportedClaims,
    unsupportedClaims,
    sourceRefs,
    conflictingSourceRefs,
    evidenceBoundary: 'provider/source binding and payload structure only; not factual correctness, source quality, or multi-agent efficacy',
  });
}
