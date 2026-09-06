const SOURCE_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;

function boundedString(value, field, max) {
  if (typeof value !== 'string' || value.trim() === '') throw new TypeError(`${field} must be a non-empty string.`);
  if (value.length > max) throw new TypeError(`${field} exceeds ${max} characters.`);
  return value;
}

export function assertSources(candidate) {
  const sources = candidate ?? [];
  if (!Array.isArray(sources)) throw new TypeError('sources must be an array.');
  if (sources.length > 50) throw new TypeError('sources exceeds the 50-record limit.');

  const ids = new Set();
  for (const source of sources) {
    const id = boundedString(source?.id, 'source.id', 128);
    if (!SOURCE_ID_PATTERN.test(id)) throw new TypeError(`source.id ${id} contains unsupported characters.`);
    if (ids.has(id)) throw new TypeError(`Duplicate source id: ${id}.`);
    ids.add(id);

    boundedString(source.title, `source ${id} title`, 500);
    const url = boundedString(source.url, `source ${id} url`, 2048);
    let parsed;
    try { parsed = new URL(url); } catch { throw new TypeError(`source ${id} url must be a valid URL.`); }
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new TypeError(`source ${id} url must use http or https.`);

    if (source.retrievedAt !== undefined) {
      boundedString(source.retrievedAt, `source ${id} retrievedAt`, 64);
      if (Number.isNaN(Date.parse(source.retrievedAt))) throw new TypeError(`source ${id} retrievedAt must be an ISO-compatible timestamp.`);
    }
    if (source.contentDigest !== undefined && !SHA256_PATTERN.test(source.contentDigest)) {
      throw new TypeError(`source ${id} contentDigest must be sha256:<64 lowercase hex characters>.`);
    }
  }
  return sources;
}

export function assertClaimSourceBindings(observations, sources) {
  const sourceIds = new Set(sources.map((source) => source.id));
  for (const observation of observations) {
    for (const claim of observation.claims) {
      for (const field of ['sourceRefs', 'conflictingSourceRefs']) {
        const refs = claim[field] ?? [];
        if (!Array.isArray(refs)) throw new TypeError(`${field} must be an array.`);
        if (refs.length > 20) throw new TypeError(`${field} exceeds the 20-reference limit.`);
        const unique = new Set(refs);
        if (unique.size !== refs.length) throw new TypeError(`${field} contains duplicate source references.`);
        for (const ref of refs) {
          boundedString(ref, field, 128);
          if (!sourceIds.has(ref)) throw new TypeError(`Orphaned source reference: ${ref}.`);
        }
      }
    }
  }
  return observations;
}

export function normalizeProviderPayload(payload) {
  if (Array.isArray(payload)) return { observations: payload, sources: [] };
  if (!payload || typeof payload !== 'object' || !Array.isArray(payload.observations)) {
    throw new TypeError('Provider must return observations or { observations, sources }.');
  }
  return { observations: payload.observations, sources: payload.sources ?? [] };
}
