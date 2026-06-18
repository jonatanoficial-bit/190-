#!/usr/bin/env python3
from __future__ import annotations
import base64
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile
import threading
import time
import urllib.request
import http.server
import functools
import websocket

ROOT = Path(__file__).resolve().parents[1]
URL = "about:blank"


def data_uri(relative: str) -> str:
    path = ROOT / relative
    mime = "image/svg+xml" if path.suffix.lower() == ".svg" else "image/png" if path.suffix.lower() == ".png" else "application/octet-stream"
    return "data:" + mime + ";base64," + base64.b64encode(path.read_bytes()).decode("ascii")

def inline_asset_urls(text: str) -> str:
    replacements = [
        "assets/badges/central190-brand.svg",
        "assets/backgrounds/bg-central-190.svg",
        "assets/backgrounds/bg-dashboard.svg",
        "assets/backgrounds/bg-dispatch.svg",
        "assets/backgrounds/bg-map.svg",
        "assets/backgrounds/bg-career.svg",
        "assets/backgrounds/bg-settings.svg",
        "assets/ui/panel-noise.svg",
        "assets/ui/topbar-glow.svg",
        "assets/ui/radio-waves.svg",
        "assets/illustrations/operator-desk.svg",
    ]
    for rel in replacements:
        uri = data_uri(rel)
        text = text.replace("../" + rel, uri).replace(rel, uri)
    return text


def build_inline_html() -> str:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    html = html.replace("<head>", f"<head><base href=\"{ROOT.as_uri()}/\">")
    html = inline_asset_urls(html)
    html = html.replace(
        '<link rel="stylesheet" href="vendor/leaflet/leaflet.css" />',
        '<style>' + (ROOT / "vendor/leaflet/leaflet.css").read_text(encoding="utf-8") + '</style>',
    )
    html = html.replace(
        '<link rel="stylesheet" href="css/style.css" />',
        '<style>' + inline_asset_urls((ROOT / "css/style.css").read_text(encoding="utf-8")) + '</style>',
    )
    html = html.replace('<link rel="manifest" href="manifest.webmanifest" />', '')
    html = html.replace('<link rel="icon" href="assets/icons/icon.svg" type="image/svg+xml" />', '')
    for src in [
        "vendor/leaflet/leaflet.js",
        "js/i18n.js",
        "js/assets.js",
        "js/release.js",
        "js/content.js",
        "js/call-protocol.js",
        "js/triage.js",
        "js/location-intel.js",
        "js/save-manager.js",
        "js/career.js",
        "js/dispatch.js",
        "js/map.js",
        "js/anti-break.js",
        "js/app.js",
    ]:
        code = (ROOT / src).read_text(encoding="utf-8").replace("</script", "<\\/script")
        html = html.replace(f'<script src="{src}"></script>', f'<script>\n{code}\n</script>')
    return html


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


class CDP:
    def __init__(self, ws_url: str):
        self.ws = websocket.create_connection(ws_url, timeout=10)
        self.next_id = 1
        self.events = []

    def command(self, method: str, params: dict | None = None, timeout: float = 12):
        msg_id = self.next_id
        self.next_id += 1
        self.ws.send(json.dumps({"id": msg_id, "method": method, "params": params or {}}))
        deadline = time.time() + timeout
        while time.time() < deadline:
            raw = self.ws.recv()
            message = json.loads(raw)
            if message.get("id") == msg_id:
                if "error" in message:
                    raise RuntimeError(f"CDP {method}: {message['error']}")
                return message.get("result", {})
            self.events.append(message)
        raise TimeoutError(method)

    def evaluate(self, expression: str):
        result = self.command(
            "Runtime.evaluate",
            {"expression": expression, "returnByValue": True, "awaitPromise": True},
        )
        if result.get("exceptionDetails"):
            raise RuntimeError(f"Runtime.evaluate failed: {result['exceptionDetails']}")
        return result.get("result", {}).get("value")

    def drain(self, seconds: float = 0.4):
        self.ws.settimeout(0.08)
        deadline = time.time() + seconds
        while time.time() < deadline:
            try:
                self.events.append(json.loads(self.ws.recv()))
            except Exception:
                pass
        self.ws.settimeout(10)

    def close(self):
        self.ws.close()


def wait_json(port: int, timeout: float = 12):
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/json", timeout=1) as response:
                return json.load(response)
        except Exception:
            time.sleep(0.15)
    raise RuntimeError("Chromium debugging endpoint unavailable")


def audit_viewport(name: str, width: int, height: int, mobile: bool):
    port = free_port()
    profile_dir = tempfile.mkdtemp(prefix="c190-chrome-")
    chromium = shutil.which("chromium") or shutil.which("google-chrome")
    if not chromium:
        raise RuntimeError("Chromium not found")
    process = subprocess.Popen(
        [
            chromium,
            "--headless=new",
            "--no-sandbox",
            "--disable-gpu",
            "--disable-dev-shm-usage",
            "--disable-background-networking",
            "--no-proxy-server",
            "--proxy-bypass-list=*",
            "--allow-insecure-localhost",
            "--allow-file-access-from-files",
            "--disable-component-update",
            "--disable-default-apps",
            "--no-first-run",
            "--hide-scrollbars",
            f"--remote-allow-origins=*",
            f"--remote-debugging-port={port}",
            f"--user-data-dir={profile_dir}",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    cdp = None
    try:
        targets = wait_json(port)
        page = next(item for item in targets if item.get("type") == "page")
        cdp = CDP(page["webSocketDebuggerUrl"])
        cdp.command("Page.enable")
        cdp.command("Runtime.enable")
        cdp.command("Log.enable")
        cdp.command(
            "Emulation.setDeviceMetricsOverride",
            {
                "width": width,
                "height": height,
                "deviceScaleFactor": 1,
                "mobile": mobile,
                "screenWidth": width,
                "screenHeight": height,
            },
        )
        cdp.evaluate(
            "Object.defineProperty(window, 'localStorage', {configurable:true, value:(() => {"
            "const data = {}; return {"
            "getItem:k => Object.prototype.hasOwnProperty.call(data,k) ? data[k] : null,"
            "setItem:(k,v) => { data[k] = String(v); },"
            "removeItem:k => { delete data[k]; },"
            "clear:() => { Object.keys(data).forEach(k => delete data[k]); },"
            "key:i => Object.keys(data)[i] || null,"
            "get length(){ return Object.keys(data).length; }"
            "};})()}); true;"
        )
        frame_id = cdp.command("Page.getFrameTree")["frameTree"]["frame"]["id"]
        cdp.command("Page.setDocumentContent", {"frameId": frame_id, "html": build_inline_html()})
        deadline = time.time() + 20
        stable = 0
        while time.time() < deadline:
            modules_ready = cdp.evaluate(
                "document.readyState === 'complete' && "
                "typeof window.C190_AntiBreak === 'object' && "
                "typeof window.C190_Save === 'object' && "
                "typeof window.C190_Assets === 'object' && typeof window.C190_Release === 'object' && "
                "typeof window.C190_Content === 'object' && "
                "typeof window.C190_CallProtocol === 'object' && typeof window.C190_Triage === 'object' && typeof window.C190_LocationIntel === 'object' && "
                "typeof window.C190_Dispatch === 'object'"
            )
            stable = stable + 1 if modules_ready else 0
            if stable >= 3:
                break
            time.sleep(0.25)
        if stable < 3:
            raise RuntimeError('Application modules did not become ready')
        time.sleep(0.5)

        initial = cdp.evaluate(
            """(() => ({
              title: document.title,
              horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
              leaflet: !!window.L,
              assetsModule: !!window.C190_Assets,
              assetCount: window.C190_Assets?.required?.length || 0,
              releaseModule: !!window.C190_Release,
              callProtocolModule: !!window.C190_CallProtocol,
              triageModule: !!window.C190_Triage,
              locationIntelModule: !!window.C190_LocationIntel,
              locationStages: window.C190_LocationIntel?.STAGES?.length || 0,
              triageNatureCount: window.C190_Triage?.NATURES?.length || 0,
              questionCount: window.C190_CallProtocol?.QUESTION_BANK?.length || 0,
              contentModule: !!window.C190_Content,
              cityCount: window.C190_Content?.cities?.length || 0,
              specialCount: window.C190_Content?.specialCases?.length || 0,
              diagnostics: window.C190_AntiBreak.diagnostics(window.C190_Save.load()).ok,
              diagnosticsDetail: window.C190_AntiBreak.diagnostics(window.C190_Save.load()).checks.map(c => ({name:c.name, ok:c.ok, detail:c.detail})),
              version: window.C190_Save.VERSION,
              schema: window.C190_Save.SCHEMA
            }))()"""
        )

        cdp.evaluate(
            """(() => {
              document.querySelector('#operatorName').value = 'Auditoria';
              document.querySelector('#callSign').value = 'Teste';
              document.querySelector('#careerForm').requestSubmit();
              document.querySelector('[data-screen="content"]').click();
              return true;
            })()"""
        )
        time.sleep(0.5)
        content = cdp.evaluate(
            """(() => ({
              active: document.querySelector('#screen-content').classList.contains('active'),
              challengeCards: document.querySelectorAll('.challenge-card').length,
              specialCards: document.querySelectorAll('.special-operation-card').length,
              cityCards: document.querySelectorAll('.city-module-card').length,
              expansionCards: document.querySelectorAll('.expansion-card').length,
              overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            }))()"""
        )

        cdp.evaluate(
            """(() => {
              document.querySelector('#sandboxCallCount').value = '4';
              document.querySelector('#sandboxArrivalGap').value = '6';
              document.querySelector('#launchSandboxBtn').click();
              return true;
            })()"""
        )
        time.sleep(1.4)
        sandbox = cdp.evaluate(
            """(() => {
              const state = window.C190_Save.load();
              return {
                activeScreen: document.querySelector('#screen-dispatch').classList.contains('active'),
                active: !!state.dispatch.shift?.active,
                mode: state.dispatch.shift?.mode,
                affectsCareer: state.dispatch.shift?.affectsCareer,
                callCount: state.dispatch.shift?.calls?.length || 0,
                careerShifts: state.career.totalShifts,
                statusText: document.querySelector('#shiftStatus').textContent,
                overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
              };
            })()"""
        )

        protocol = cdp.evaluate(
            """(() => {
              const state = window.C190_AppDebug.state();
              const call = state.dispatch.shift?.calls?.[0];
              if (!call) return { ok: false, reason: 'no-call' };
              call.status = 'waiting';
              state.dispatch.shift.activeCallId = null;
              window.C190_AppDebug.renderDispatch();
              document.querySelector('[data-screen="dispatch"]').click();
              const answerButton = document.querySelector(`[data-answer="${call.id}"]`);
              answerButton?.click();
              const addressButton = document.querySelector('[data-question="address"]');
              addressButton?.click();
              const situationButton = document.querySelector('[data-question="situation"]');
              situationButton?.click();
              let after = window.C190_AppDebug.state();
              let active = after.dispatch.shift.calls.find(c => c.id === call.id);
              const rec = window.C190_Triage.evaluate(active).recommended;
              document.querySelector(`[data-triage-field="nature"][data-triage-value="${rec.nature}"]`)?.click();
              document.querySelector(`[data-triage-field="priority"][data-triage-value="${rec.priority}"]`)?.click();
              document.querySelector(`[data-triage-field="agency"][data-triage-value="${rec.agency}"]`)?.click();
              after = window.C190_AppDebug.state();
              active = after.dispatch.shift.calls.find(c => c.id === call.id);
              const triageEvaluation = window.C190_Triage.evaluate(active);
              return {
                ok: !!addressButton && !!situationButton,
                questionButtons: document.querySelectorAll('[data-question]').length,
                triageButtons: document.querySelectorAll('[data-triage-field]').length,
                triageSelected: document.querySelectorAll('.triage-btn.selected').length,
                triageGrade: triageEvaluation.grade,
                triageScore: triageEvaluation.finalScore,
                chatLines: document.querySelectorAll('.chat-line').length,
                locationRevealed: !!active?.locationRevealed,
                asked: active?.protocol?.asked?.length || 0,
                mapButtonDisabled: !!document.querySelector('[data-focus-call][disabled]'),
                overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
              };
            })()"""
        )
        time.sleep(0.4)

        cdp.evaluate(
            """(() => {
              document.querySelector('[data-screen="map"]').click();
              const select = document.querySelector('#mapModeSelect');
              select.value = 'tactical';
              select.dispatchEvent(new Event('change', {bubbles:true}));
              return true;
            })()"""
        )
        time.sleep(0.6)
        tactical = cdp.evaluate("!document.querySelector('#operationsMapFallback').hidden")

        cdp.evaluate("document.querySelector('[data-screen=\"statistics\"]').click()")
        time.sleep(0.3)
        final = cdp.evaluate(
            """(() => ({
              statsActive: document.querySelector('#screen-statistics').classList.contains('active'),
              metricCount: document.querySelectorAll('#statisticsMetrics .metric-card').length,
              horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
              diagnostics: window.C190_AntiBreak.diagnostics(window.C190_Save.load()).ok,
              diagnosticsDetail: window.C190_AntiBreak.diagnostics(window.C190_Save.load()).checks.map(c => ({name:c.name, ok:c.ok, detail:c.detail}))
            }))()"""
        )

        cdp.evaluate("document.querySelector('[data-screen=\"release\"]').click(); true")
        time.sleep(0.4)
        release = cdp.evaluate(
            """(() => ({
              active: document.querySelector('#screen-release').classList.contains('active'),
              metrics: document.querySelectorAll('#releaseMetrics .metric-card').length,
              checks: document.querySelectorAll('#releaseChecklist .release-check').length,
              deviceChecks: document.querySelectorAll('#deviceAuditOutput .release-check').length,
              schema: window.C190_Save.SCHEMA,
              version: window.C190_Release.VERSION,
              balanceVersion: window.C190_Release.BALANCE_VERSION,
              telemetry: window.C190_Save.load().settings.telemetry,
              highContrastControl: !!document.querySelector('#highContrastToggle'),
              restoreBackupControl: !!document.querySelector('#restoreBackupBtn'),
              overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
            }))()"""
        )
        cdp.evaluate("document.querySelector('#toastRegion')?.replaceChildren(); true")
        shot = cdp.command("Page.captureScreenshot", {"format": "png", "captureBeyondViewport": False})
        screenshot_path = ROOT / "tests" / f"F20-{name}.png"
        screenshot_path.write_bytes(base64.b64decode(shot["data"]))
        cdp.drain(0.4)

        page_errors = sum(1 for event in cdp.events if event.get("method") == "Runtime.exceptionThrown")
        console_errors = sum(
            1
            for event in cdp.events
            if event.get("method") == "Log.entryAdded"
            and event.get("params", {}).get("entry", {}).get("level") == "error"
        )
        return {
            "name": name,
            "width": width,
            "height": height,
            "page_errors": page_errors,
            "console_errors": console_errors,
            "horizontal_overflow_initial": bool(initial["horizontalOverflow"]),
            "horizontal_overflow_content": bool(content["overflow"]),
            "horizontal_overflow_final": bool(final["horizontalOverflow"]),
            "diagnostics": bool(initial["diagnostics"] and final["diagnostics"]),
            "diagnostics_detail_initial": initial.get("diagnosticsDetail"),
            "diagnostics_detail_final": final.get("diagnosticsDetail"),
            "leaflet_loaded": bool(initial["leaflet"]),
            "assets_module_loaded": bool(initial["assetsModule"]),
            "asset_count": initial["assetCount"],
            "release_module_loaded": bool(initial["releaseModule"]),
            "call_protocol_module_loaded": bool(initial["callProtocolModule"]),
            "question_count": initial["questionCount"],
            "content_module_loaded": bool(initial["contentModule"]),
            "city_modules": initial["cityCount"],
            "special_operations": initial["specialCount"],
            "content_screen": content,
            "sandbox": sandbox,
            "protocol": protocol,
            "tactical_fallback_visible_after_force": bool(tactical),
            "statistics": final,
            "release": release,
            "screenshot": str(screenshot_path.relative_to(ROOT)),
        }
    finally:
        if cdp:
            try:
                cdp.close()
            except Exception:
                pass
        process.terminate()
        try:
            process.wait(timeout=4)
        except subprocess.TimeoutExpired:
            process.kill()
        shutil.rmtree(profile_dir, ignore_errors=True)


def main():
    viewports = [
        audit_viewport("desktop", 1366, 768, False),
        audit_viewport("mobile", 390, 844, True),
    ]
    errors = []
    for item in viewports:
        if item["page_errors"] or item["console_errors"]:
            errors.append(f"{item['name']}: browser errors")
        if item["horizontal_overflow_initial"] or item["horizontal_overflow_content"] or item["horizontal_overflow_final"]:
            errors.append(f"{item['name']}: horizontal overflow")
        if not item["diagnostics"]:
            errors.append(f"{item['name']}: diagnostics failed")
        if not item["leaflet_loaded"] or not item["assets_module_loaded"] or not item["content_module_loaded"] or not item["release_module_loaded"] or not item["call_protocol_module_loaded"]:
            errors.append(f"{item['name']}: required module unavailable")
        if item["city_modules"] != 9 or item["special_operations"] != 5:
            errors.append(f"{item['name']}: content counts invalid")
        if item["content_screen"]["challengeCards"] != 2 or item["content_screen"]["specialCards"] != 5 or item["content_screen"]["cityCards"] != 9:
            errors.append(f"{item['name']}: content screen incomplete")
        if not item["sandbox"]["active"] or item["sandbox"]["mode"] != "sandbox" or item["sandbox"]["affectsCareer"] is not False or item["sandbox"]["callCount"] != 4:
            errors.append(f"{item['name']}: sandbox isolation failed")
        if item["question_count"] < 12 or not item["protocol"].get("ok") or item["protocol"].get("asked", 0) < 2 or not item["protocol"].get("locationRevealed") or item["protocol"].get("overflow"):
            errors.append(f"{item['name']}: call protocol UI failed")
        if not item["tactical_fallback_visible_after_force"]:
            errors.append(f"{item['name']}: tactical fallback unavailable")
        if not item["statistics"]["statsActive"] or item["statistics"]["metricCount"] != 6:
            errors.append(f"{item['name']}: statistics screen incomplete")
        release = item["release"]
        if not release["active"] or release["metrics"] != 4 or release["checks"] < 8 or release["deviceChecks"] < 6:
            errors.append(f"{item['name']}: release center incomplete")
        if release["schema"] != 18 or release["version"] != "1.4.0" or release["balanceVersion"] != 2 or release["telemetry"] is not False:
            errors.append(f"{item['name']}: release identity/privacy mismatch")
        if release["overflow"]:
            errors.append(f"{item['name']}: release horizontal overflow")
    result = {
        "status": "PASS" if not errors else "FAIL",
        "tested_at": "2026-06-18T10:55:00-03:00",
        "build": "CENTRAL190-1400-F20-PROGRESSIVE-MAP-20260618-120900-BRT",
        "viewports": viewports,
        "errors": errors,
    }
    (ROOT / "tests" / "BROWSER_AUDIT.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if not errors else 1)


if __name__ == "__main__":
    main()
