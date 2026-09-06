const MAX_SOURCES = 20;

function validHttpUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function collectCandidate(candidate, sink) {
  if (!candidate || typeof candidate !== 'object') return;
  const url = validHttpUrl(candidate.url);
  if (url) {
    sink.push({
      url,
      title: typeof candidate.title === 'string' && candidate.title.trim()
        ? candidate.title.trim().slice(0, 500)
        : new URL(url).hostname,
    });
  }
}

function walk(value, sink, seen = new Set()) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);

  collectCandidate(value, sink);
  if (Array.isArray(value)) {
    for (const item of value) walk(item, sink, seen);
    return;
  }
  for (const child of Object.values(value)) walk(child, sink, seen);
}

export function extractWebSources(response) {
  const candidates = [];
  walk(response?.output ?? [], candidates);

  const unique = new Map();
  for (const candidate of candidates) {
    if (!unique.has(candidate.url)) unique.set(candidate.url, candidate);
    if (unique.size >= MAX_SOURCES) break;
  }

  return [...unique.values()].map((source, index) => ({
    id: `web:${index + 1}`,
    title: source.title,
    url: source.url,
    retrievedAt: new Date().toISOString(),
  }));
}

export function sourceCatalogForPrompt(sources) {
  return sources.map((source) => `${source.id} | ${source.title} | ${source.url}`).join('\n');
}
