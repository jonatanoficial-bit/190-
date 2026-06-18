import assert from 'node:assert/strict';
import { avatars, ranks, units, incidents, protocolQuestions } from '../js/data/content.js';
import { validateGameContent } from '../js/core/content-validator.js';

const report = validateGameContent({ avatars, ranks, units, incidents, protocolQuestions });
assert.equal(report.ok, true, report.errors.join('\n'));
assert.ok(report.stats.incidents >= 8, 'Banco de ocorrências menor que a build original.');
assert.ok(report.stats.units >= 3, 'Recursos operacionais ausentes.');
console.log(`PASS content: ${report.stats.incidents} ocorrências, ${report.warnings.length} aviso(s).`);
