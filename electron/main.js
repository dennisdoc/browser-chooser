const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const DEV = !!process.env.NG_DEV;
const DEFAULTS = { browsers: [], rules: [], defaultBrowserId: null, delaySeconds: 2 };
const configPath = () => path.join(app.getPath('userData'), 'settings.json');

function loadConfig() {
  try { return { ...DEFAULTS, ...JSON.parse(fs.readFileSync(configPath(), 'utf8')) }; }
  catch { return structuredClone(DEFAULTS); }
}
function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(cfg, null, 2));
}

// ---------- URL routing ----------
function matches(host, pattern) {
  const p = pattern.trim().toLowerCase().replace(/^\*\./, '').replace(/^www\./, '');
  const h = host.toLowerCase().replace(/^www\./, '');
  return h === p || h.endsWith('.' + p);
}

function launch(browser, url) {
  // NEVER use shell.openExternal(url) here: we are the default browser -> infinite loop.
  const p = browser.path;
  const opts = { detached: true, stdio: 'ignore' };
  if (process.platform === 'darwin' && p.endsWith('.app')) spawn('open', ['-a', p, url], opts).unref();
  else spawn(p, [...(browser.args || []), url], opts).unref();
}

const prompts = new Map(); // webContents.id -> { url, ... }
let settingsWin = null;

function handleUrl(url) {
  let host;
  try {
    const u = new URL(url);
    if (!/^https?:$/.test(u.protocol)) return quitIfIdle();
    host = u.hostname;
  } catch { return quitIfIdle(); }

  const cfg = loadConfig();
  const byId = (id) => cfg.browsers.find((b) => b.id === id);
  const rule = cfg.rules.find((r) => matches(host, r.pattern) && byId(r.browserId));
  if (rule) { launch(byId(rule.browserId), url); return quitIfIdle(); }

  const def = byId(cfg.defaultBrowserId);
  if (!def) { openSettings(); return; } // nothing configured yet
  if (!cfg.delaySeconds) { launch(def, url); return quitIfIdle(); }
  openPrompt({ url, delay: cfg.delaySeconds, defaultBrowserId: def.id, browsers: cfg.browsers });
}

function quitIfIdle() {
  setTimeout(() => {
    if (!settingsWin && prompts.size === 0) app.quit();
  }, 400);
}

// ---------- windows ----------
function load(win, route) {
  if (DEV) win.loadURL('http://localhost:4200/#/' + route);
  else win.loadFile(path.join(__dirname, '../dist/url-router/browser/index.csr.html'), { hash: '/' + route });
}
const webPrefs = { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false };

function openSettings() {
  if (settingsWin) { settingsWin.show(); settingsWin.focus(); return; }
  settingsWin = new BrowserWindow({ width: 920, height: 720, title: 'URL Router', autoHideMenuBar: true, webPreferences: webPrefs });
  load(settingsWin, 'settings');
  settingsWin.on('closed', () => { settingsWin = null; quitIfIdle(); });
}

function openPrompt(data) {
  const win = new BrowserWindow({
    width: 460, height: 360, frame: false, resizable: false, alwaysOnTop: true,
    center: true, skipTaskbar: false, webPreferences: webPrefs,
  });
  prompts.set(win.webContents.id, data);
  load(win, 'redirect');
  win.once('ready-to-show', () => { win.show(); win.focus(); }); // focus needed to detect Shift
  win.on('closed', () => { prompts.delete(win.webContents.id); quitIfIdle(); });
}

// ---------- IPC ----------
ipcMain.handle('config:get', () => loadConfig());
ipcMain.handle('config:save', (_e, cfg) => { saveConfig(cfg); return true; });

ipcMain.handle('browser:pick', async () => {
  const r = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: process.platform === 'win32' ? [{ name: 'Executables', extensions: ['exe'] }] : [],
  });
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('browser:detect', () => {
  const env = process.env;
  const PF = env['ProgramFiles'] || 'C:\\Program Files';
  const PF86 = env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const LA = env['LOCALAPPDATA'] || '';
  const W = [
    ['Google Chrome', [`${PF}\\Google\\Chrome\\Application\\chrome.exe`, `${PF86}\\Google\\Chrome\\Application\\chrome.exe`, `${LA}\\Google\\Chrome\\Application\\chrome.exe`]],
    ['Brave', [`${PF}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`, `${LA}\\BraveSoftware\\Brave-Browser\\Application\\brave.exe`]],
    ['Opera GX', [`${LA}\\Programs\\Opera GX\\opera.exe`, `${LA}\\Programs\\Opera GX\\launcher.exe`]],
    ['Opera', [`${LA}\\Programs\\Opera\\opera.exe`]],
    ['Microsoft Edge', [`${PF86}\\Microsoft\\Edge\\Application\\msedge.exe`, `${PF}\\Microsoft\\Edge\\Application\\msedge.exe`]],
    ['Firefox', [`${PF}\\Mozilla Firefox\\firefox.exe`, `${PF86}\\Mozilla Firefox\\firefox.exe`]],
  ];
  const M = [
    ['Google Chrome', ['/Applications/Google Chrome.app']],
    ['Brave', ['/Applications/Brave Browser.app']],
    ['Opera GX', ['/Applications/Opera GX.app']],
    ['Firefox', ['/Applications/Firefox.app']],
    ['Safari', ['/Applications/Safari.app']],
  ];
  const list = process.platform === 'win32' ? W : process.platform === 'darwin' ? M : [];
  return list
    .map(([name, paths]) => ({ name, path: paths.find((p) => fs.existsSync(p)) }))
    .filter((b) => b.path)
    .map((b) => ({ id: b.name.toLowerCase().replace(/\W+/g, '-'), name: b.name, path: b.path }));
});

ipcMain.handle('app:setDefault', () => {
  app.setAsDefaultProtocolClient('http');
  app.setAsDefaultProtocolClient('https');
  if (process.platform === 'win32') shell.openExternal('ms-settings:defaultapps');
  return true;
});

ipcMain.handle('prompt:get', (e) => prompts.get(e.sender.id));
ipcMain.handle('prompt:open', (e, browserId) => {
  const data = prompts.get(e.sender.id);
  const b = data?.browsers.find((x) => x.id === browserId);
  if (b) launch(b, data.url);
  BrowserWindow.fromWebContents(e.sender)?.close();
});
ipcMain.handle('prompt:cancel', (e) => BrowserWindow.fromWebContents(e.sender)?.close());

// ---------- lifecycle ----------
const urlFromArgv = (argv) => argv.find((a) => /^https?:\/\//i.test(a));

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', (_e, argv) => {
    const url = urlFromArgv(argv);
    url ? handleUrl(url) : openSettings();
  });
  app.on('open-url', (e, url) => { e.preventDefault(); app.isReady() ? handleUrl(url) : app.once('ready', () => handleUrl(url)); }); // macOS
  app.whenReady().then(() => {
    const url = urlFromArgv(process.argv);
    url ? handleUrl(url) : openSettings();
  });
  app.on('window-all-closed', () => {}); // lifecycle handled by quitIfIdle()
}
