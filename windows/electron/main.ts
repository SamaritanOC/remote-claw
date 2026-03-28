import { app, BrowserWindow, shell, dialog } from 'electron'
import { autoUpdater } from 'electron-updater'
import { spawn, ChildProcess } from 'child_process'
import * as path from 'path'
import * as net from 'net'

const GATEWAY_PORT = 18789
const GATEWAY_ORIGIN = `http://127.0.0.1:${GATEWAY_PORT}`

let mainWindow: BrowserWindow | null = null
let nextServer: ChildProcess | null = null

function initAutoUpdater() {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update available',
      message: 'A new version of OC Dashporter is downloading in the background. You will be notified when it is ready to install.'
    })
  })

  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update ready',
      message: 'Update downloaded. OC Dashporter will update when you next quit the app.',
      buttons: ['Restart now', 'Later']
    }).then(result => {
      if (result.response === 0) autoUpdater.quitAndInstall()
    })
  })

  autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err)
  })

  autoUpdater.checkForUpdatesAndNotify()
}

function getUnpackedPath(): string {
  // asarUnpack'd files live in app.asar.unpacked alongside the asar
  return path.join(process.resourcesPath, 'app.asar.unpacked')
}

function isPortListening(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const sock = new net.Socket()
    sock.setTimeout(300)
    sock.on('connect', () => { sock.destroy(); resolve(true) })
    sock.on('error', () => resolve(false))
    sock.on('timeout', () => resolve(false))
    sock.connect(port, '127.0.0.1')
  })
}

async function waitForPort(port: number, timeoutMs = 60000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    if (await isPortListening(port)) return
    await new Promise(r => setTimeout(r, 500))
  }
  throw new Error(`Next.js server did not start within ${timeoutMs / 1000}s`)
}

function startNextServer(): Promise<void> {
  const appRoot = getUnpackedPath()
  // Use Electron's own Node.js runtime with ELECTRON_RUN_AS_NODE=1 — avoids
  // shell quoting issues when the install path contains spaces on Windows
  const nextEntry = path.join(appRoot, 'node_modules', 'next', 'dist', 'bin', 'next')

  nextServer = spawn(process.execPath, [nextEntry, 'start', '-H', '127.0.0.1', '-p', String(GATEWAY_PORT)], {
    cwd: appRoot,
    env: { ...process.env, NODE_ENV: 'production', ELECTRON_RUN_AS_NODE: '1' }
  })

  nextServer.stdout?.on('data', d => console.log('[next]', d.toString().trim()))
  nextServer.stderr?.on('data', d => console.error('[next]', d.toString().trim()))
  nextServer.on('error', err => console.error('Failed to start Next.js server:', err))

  return waitForPort(GATEWAY_PORT)
}

async function createWindow() {
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
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
    }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const target = new URL(url)
    const allowed = new URL(GATEWAY_ORIGIN)
    if (target.origin !== allowed.origin) {
      event.preventDefault()
      shell.openExternal(url)
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.setMenuBarVisibility(false)

  if (app.isPackaged) {
    await startNextServer()
  }

  mainWindow.loadURL(GATEWAY_ORIGIN)
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  createWindow()
  initAutoUpdater()
})

app.on('window-all-closed', () => {
  nextServer?.kill()
  app.quit()
})
