const ROLES = ['planner', 'researcher', 'skeptic', 'verifier'];
const DEFAULT_MODEL = 'gpt-5.6-luna';
const MAX_QUESTION_CHARS = 6000;

function outputText(response) {
  if (typeof response?.output_text === 'string') return response.output_text;
  const chunks = [];
  for (const item of response?.output ?? []) {
    for (const content of item?.content ?? []) {
      if (typeof content?.text === 'string') chunks.push(content.text);
    }
  }
  return chunks.join('\n');
}

function parseJsonText(text) {
  const trimmed = text.trim();
  const unfenced = trimmed.startsWith('```')
    ? trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
    : trimmed;
  return JSON.parse(unfenced);
}

function prompt(question) {
  return `You are the execution provider for Orbit Driftwatch, an observable multi-agent workflow.\n\nQuestion: ${question}\n\nReturn JSON only: an array of exactly four objects in this exact role order: planner, researcher, skeptic, verifier. Each object must have role, label, summary, stance, claims. stance is a number from -1 to 1 describing the role's position for workflow observability, not factual truth. claims is an array; each claim must have text, supported, evidence, sourceRefs, conflictingSourceRefs. evidence contains workflow-local tags only. Because this endpoint does not perform retrieval, sourceRefs and conflictingSourceRefs MUST be empty arrays and substantive factual claims that would require external evidence MUST use supported=false. Do not fabricate citations, URLs, source identifiers, or empirical verification. Keep summaries under 1200 characters and each role to at most 8 claims.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Hosted model provider is not configured.' });

  const question = typeof req.body?.question === 'string' ? req.body.question.trim() : '';
  if (question.length < 8 || question.length > MAX_QUESTION_CHARS) {
    return res.status(400).json({ error: `Question must contain 8-${MAX_QUESTION_CHARS} characters.` });
  }

  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  try {
    const upstream = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model, input: prompt(question) }),
      signal: AbortSignal.timeout(45_000),
    });

    if (!upstream.ok) {
      const detail = (await upstream.text()).replace(/\s+/g, ' ').slice(0, 300);
      throw new Error(`OpenAI Responses API returned ${upstream.status}: ${detail}`);
    }

    const response = await upstream.json();
    const parsed = parseJsonText(outputText(response));
    if (!Array.isArray(parsed) || parsed.length !== ROLES.length) throw new Error('Model response did not contain exactly four observations.');
    return res.status(200).json({ observations: parsed, sources: [] });
  } catch (error) {
    console.error('[orbit-driftwatch:model-provider]', error);
    return res.status(502).json({ error: 'Hosted model execution failed closed.' });
  }
}
