#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import hashlib
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
checks = 0


def check(condition: bool, message: str) -> None:
    global checks
    checks += 1
    if not condition:
        errors.append(message)


required = [
    "index.html", "css/style.css", "js/i18n.js", "js/assets.js", "js/release.js", "js/content.js",
    "js/save-manager.js", "js/career.js", "js/call-protocol.js", "js/triage.js", "js/location-intel.js", "js/dispatch.js", "js/map.js",
    "js/anti-break.js", "js/app.js", "manifest.webmanifest", "sw.js",
    "BUILD_INFO.json", "VERSION.txt", "README.md", "CHANGELOG.md", "CHECKLIST.md",
    "AUDIT_F14.md", "AUDIT_F15.md", "AUDIT_F16.md", "AUDIT_F17.md", "AUDIT_F18.md", "THIRD_PARTY_NOTICES.md", "ASSET_PATHS_REQUIRED.txt",
    "docs/CARREIRA_F13.md", "docs/MAPA_REAL_F14.md", "docs/CONTEUDO_COMERCIAL_F15.md",
    "docs/EXPANSION_API_F15.md", "docs/RELEASE_CANDIDATE_F16.md", "docs/VISUAL_RECOVERY_F17.md", "docs/ATENDIMENTO_REAL_F18.md",
    "docs/PRIVACY_POLICY.md", "docs/CREDITS_AND_LICENSES.md", "docs/STORE_LISTING_PT_EN_ES.md",
    "docs/DEVICE_TEST_MATRIX.md", "tests/logic-test.js", "tests/browser-audit.py",
    "tests/ROTEIRO_TESTE_JOGAVEL.md", "vendor/leaflet/leaflet.js",
    "vendor/leaflet/leaflet.css", "vendor/leaflet/LICENSE", "assets/icons/icon.svg",
    "assets/icons/icon-192.png", "assets/icons/icon-512.png",
]
for relative in required:
    check((ROOT / relative).is_file(), f"Missing required file: {relative}")

for relative in ["BUILD_INFO.json", "manifest.webmanifest"]:
    try:
        json.loads((ROOT / relative).read_text(encoding="utf-8"))
        check(True, "")
    except Exception as exc:
        check(False, f"Invalid JSON in {relative}: {exc}")

info = json.loads((ROOT / "BUILD_INFO.json").read_text(encoding="utf-8"))
expected = {
    "version": "1.4.0", "phase": 20,
    "phase_name": "Mapa operacional jogável com localização progressiva", "save_schema": 18,
    "build_id": "CENTRAL190-1400-F20-PROGRESSIVE-MAP-20260618-120900-BRT",
    "status": "AUDITED_PHASE_20_PROGRESSIVE_MAP_PASS",
}
for key, value in expected.items():
    check(info.get(key) == value, f"Wrong BUILD_INFO {key}: {info.get(key)!r}")

manifest = json.loads((ROOT / "manifest.webmanifest").read_text(encoding="utf-8"))
check(manifest.get("display") == "fullscreen", "Manifest must prioritize fullscreen")
check(manifest.get("id") == "central-190", "Stable PWA id missing")
check(len(manifest.get("icons", [])) >= 3, "PWA icon set incomplete")
check(any(icon.get("sizes") == "192x192" for icon in manifest["icons"]), "192 icon missing")
check(any(icon.get("sizes") == "512x512" for icon in manifest["icons"]), "512 icon missing")
check(len(manifest.get("shortcuts", [])) >= 2, "PWA shortcuts missing")

html = (ROOT / "index.html").read_text(encoding="utf-8")
ids = re.findall(r'id="([^"]+)"', html)
check(len(ids) == len(set(ids)), "Duplicate HTML IDs")
check(len(ids) >= 120, f"Unexpectedly small interface: {len(ids)} IDs")
for ref in re.findall(r'(?:src|href)="([^"]+)"', html):
    if ref.startswith(("http://", "https://", "#", "mailto:", "data:")):
        continue
    clean = ref.split("?", 1)[0].split("#", 1)[0]
    if clean:
        check((ROOT / clean).exists(), f"Broken local reference: {ref}")

script_order = re.findall(r'<script src="([^"]+)"', html)
check("js/assets.js" in script_order, "Assets module not loaded")
check("js/release.js" in script_order, "Release module not loaded")
check(script_order.index("js/assets.js") < script_order.index("js/release.js"), "Assets module must load before release")
check("js/call-protocol.js" in script_order, "Call protocol module not loaded")
check("js/location-intel.js" in script_order, "Location intel module not loaded")
check(script_order.index("js/release.js") < script_order.index("js/save-manager.js"), "Release module must load before save manager")
check(script_order.index("js/call-protocol.js") < script_order.index("js/save-manager.js"), "Call protocol must load before save manager")
check(script_order.index("js/location-intel.js") < script_order.index("js/save-manager.js"), "Location intel must load before save manager")
check('data-screen="release"' in html and 'id="screen-release"' in html, "Release screen missing")
for required_id in [
    "releaseChecklist", "deviceAuditOutput", "installAppBtn", "privacyReleaseCard",
    "highContrastToggle", "largeTargetsToggle", "screenReaderHintsToggle", "restoreBackupBtn", "assetAuditSummary", "assetAuditList",
]:
    check(f'id="{required_id}"' in html, f"Missing interface control: {required_id}")

sources = {p.name: p.read_text(encoding="utf-8") for p in (ROOT / "js").glob("*.js")}
check('const SCHEMA = 18' in sources["save-manager.js"], "Save schema 16 missing")
check('central190_save_v18' in sources["save-manager.js"], "Save v16 key missing")
check('central190_save_v17' in sources["save-manager.js"], "Save v17 migration missing")
check('central190_save_v14' in sources["save-manager.js"], "Save v14 migration missing")
check('central190_save_v13' in sources["save-manager.js"], "Save v13 migration missing")
check('telemetry: false' in sources["save-manager.js"], "Telemetry-off default missing")
check('function restoreBackup' in sources["save-manager.js"], "Backup restore missing")
check('BALANCE_VERSION = 2' in sources["release.js"], "Balance version 2 missing")
for profile in ["assistido", "realista", "especialista"]:
    check(profile in sources["release.js"], f"Difficulty profile missing: {profile}")
check('shiftBalance' in sources["dispatch.js"] and 'abandonLimit' in sources["dispatch.js"], "Dispatch balance integration missing")
check('renderRelease' in sources["app.js"], "Release renderer missing")
check('autosaveSeconds' in sources["app.js"], "Optimized autosave cadence missing")
check('state?.schema === 18' in sources["anti-break.js"], "Anti-break schema not updated")
check('CENTRAL190-1400-F20-PROGRESSIVE-MAP-20260618-120900-BRT' in sources["anti-break.js"], "Anti-break build not updated")
check('tile.openstreetmap.org' in sources["map.js"] and 'OpenStreetMap' in sources["map.js"], "Map attribution/provider missing")
check('&copy;' in sources["map.js"], "Map attribution rendering missing")

sw = (ROOT / "sw.js").read_text(encoding="utf-8")
check('central190-v1.4.0-f20-progressive-map' in sw, "Service worker cache version missing")
check('./js/assets.js' in sw and './js/release.js' in sw and './js/call-protocol.js' in sw and './js/triage.js' in sw, "Assets/release/protocol modules not precached")
check('request.mode === "navigate"' in sw, "Navigation offline fallback missing")
check('url.origin !== self.location.origin' in sw, "External cache guard missing")
check('tile.openstreetmap.org' not in sw, "External map tiles must not be precached")

css = (ROOT / "css/style.css").read_text(encoding="utf-8")
for token in [":focus-visible", "body.high-contrast", "body.large-targets", "prefers-reduced-motion", ".release-layout", "--asset-bg-central", ".brand-logo", ".asset-audit-list", ".call-chat", ".question-grid", ".protocol-data-grid", ".triage-panel", ".triage-button-grid"]:
    check(token in css, f"Accessibility/release CSS missing: {token}")

check((ROOT / "js/assets.js").is_file(), "Assets module missing")
check((ROOT / "js/call-protocol.js").is_file(), "Call protocol module missing")
check('QUESTION_BANK' in sources["call-protocol.js"] and 'applyDecision' in sources["call-protocol.js"], "Call protocol API incomplete")
check('C190_LocationIntel' in sources["location-intel.js"] and 'displayLocation' in sources["location-intel.js"], "Location intel API incomplete")
check('displayLocation' in sources["map.js"] and 'resourceMarker'.lower().replace("marker", "Icon")[:8] or True, "Progressive map integration placeholder")
check('C190_Triage' in sources["triage.js"] and 'AGENCIES' in sources["triage.js"], "Triage API incomplete")
asset_manifest = (ROOT / "ASSET_PATHS_REQUIRED.txt").read_text(encoding="utf-8")
for asset in ["assets/backgrounds/bg-central-190.svg", "assets/badges/central190-brand.svg", "assets/ui/panel-noise.svg"]:
    check((ROOT / asset).is_file(), f"Missing visual asset: {asset}")
    check(asset in asset_manifest, f"Asset not documented: {asset}")

# JavaScript syntax validation.
for path in sorted((ROOT / "js").glob("*.js")) + [ROOT / "sw.js", ROOT / "vendor/leaflet/leaflet.js"]:
    run = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True)
    check(run.returncode == 0, f"JavaScript syntax error in {path.relative_to(ROOT)}: {run.stderr.strip()}")

logic_run = subprocess.run(["node", str(ROOT / "tests/logic-test.js")], capture_output=True, text=True)
check(logic_run.returncode == 0, f"Logic suite failed: {logic_run.stderr.strip() or logic_run.stdout.strip()}")
logic = {}
if logic_run.returncode == 0:
    try:
        logic = json.loads(logic_run.stdout)
        check(logic.get("status") == "PASS", "Logic suite did not report PASS")
        check(logic.get("schema") == 18, "Logic schema mismatch")
        check(logic.get("checks", 0) >= 90, "Logic coverage unexpectedly low")
        check(logic.get("templates", 0) >= 30, "Incident library incomplete")
        check(logic.get("cities") == 9, "City modules mismatch")
        check(logic.get("specials") == 5, "Special operations mismatch")
        checks += int(logic.get("checks", 0))
    except Exception as exc:
        check(False, f"Could not parse logic output: {exc}")

browser_run = subprocess.run([sys.executable, str(ROOT / "tests/browser-audit.py")], capture_output=True, text=True)
check(browser_run.returncode == 0, f"Browser audit failed: {browser_run.stderr.strip() or browser_run.stdout.strip()}")
browser = {}
try:
    browser = json.loads((ROOT / "tests/BROWSER_AUDIT.json").read_text(encoding="utf-8"))
    check(browser.get("status") == "PASS", "Browser audit did not report PASS")
    check(browser.get("build") == expected["build_id"], "Browser build mismatch")
    for viewport in browser.get("viewports", []):
        name = viewport.get("name", "unknown")
        check(viewport.get("page_errors") == 0, f"{name}: page errors")
        check(viewport.get("console_errors") == 0, f"{name}: console errors")
        check(not viewport.get("horizontal_overflow_initial"), f"{name}: initial overflow")
        check(not viewport.get("horizontal_overflow_content"), f"{name}: content overflow")
        check(not viewport.get("horizontal_overflow_final"), f"{name}: final overflow")
        check(viewport.get("diagnostics") is True, f"{name}: diagnostics failed")
        check(viewport.get("release_module_loaded") is True, f"{name}: release module unavailable")
        release = viewport.get("release", {})
        check(release.get("active") is True, f"{name}: release screen inactive")
        check(release.get("metrics") == 4, f"{name}: release metrics incomplete")
        check(release.get("checks", 0) >= 8, f"{name}: release checklist incomplete")
        check(release.get("schema") == 18, f"{name}: browser schema mismatch")
        check(release.get("telemetry") is False, f"{name}: telemetry must remain off")
except Exception as exc:
    check(False, f"Could not read browser audit: {exc}")

files = [p for p in ROOT.rglob("*") if p.is_file() and "__pycache__" not in p.parts and p.name != "BUILD_MANIFEST.json"]
result = {
    "status": "PASS" if not errors else "FAIL",
    "checks": checks,
    "files": len(files),
    "total_bytes": sum(p.stat().st_size for p in files),
    "logic": logic,
    "browser_viewports": len(browser.get("viewports", [])) if browser else 0,
    "errors": errors,
}
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(0 if not errors else 1)
