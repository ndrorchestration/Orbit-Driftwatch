function round(value) {
  return Math.round(value * 1000) / 1000;
}

/**
 * Compute transparent workflow telemetry.
 *
 * These values are observability metrics, not calibrated measures of truth,
 * intelligence, factuality, or answer quality.
 */
export function computeDriftMetrics(observations) {
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new TypeError('At least one agent observation is required.');
  }

  const stances = observations.map((item) => item.stance);
  const maxStance = Math.max(...stances);
  const minStance = Math.min(...stances);
  const disagreement = Math.min(1, Math.max(0, (maxStance - minStance) / 2));

  const claims = observations.flatMap((item) => item.claims);
  const supported = claims.filter((item) => item.supported && item.evidence.length > 0);
  const unsupportedClaims = claims.filter((item) => !item.supported || item.evidence.length === 0).length;
  const evidenceCoverage = claims.length === 0 ? 1 : supported.length / claims.length;

  return Object.freeze({
    disagreement: round(disagreement),
    evidenceCoverage: round(evidenceCoverage),
    unsupportedClaims,
    convergence: round(1 - disagreement),
    observedRoles: observations.length,
  });
}
