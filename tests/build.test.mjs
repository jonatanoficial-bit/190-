import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BUILD_INFO } from '../js/build-info.js';

assert.equal(BUILD_INFO.version, 'v0.10.0');
assert.equal(BUILD_INFO.phase, 'Fase 4 de 20');
assert.equal(BUILD_INFO.saveSchema, 2);
assert.equal(BUILD_INFO.localeSchema, 1);
assert.equal(BUILD_INFO.visualSchema, 1);

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const baseCss = fs.readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const premiumCss = fs.readFileSync(new URL('../css/premium-v010.css', import.meta.url), 'utf8');
const allCss = `${baseCss}
${premiumCss}`;
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

assert.match(html, /v0\.10\.0/);
assert.match(html, /premium-v010\.css/);
assert.match(html, /ops-chrome/);
assert.match(html, /brand-sigil/);
assert.match(html, /home-ops-status/);
assert.match(html, /languageSelector/);
assert.match(html, /configLanguageSelector/);
assert.match(html, /btnLargeText/);
assert.match(html, /btnInstallApp/);

const ids = [...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]);
const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
assert.deepEqual([...new Set(duplicates)], [], `IDs duplicados: ${duplicates.join(', ')}`);

for (const key of ['topbar.mobileFirst', 'home.subtitle', 'language.ptFull', 'language.enFull', 'language.esFull']) {
  assert.match(html, new RegExp(`data-i18n(?:-subtitle)?=["']${key.replace('.', '\\.')}["']`));
}

assert.match(premiumCss, /#screen-lobby/);
assert.match(premiumCss, /#screen-shift/);
assert.match(premiumCss, /#screen-dispatch/);
assert.match(premiumCss, /@media \(min-width: 780px\)/);
assert.match(allCss, /pref-high-contrast/);
assert.match(allCss, /pref-reduce-motion/);
assert.equal(manifest.icons[0].sizes, '192x192');
assert.equal(manifest.icons[1].sizes, '512x512');
assert.equal(manifest.display, 'fullscreen');
assert.match(sw, new RegExp(BUILD_INFO.buildId));
assert.match(sw, /premium-v010\.css/);
assert.match(sw, /content-translations\.js/);

console.log('PASS build: versão, camada visual premium, acessibilidade, manifesto e cache sincronizados.');
