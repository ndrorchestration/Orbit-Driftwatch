export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  res.setHeader('cache-control', 'no-store');
  res.setHeader('x-content-type-options', 'nosniff');

  return res.status(200).json({
    service: 'orbit-driftwatch',
    version: '0.1.0',
    commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.GITHUB_SHA || null,
    provider: {
      implementation: 'openai-responses-server',
      configured: Boolean(process.env.OPENAI_API_KEY),
    },
    retrieval: {
      implementation: 'openai-responses-web-search',
      sourceBinding: true,
    },
    evidenceBoundary: 'runtime identity/configuration only; not factual correctness or multi-agent efficacy',
  });
}
