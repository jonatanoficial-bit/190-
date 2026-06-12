import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const premiumCss = fs.readFileSync(new URL('../css/premium-v010.css', import.meta.url), 'utf8');
const trainingCss = fs.readFileSync(new URL('../css/training-v011.css', import.meta.url), 'utf8');
const branchingCss = fs.readFileSync(new URL('../css/branching-v012.css', import.meta.url), 'utf8');
const triageCss = fs.readFileSync(new URL('../css/triage-v013.css', import.meta.url), 'utf8');
const css = `${premiumCss}\n${trainingCss}\n${branchingCss}\n${triageCss}`;

const requiredScreens = ['home', 'profile', 'lobby', 'shift', 'dispatch', 'academy', 'manual', 'config', 'result'];
for (const screen of requiredScreens) assert.match(html, new RegExp(`id=["']screen-${screen}["']`));

const criticalSelectors = [
  '.topbar', '.panel', '.btn', '.avatar-card', '.shift-panel', '.dispatch-map', '.unit-card',
  '.result-score', '.build-footer', '.system-toast', '.recovery-card', '.academy-module-grid',
  '.academy-lesson', '.academy-option', '.training-coach', '.call-branch-console', '.approach-selector', '.caller-state-meters', '.triage-panel', '.triage-priority-grid', '.triage-protocol-grid'
];
for (const selector of criticalSelectors) assert.ok(css.includes(selector), `Selector visual ausente: ${selector}`);

const academyIds = ['academyProgressFill','academyModuleGrid','academyLesson','academyOptions','btnAcademyContinue','btnToggleAssistance','callBranchConsole','approachSelector','callerEmotionBadge','intelStatus','triagePanel','triagePriorityGrid','triageNatureGrid','triageProtocolGrid','btnSubmitTriage'];
for (const id of academyIds) assert.match(html, new RegExp(`id=["']${id}["']`));

console.log('PASS visual structure: telas premium, academia, console ramificado e triagem responsiva validados.');
