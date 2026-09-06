export const MAX_UI_ERROR_CHARS = 240;

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function boundedErrorMessage(error, maxChars = MAX_UI_ERROR_CHARS) {
  const raw = error instanceof Error ? error.message : String(error ?? 'Workflow failed.');
  const normalized = raw.replace(/\s+/g, ' ').trim() || 'Workflow failed.';
  if (!Number.isInteger(maxChars) || maxChars < 32 || maxChars > 2000) {
    throw new TypeError('maxChars must be an integer between 32 and 2000.');
  }
  return normalized.length <= maxChars
    ? normalized
    : `${normalized.slice(0, maxChars - 1)}…`;
}
