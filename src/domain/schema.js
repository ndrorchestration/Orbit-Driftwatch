/**
 * @typedef {'planner'|'researcher'|'skeptic'|'verifier'} AgentRole
 *
 * @typedef {Object} Claim
 * @property {string} text
 * @property {boolean} supported
 * @property {string[]} evidence
 *
 * @typedef {Object} AgentObservation
 * @property {AgentRole} role
 * @property {string} label
 * @property {string} summary
 * @property {number} stance - Mechanically assigned demo stance in [-1, 1]. Not a truth score.
 * @property {Claim[]} claims
 *
 * @typedef {Object} DriftMetrics
 * @property {number} disagreement - Normalized role-stance range in [0, 1].
 * @property {number} evidenceCoverage - Fraction of claims tagged supported by the workflow.
 * @property {number} unsupportedClaims
 * @property {number} convergence - Defined as 1 - disagreement for this demo.
 * @property {number} observedRoles
 *
 * @typedef {Object} OrbitView
 * @property {string} today
 * @property {string[]} patterns
 * @property {string[]} openQuestions
 * @property {string} caveat
 */

export const ROLES = Object.freeze(['planner', 'researcher', 'skeptic', 'verifier']);

export function assertQuestion(question) {
  if (typeof question !== 'string' || question.trim().length < 8) {
    throw new TypeError('Question must contain at least 8 non-whitespace characters.');
  }
  return question.trim();
}
