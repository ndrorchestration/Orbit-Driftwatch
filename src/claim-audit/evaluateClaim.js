export const EvidenceStatus = Object.freeze({
  VERIFIED: 'VERIFIED',
  PRESENT_UNVERIFIED: 'PRESENT / UNVERIFIED',
  NOT_EXECUTED: 'NOT EXECUTED',
  NOT_ESTABLISHED: 'NOT ESTABLISHED',
  NOT_GRANTED: 'NOT GRANTED',
  NOT_REQUIRED: 'NOT REQUIRED',
});

function assertScenario(scenario) {
  if (!scenario || typeof scenario !== 'object') throw new TypeError('scenario must be an object');
  if (typeof scenario.claim !== 'string' || scenario.claim.trim().length === 0) {
    throw new TypeError('scenario.claim must be a non-empty string');
  }
  if (!Array.isArray(scenario.gates) || scenario.gates.length === 0) {
    throw new TypeError('scenario.gates must be a non-empty array');
  }

  const ids = new Set();
  for (const gate of scenario.gates) {
    if (!gate || typeof gate !== 'object') throw new TypeError('each gate must be an object');
    if (typeof gate.id !== 'string' || gate.id.length === 0) throw new TypeError('each gate requires an id');
    if (ids.has(gate.id)) throw new TypeError(`duplicate gate id: ${gate.id}`);
    ids.add(gate.id);
    if (typeof gate.label !== 'string' || gate.label.length === 0) throw new TypeError(`gate ${gate.id} requires a label`);
    if (!Object.values(EvidenceStatus).includes(gate.status)) {
      throw new TypeError(`gate ${gate.id} has unsupported status: ${gate.status}`);
    }
  }
}

function strongestSupportedClaim(requiredGates) {
  const verified = new Set(requiredGates.filter((gate) => gate.status === EvidenceStatus.VERIFIED).map((gate) => gate.id));

  if (verified.has('pilot_authorization') && verified.has('protocol_freeze') && verified.has('independent_review')) {
    return 'Pilot readiness is supported within the declared gate scope.';
  }
  if (verified.has('artifact_provenance') && verified.has('automated_tests')) {
    return 'Engineering checks and artifact provenance are verified within the declared scope; pilot readiness is not established.';
  }
  if (verified.has('automated_tests')) {
    return 'Automated software checks are verified within the declared scope; broader readiness is not established.';
  }
  return 'The submitted evidence does not establish the readiness claim.';
}

export function evaluateClaimReadiness(scenario) {
  assertScenario(scenario);

  const requiredGates = scenario.gates.filter((gate) => gate.required !== false);
  const verifiedGates = requiredGates.filter((gate) => gate.status === EvidenceStatus.VERIFIED);
  const unresolvedGates = requiredGates.filter((gate) => gate.status !== EvidenceStatus.VERIFIED);
  const authorizationGate = requiredGates.find((gate) => gate.id === 'pilot_authorization');

  let verdict = 'READY WITHIN DECLARED SCOPE';
  if (unresolvedGates.length > 0) verdict = 'NOT READY';
  if (authorizationGate && authorizationGate.status !== EvidenceStatus.VERIFIED) verdict = 'NOT AUTHORIZED';

  const nextGate = unresolvedGates[0] ?? null;
  const coverage = requiredGates.length === 0 ? 1 : verifiedGates.length / requiredGates.length;

  return {
    claim: scenario.claim,
    verdict,
    claimSupported: unresolvedGates.length === 0,
    verifiedCount: verifiedGates.length,
    requiredCount: requiredGates.length,
    coverage,
    unresolvedGateIds: unresolvedGates.map((gate) => gate.id),
    nextGate: nextGate ? { id: nextGate.id, label: nextGate.label, status: nextGate.status } : null,
    strongestSupportedClaim: strongestSupportedClaim(requiredGates),
    caveat: 'This audit evaluates declared procedural evidence only. It does not establish empirical efficacy, factual correctness, security, or production reliability unless those are separately evidenced.',
  };
}

export function defaultPilotReadinessScenario() {
  return {
    scenarioId: 'pilot-readiness-demo-v1',
    claim: 'This system is ready for a pilot.',
    purpose: 'Demonstrate why passing software checks do not automatically imply independent review, freeze, authorization, or empirical support.',
    gates: [
      {
        id: 'automated_tests',
        label: 'Automated software checks',
        evidenceClass: 'engineering',
        status: EvidenceStatus.VERIFIED,
        required: true,
        detail: 'Tests can establish scoped implementation behavior, not permission to run a pilot.',
      },
      {
        id: 'artifact_provenance',
        label: 'Artifact identity and provenance',
        evidenceClass: 'provenance',
        status: EvidenceStatus.VERIFIED,
        required: true,
        detail: 'The evidence is bound to a known artifact or execution identity.',
      },
      {
        id: 'independent_review',
        label: 'Independent review / acceptance',
        evidenceClass: 'governance',
        status: EvidenceStatus.NOT_EXECUTED,
        required: true,
        detail: 'An independent reviewer has not yet executed and accepted the required review.',
      },
      {
        id: 'protocol_freeze',
        label: 'Protocol or release freeze',
        evidenceClass: 'governance',
        status: EvidenceStatus.NOT_ESTABLISHED,
        required: true,
        detail: 'The exact candidate or protocol boundary has not been frozen for this decision.',
      },
      {
        id: 'pilot_authorization',
        label: 'Explicit pilot authorization',
        evidenceClass: 'authorization',
        status: EvidenceStatus.NOT_GRANTED,
        required: true,
        detail: 'A passing check is not equivalent to authorization. Permission remains a separate gate.',
      },
      {
        id: 'empirical_efficacy',
        label: 'Empirical efficacy result',
        evidenceClass: 'empirical',
        status: EvidenceStatus.NOT_REQUIRED,
        required: false,
        detail: 'Efficacy is intentionally not a prerequisite for starting a properly authorized pilot; it is a later evidence class.',
      },
    ],
  };
}
