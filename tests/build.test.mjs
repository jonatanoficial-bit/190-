import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUILD_INFO } from '../js/build-info.js';

assert.equal(BUILD_INFO.version, 'v0.18.0');
assert.equal(BUILD_INFO.phase, 'Fase 12 de 20');
assert.equal(BUILD_INFO.saveSchema, 10);
assert.equal(BUILD_INFO.continuousShiftSchema, 1);
assert.equal(BUILD_INFO.fieldOperationsSchema, 1);
assert.equal(BUILD_INFO.professionalDispatchSchema, 1);
assert.equal(BUILD_INFO.resourceManagementSchema, 1);
assert.equal(BUILD_INFO.tacticalMapSchema, 1);

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const cssFiles = ['style.css','premium-v010.css','training-v011.css','branching-v012.css','triage-v013.css','tactical-map-v014.css','resource-management-v015.css','dispatch-professional-v016.css','field-operations-v017.css','continuous-shift-v018.css'];
const allCss = cssFiles.map((name)=>fs.readFileSync(new URL(`../css/${name}`, import.meta.url),'utf8')).join('\n');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const appJs = fs.readFileSync(new URL('../js/app.js', import.meta.url), 'utf8');

assert.match(html, /v0\.18\.0/);
for (const name of cssFiles.slice(1)) assert.match(html,new RegExp(name.replaceAll('.','\\.')));
for (const id of ['resourceCommandPanel','dispatchCommandPanel','fieldOperationPanel','continuousShiftPanel','liveQueueList','continuousShiftLobbyPanel','resultShiftPanel','screen-shiftreport','shiftReportMetrics','shiftReportCalls','btnShiftReportLobby','triagePanel','routePlanner','academyModuleGrid']) assert.match(html,new RegExp(`id=["']${id}["']`));
const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match)=>match[1]);
const duplicates = ids.filter((id,index)=>ids.indexOf(id)!==index);
assert.deepEqual([...new Set(duplicates)],[],`IDs duplicados: ${duplicates.join(', ')}`);
const domReferences = [...appJs.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map((match)=>match[1]);
for (const id of domReferences) assert.ok(ids.includes(id),`DOM referenciado no app e ausente no HTML: ${id}`);
for (const selector of ['.field-operation-panel','.continuous-shift-panel','.queue-call-card','.shift-report-grid','.pref-high-contrast','.pref-reduce-motion']) assert.ok(allCss.includes(selector),`Selector ausente: ${selector}`);
assert.equal(manifest.display,'fullscreen');
assert.equal(manifest.icons[0].sizes,'192x192');
assert.equal(manifest.icons[1].sizes,'512x512');
assert.match(sw,new RegExp(BUILD_INFO.buildId));
for (const path of ['continuous-shift-v018.css','data/continuous-shift.js','field-operations-v017.css','data/field-operations.js']) assert.match(sw,new RegExp(path.replaceAll('.','\\.')));
console.log('PASS build: v0.18.0, plantão contínuo, save v10, PWA, DOM e cache sincronizados.');
