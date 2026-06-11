import assert from 'node:assert/strict';
import fs from 'node:fs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../css/premium-v010.css', import.meta.url), 'utf8');

const requiredScreens = ['home', 'profile', 'lobby', 'shift', 'dispatch', 'manual', 'config', 'result'];
for (const screen of requiredScreens) assert.match(html, new RegExp(`id=["']screen-${screen}["']`));

const criticalSelectors = [
  '.topbar', '.panel', '.btn', '.avatar-card', '.shift-panel', '.dispatch-map',
  '.unit-card', '.result-score', '.build-footer', '.system-toast', '.recovery-card'
];
for (const selector of criticalSelectors) assert.ok(css.includes(selector), `Selector visual ausente: ${selector}`);

const removedAssets = [
  'assets/backgrounds/bg-home-hero-clean.png',
  'assets/backgrounds/bg-home-hero-clean2.png',
  'assets/ui/ui-panel-kit.png'
];
for (const asset of removedAssets) assert.equal(fs.existsSync(new URL(`../${asset}`, import.meta.url)), false, `Asset obsoleto ainda presente: ${asset}`);

console.log('PASS visual structure: telas, componentes premium e limpeza de assets validados.');
