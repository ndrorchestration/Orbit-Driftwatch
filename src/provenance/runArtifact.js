export const RUN_ARTIFACT_SCHEMA = 'orbit-driftwatch.run.v1';

function assertRun(run) {
  if (!run || typeof run !== 'object' || typeof run.runId !== 'string') {
    throw new TypeError('A completed workflow run is required to build an artifact.');
  }
  return run;
}

/**
 * Produce a portable record of a completed run. Deterministic runs intentionally
 * omit a wall-clock timestamp and omit an empty sources field so the original
 * frozen control fixture remains byte-for-byte stable.
 */
export function buildRunArtifact(run) {
  assertRun(run);
  const artifact = {
    schemaVersion: RUN_ARTIFACT_SCHEMA,
    application: 'Orbit Driftwatch',
    artifactVersion: '0.2.0',
    runId: run.runId,
    mode: run.mode,
    provider: run.provider,
    question: run.question,
    observations: run.observations,
    metrics: run.metrics,
    orbit: run.orbit,
    traces: run.traces,
    epistemicNote: 'Workflow telemetry and evidence tags are not measures of factual truth or model quality.',
  };
  if (Array.isArray(run.sources) && run.sources.length > 0) artifact.sources = run.sources;
  return artifact;
}

export function serializeRunArtifact(run) {
  return `${JSON.stringify(buildRunArtifact(run), null, 2)}\n`;
}
