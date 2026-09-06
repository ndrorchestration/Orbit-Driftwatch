function claim(text, supported, evidence = []) {
  return { text, supported, evidence };
}

/**
 * Deterministic role workers used to exercise the orchestration contract without
 * pretending that a local template is model inference or factual research.
 */
export function runDemoAgents(question) {
  const topic = question.replace(/\s+/g, ' ').trim();

  return [
    {
      role: 'planner',
      label: 'Planner',
      stance: 0,
      summary: `Decomposed “${topic}” into evidence, stakeholder, counterargument, and uncertainty lanes.`,
      claims: [
        claim(
          'The workflow should separate observations, interpretations, and unresolved uncertainty.',
          true,
          ['workflow:planning-contract'],
        ),
      ],
    },
    {
      role: 'researcher',
      label: 'Researcher',
      stance: 0.35,
      summary: 'Built the affirmative evidence lane and marked which statements would require external sourcing.',
      claims: [
        claim(
          'A defensible answer should bind substantive factual claims to identifiable evidence.',
          true,
          ['method:claim-evidence-binding'],
        ),
        claim(
          `The available evidence probably favors one dominant answer to “${topic}”.`,
          false,
          [],
        ),
      ],
    },
    {
      role: 'skeptic',
      label: 'Skeptic',
      stance: -0.45,
      summary: 'Applied an explicit counterposition and searched the workflow state for unsupported assumptions.',
      claims: [
        claim(
          'Alternative explanations should remain visible until evidence or a decision rule resolves them.',
          true,
          ['method:counterposition-contract'],
        ),
        claim(
          'Important counterevidence may be missing from the current input.',
          false,
          [],
        ),
      ],
    },
    {
      role: 'verifier',
      label: 'Verifier',
      stance: 0.05,
      summary: 'Checked claim tags and refused to promote unsupported statements into verified findings.',
      claims: [
        claim(
          'This run contains claims that remain unsupported and must be qualified in the final interpretation.',
          true,
          ['trace:researcher/claim-2', 'trace:skeptic/claim-2'],
        ),
      ],
    },
  ];
}
