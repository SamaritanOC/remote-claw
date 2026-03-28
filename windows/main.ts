import { app, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import * as fs from 'fs'
import * as path from 'path'

let mainWindow: BrowserWindow | null = null

interface Config {
  gatewayUrl?: string
}

function getConfigPath(): string {
  return path.join(app.getPath('userData'), 'config.json')
}

function loadConfig(): Config {
  try {
    return JSON.parse(fs.readFileSync(getConfigPath(), 'utf-8')) as Config
  } catch {
    return {}
  }
}

function saveConfig(config: Config): void {
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), { mode: 0o600 })
}

const SETUP_HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'">
  <title>OC Dashporter — Setup</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f0f0f;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
    }
    .card {
      background: #1a1a1a;
      border: 1px solid #2a2a2a;
      border-radius: 12px;
      padding: 40px;
      width: 480px;
    }
    h1 { font-size: 20px; font-weight: 600; margin-bottom: 8px; }
    p { font-size: 14px; color: #888; line-height: 1.6; margin-bottom: 28px; }
    label { display: block; font-size: 13px; color: #aaa; margin-bottom: 6px; }
    input {
      width: 100%;
      background: #111;
      border: 1px solid #333;
      border-radius: 6px;
      color: #fff;
      font-size: 14px;
      padding: 10px 12px;
      outline: none;
      margin-bottom: 20px;
      transition: border-color 0.15s;
    }
    input:focus { border-color: #555; }
    button {
      width: 100%;
      background: #2563eb;
      border: none;
      border-radius: 6px;
      color: #fff;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      padding: 10px;
      transition: background 0.15s;
    }
    button:hover:not(:disabled) { background: #1d4ed8; }
    button:disabled { opacity: 0.6; cursor: default; }
    .error {
      color: #f87171;
      font-size: 13px;
      margin-top: 12px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>OC Dashporter</h1>
    <p>Enter your OpenClaw gateway URL to get started. This is typically your Tailscale hostname or IP address.</p>
    <label for="url">Gateway URL</label>
    <input id="url" type="url" placeholder="https://your-machine.taila5fee6.ts.net" autofocus />
    <button id="connect">Connect</button>
    <div class="error" id="error"></div>
  </div>
  <script>
    const btn = document.getElementById('connect')
    const input = document.getElementById('url')
    const err = document.getElementById('error')

    async function connect() {
      err.style.display = 'none'
      const raw = input.value.trim()
      if (!raw) {
        err.textContent = 'Please enter a gateway URL.'
        err.style.display = 'block'
        return
      }
      let url
      try {
        url = new URL(raw).href.replace(/\\/$/, '')
      } catch {
        err.textContent = 'Invalid URL — make sure to include https://'
        err.style.display = 'block'
        return
      }
      btn.textContent = 'Connecting\u2026'
      btn.disabled = true
      try {
        await window.electronAPI.saveGatewayUrl(url)
      } catch (e) {
        err.textContent = 'Could not save: ' + (e.message || e)
        err.style.display = 'block'
        btn.textContent = 'Connect'
        btn.disabled = false
      }
    }

    btn.addEventListener('click', connect)
    input.addEventListener('keydown', e => { if (e.key === 'Enter') connect() })
  </script>
</body>
</html>`

function showSetupPage(): void {
  if (!mainWindow) return
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(SETUP_HTML))
}

async function createWindow(): Promise<void> {
  const config = loadConfig()

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: 'OC Dashporter',
    backgroundColor: '#0f0f0f',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  mainWindow.setMenuBarVisibility(false)

  if (config.gatewayUrl) {
    mainWindow.loadURL(config.gatewayUrl)
  } else {
    showSetupPage()
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

// IPC: renderer submits gateway URL from the setup page
ipcMain.handle('save-gateway-url', (_event, url: string) => {
  saveConfig({ gatewayUrl: url })
  mainWindow?.loadURL(url)
})

// Ctrl+Shift+, — change gateway URL (e.g. moved to a different Tailscale node)
app.whenReady().then(() => {
  createWindow()
  globalShortcut.register('CommandOrControl+Shift+,', () => {
    showSetupPage()
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => app.quit())
