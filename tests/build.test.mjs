import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUILD_INFO } from '../js/build-info.js';

assert.equal(BUILD_INFO.version, 'v0.13.0');
assert.equal(BUILD_INFO.phase, 'Fase 7 de 20');
assert.equal(BUILD_INFO.saveSchema, 5);
assert.equal(BUILD_INFO.triageSchema, 1);
assert.equal(BUILD_INFO.branchingSchema, 1);
assert.equal(BUILD_INFO.trainingSchema, 1);

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const baseCss = fs.readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const premiumCss = fs.readFileSync(new URL('../css/premium-v010.css', import.meta.url), 'utf8');
const trainingCss = fs.readFileSync(new URL('../css/training-v011.css', import.meta.url), 'utf8');
const branchingCss = fs.readFileSync(new URL('../css/branching-v012.css', import.meta.url), 'utf8');
const triageCss = fs.readFileSync(new URL('../css/triage-v013.css', import.meta.url), 'utf8');
const allCss = `${baseCss}\n${premiumCss}\n${trainingCss}\n${branchingCss}\n${triageCss}`;
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');

assert.match(html, /v0\.13\.0/);
assert.match(html, /training-v011\.css/);
assert.match(html, /branching-v012\.css/);
assert.match(html, /triage-v013\.css/);
assert.match(html, /id="triagePanel"/);
assert.match(html, /id="triagePriorityGrid"/);
assert.match(html, /id="btnSubmitTriage"/);
assert.match(html, /id="callBranchConsole"/);
assert.match(html, /id="approachSelector"/);
assert.match(html, /id="callerEmotionBadge"/);
assert.match(html, /id="screen-academy"/);
assert.match(html, /id="academyModuleGrid"/);
assert.match(html, /id="trainingCoach"/);
assert.match(html, /id="dispatchCoach"/);
assert.match(html, /id="btnAcademy"/);
assert.match(html, /languageSelector/);
assert.match(html, /btnInstallApp/);

const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual([...new Set(duplicates)], [], `IDs duplicados: ${duplicates.join(', ')}`);

const domReferences = [...appJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((match) => match[1]);
for (const id of domReferences) assert.ok(ids.includes(id), `DOM referenciado no app e ausente no HTML: ${id}`);

assert.match(trainingCss, /academy-module-grid/);
assert.match(trainingCss, /academy-option/);
assert.match(trainingCss, /training-coach/);
assert.match(branchingCss, /call-branch-console/);
assert.match(branchingCss, /approach-selector/);
assert.match(branchingCss, /caller-state-meters/);
assert.match(triageCss, /triage-priority-grid/);
assert.match(triageCss, /triage-protocol-grid/);
assert.match(allCss, /pref-high-contrast/);
assert.match(allCss, /pref-reduce-motion/);
assert.equal(manifest.icons[0].sizes, '192x192');
assert.equal(manifest.icons[1].sizes, '512x512');
assert.equal(manifest.display, 'fullscreen');
assert.match(sw, new RegExp(BUILD_INFO.buildId));
assert.match(sw, /training-v011\.css/);
assert.match(sw, /branching-v012\.css/);
assert.match(sw, /triage-v013\.css/);
assert.match(sw, /core\/call-branching\.js/);
assert.match(sw, /data\/training\.js/);
assert.match(sw, /data\/triage\.js/);

console.log('PASS build: versão, triagem, ligações ramificadas, academia, manifesto e cache sincronizados.');
