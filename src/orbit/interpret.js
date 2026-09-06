function percent(value) {
  return `${Math.round(value * 100)}%`;
}

/** Translate internal telemetry into a user-facing Orbit view. */
export function interpretRun(observations, metrics) {
  const unsupported = observations
    .flatMap((observation) => observation.claims)
    .filter((item) => !item.supported || item.evidence.length === 0)
    .map((item) => item.text);

  const today = metrics.unsupportedClaims > 0
    ? `${metrics.unsupportedClaims} claims remain unsupported in this run, so the workflow should not present them as established findings.`
    : 'Every claim in this run has at least one workflow evidence tag; external source quality still requires separate verification.';

  const patterns = [
    `Role stance spread produced a ${percent(metrics.disagreement)} disagreement reading.`,
    `Mechanically tagged evidence coverage is ${percent(metrics.evidenceCoverage)} across the current claims.`,
    metrics.convergence >= 0.7
      ? 'The role stances are relatively close under this demo definition.'
      : 'The role stances remain meaningfully separated under this demo definition.',
  ];

  return Object.freeze({
    today,
    patterns,
    openQuestions: unsupported.length > 0
      ? unsupported
      : ['What external evidence would independently verify the supported claims?'],
    caveat: 'These readings describe internal workflow state. They do not measure factual truth, correctness, or model quality.',
  });
}
