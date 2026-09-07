import { extractWebSources, sourceCatalogForPrompt } from './lib/webEvidence.js';

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

async function createResponse(apiKey, body) {
  const upstream = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(45_000),
  });
  if (!upstream.ok) {
    const detail = (await upstream.text()).replace(/\s+/g, ' ').slice(0, 300);
    throw new Error(`OpenAI Responses API returned ${upstream.status}: ${detail}`);
  }
  return upstream.json();
}

function synthesisPrompt(question, sources, researchText) {
  const catalog = sourceCatalogForPrompt(sources);
  return `You are the execution provider for Orbit Driftwatch, an observable multi-agent workflow.\n\nQuestion: ${question}\n\nA separate web-search pass produced this source catalog:\n${catalog || '(no web sources returned)'}\n\nResearch synthesis from that search pass:\n${researchText.slice(0, 12000)}\n\nReturn JSON only: an array of exactly four objects in this exact role order: planner, researcher, skeptic, verifier. Each object must have role, label, summary, stance, claims. stance is a number from -1 to 1 describing the role's position for workflow observability, not factual truth. claims is an array; each claim must have text, supported, evidence, sourceRefs, conflictingSourceRefs. evidence contains workflow-local tags only. sourceRefs and conflictingSourceRefs may contain ONLY IDs from the catalog above. A factual claim may use supported=true only when its sourceRefs identify evidence that actually supports it. If no catalog source supports a factual claim, set supported=false and sourceRefs=[]. Use conflictingSourceRefs when catalog sources materially conflict. Never invent citations, URLs, source IDs, empirical verification, or consensus. Keep summaries under 1200 characters and each role to at most 8 claims.`;
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
    const research = await createResponse(apiKey, {
      model,
      tools: [{ type: 'web_search_preview' }],
      include: ['web_search_call.action.sources'],
      input: `Research this question for a later evidence-bound multi-agent analysis. Prefer primary or authoritative sources, identify material disagreement, and do not fabricate sources. Question: ${question}`,
    });

    const sources = extractWebSources(research);
    const researchText = outputText(research);

    const synthesis = await createResponse(apiKey, {
      model,
      input: synthesisPrompt(question, sources, researchText),
    });

    const parsed = parseJsonText(outputText(synthesis));
    if (!Array.isArray(parsed) || parsed.length !== ROLES.length) {
      throw new Error('Model response did not contain exactly four observations.');
    }

    return res.status(200).json({
      observations: parsed,
      sources,
      provider: {
        id: 'openai-responses-server',
        model,
        retrieval: 'web_search',
        researchResponseId: research?.id ?? null,
        synthesisResponseId: synthesis?.id ?? null,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[orbit-driftwatch:model-provider]', error);
    return res.status(502).json({ error: 'Hosted model execution failed closed.' });
  }
}
