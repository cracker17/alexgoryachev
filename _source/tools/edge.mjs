// Shared headless-Edge (DevTools protocol) helper for the verification scripts.
// Fresh throwaway profile per run, and on close: kill Edge's whole process tree, then delete the profile.
// (Killing only the launcher left orphaned Edge processes that locked 100+ profiles and filled the disk, 16 GB, 2026-09.)
import { spawn, spawnSync } from "node:child_process";
import { rmSync, readdirSync } from "node:fs";

const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const BASE = process.env.SITE_BASE || "http://localhost:8123/";

export async function openEdge({ autoplay = false } = {}) {
  // sweep profiles left by earlier runs (ones still in use are locked and simply skipped)
  for (const d of readdirSync(process.env.TEMP).filter((n) => /^edge-harness-\d+$/.test(n))) {
    try { rmSync(`${process.env.TEMP}\\${d}`, { recursive: true, force: true }); } catch {}
  }
  const port = 9200 + Math.floor(Math.random() * 700);
  const profile = `${process.env.TEMP}\\edge-harness-${port}`;
  const args = ["--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--disable-gpu",
    `--user-data-dir=${profile}`, "about:blank"];
  if (autoplay) args.splice(3, 0, "--autoplay-policy=no-user-gesture-required");
  const proc = spawn(EDGE, args, { stdio: "ignore" });
  let t;
  for (let i = 0; i < 60 && !t; i++) { try { t = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((x) => x.type === "page"); } catch {} await sleep(250); }
  if (!t) { close(); throw new Error("Edge did not start"); }
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r) => (ws.onopen = r));
  let id = 0; const pending = new Map(); const logs = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    if (m.method === "Runtime.exceptionThrown") logs.push("EXC " + m.params.exceptionDetails.exception?.description?.slice(0, 200));
    if (m.method === "Runtime.consoleAPICalled" && ["error", "warning"].includes(m.params.type)) logs.push(m.params.type + " " + m.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 200));
    if (m.method === "Network.loadingFailed" && !m.params.canceled) logs.push("NETFAIL " + m.params.errorText);
    if (m.method === "Network.responseReceived" && m.params.response.status >= 400) logs.push("HTTP " + m.params.response.status + " " + m.params.response.url);
  };
  const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;
  await send("Runtime.enable"); await send("Network.enable"); await send("Page.enable");
  const go = async (url, w = 1440, h = 900, wait = 4000) => {
    await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 768 });
    await send("Page.navigate", { url: BASE + url }); await sleep(wait);
  };
  function close() {
    try { ws?.close(); } catch {}
    // Edge's launcher re-spawns the browser and exits, so /T on its PID misses the real processes.
    // Kill every process whose command line carries this run's profile path instead.
    spawnSync("taskkill", ["/PID", String(proc.pid), "/T", "/F"]);
    const tag = profile.split("\\").pop();
    spawnSync("powershell", ["-NoProfile", "-Command",
      `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${tag}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`]);
    const wait = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);   // synchronous sleep
    for (let i = 0; i < 20; i++) { try { rmSync(profile, { recursive: true, force: true }); break; } catch { wait(500); } }
  }
  return { send, ev, go, logs, close };
}
