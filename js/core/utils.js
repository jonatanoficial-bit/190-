export function clampNumber(value, min, max, fallback = min) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export function safeInteger(value, min, max, fallback = min) {
  return Math.trunc(clampNumber(value, min, max, fallback));
}

export function safeString(value, fallback = '', maxLength = 120) {
  const text = typeof value === 'string' ? value.trim() : '';
  return (text || fallback).slice(0, maxLength);
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

export function checksumFNV1a(value) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function uniqueStrings(values, allowed = null, maxItems = 50) {
  const output = [];
  for (const value of Array.isArray(values) ? values : []) {
    if (typeof value !== 'string') continue;
    if (allowed && !allowed.has(value)) continue;
    if (!output.includes(value)) output.push(value);
    if (output.length >= maxItems) break;
  }
  return output;
}
