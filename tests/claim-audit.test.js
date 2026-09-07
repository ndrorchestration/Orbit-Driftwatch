import test from 'node:test';
import assert from 'node:assert/strict';

import {
  defaultPilotReadinessScenario,
  evaluateClaimReadiness,
  EvidenceStatus,
} from '../src/claim-audit/evaluateClaim.js';

function withStatuses(updates) {
  const scenario = defaultPilotReadinessScenario();
  scenario.gates = scenario.gates.map((gate) => ({
    ...gate,
    status: updates[gate.id] ?? gate.status,
  }));
  return scenario;
}

test('default pilot-readiness scenario fails closed and identifies the first unresolved gate', () => {
  const result = evaluateClaimReadiness(defaultPilotReadinessScenario());

  assert.equal(result.verdict, 'NOT AUTHORIZED');
  assert.equal(result.claimSupported, false);
  assert.equal(result.verifiedCount, 2);
  assert.equal(result.requiredCount, 5);
  assert.equal(result.nextGate.id, 'independent_review');
  assert.deepEqual(result.unresolvedGateIds, ['independent_review', 'protocol_freeze', 'pilot_authorization']);
  assert.match(result.strongestSupportedClaim, /Engineering checks and artifact provenance are verified/);
});

test('all required declared gates must be verified before the claim is supported', () => {
  const scenario = withStatuses({
    independent_review: EvidenceStatus.VERIFIED,
    protocol_freeze: EvidenceStatus.VERIFIED,
    pilot_authorization: EvidenceStatus.VERIFIED,
  });
  const result = evaluateClaimReadiness(scenario);

  assert.equal(result.verdict, 'READY WITHIN DECLARED SCOPE');
  assert.equal(result.claimSupported, true);
  assert.equal(result.verifiedCount, 5);
  assert.equal(result.nextGate, null);
});

test('authorization does not override missing independent review or freeze', () => {
  const scenario = withStatuses({ pilot_authorization: EvidenceStatus.VERIFIED });
  const result = evaluateClaimReadiness(scenario);

  assert.equal(result.verdict, 'NOT READY');
  assert.equal(result.claimSupported, false);
  assert.equal(result.nextGate.id, 'independent_review');
});

test('empirical efficacy is explicitly separated from pilot-readiness prerequisites', () => {
  const scenario = withStatuses({
    independent_review: EvidenceStatus.VERIFIED,
    protocol_freeze: EvidenceStatus.VERIFIED,
    pilot_authorization: EvidenceStatus.VERIFIED,
  });
  const empiricalGate = scenario.gates.find((gate) => gate.id === 'empirical_efficacy');
  const result = evaluateClaimReadiness(scenario);

  assert.equal(empiricalGate.required, false);
  assert.equal(empiricalGate.status, EvidenceStatus.NOT_REQUIRED);
  assert.equal(result.claimSupported, true);
});

test('duplicate evidence-gate identities are rejected', () => {
  const scenario = defaultPilotReadinessScenario();
  scenario.gates.push({ ...scenario.gates[0] });

  assert.throws(() => evaluateClaimReadiness(scenario), /duplicate gate id/);
});
