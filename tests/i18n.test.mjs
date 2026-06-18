import assert from 'node:assert/strict';
import { avatars, ranks, units, incidents, protocolQuestions } from '../js/data/content.js';
import { TRANSLATIONS, SUPPORTED_LOCALES } from '../js/i18n/translations.js';
import { localizeGameContent, validateContentTranslations } from '../js/i18n/content-translations.js';

const base = { avatars, ranks, units, incidents, protocolQuestions };

function flattenKeys(value, prefix = '') {
  const output = [];
  for (const [key, item] of Object.entries(value || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (item && typeof item === 'object' && !Array.isArray(item)) output.push(...flattenKeys(item, path));
    else output.push(path);
  }
  return output.sort();
}
const baseUiKeys = flattenKeys(TRANSLATIONS['pt-BR']);
for (const locale of SUPPORTED_LOCALES) {
  assert.deepEqual(flattenKeys(TRANSLATIONS[locale]), baseUiKeys, `Catálogo de UI incompleto: ${locale}`);
}
const report = validateContentTranslations(base, SUPPORTED_LOCALES);
assert.equal(report.ok, true, report.missing.join('\n'));
assert.deepEqual(SUPPORTED_LOCALES, ['pt-BR','en-US','es-419']);
for (const locale of SUPPORTED_LOCALES) {
  assert.ok(TRANSLATIONS[locale], `UI locale ausente: ${locale}`);
  const localized = localizeGameContent(base, locale);
  assert.equal(localized.incidents.length, incidents.length);
  assert.equal(localized.protocolQuestions.length, protocolQuestions.length);
  for (const incident of localized.incidents) {
    assert.ok(incident.title && incident.callerOpening && incident.mapChips.length);
    for (const questionId of incident.idealQuestions) assert.ok(incident.questionReplies[questionId]);
  }
}
assert.notEqual(localizeGameContent(base,'en-US').incidents[0].title, incidents[0].title);
assert.notEqual(localizeGameContent(base,'es-419').units[0].name, units[0].name);
console.log(`PASS i18n: ${SUPPORTED_LOCALES.length} idiomas e ${incidents.length} ocorrências validadas.`);
