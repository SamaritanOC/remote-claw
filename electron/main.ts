import { app, BrowserWindow, shell, net, protocol } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as fs from 'fs'

let mainWindow: BrowserWindow | null = null

function getControlUiRoot(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'control-ui')
    : path.join(__dirname, '..', 'control-ui')
}

function initAutoUpdater() {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.on('error', (err) => console.error('Auto-updater error:', err))
  autoUpdater.checkForUpdatesAndNotify()
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
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.setMenuBarVisibility(false)
  mainWindow.loadURL('app://dashporter/index.html')
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const url = new URL(request.url)
    const filePath = path.join(getControlUiRoot(), url.pathname.replace(/^\//, ''))
    if (!fs.existsSync(filePath)) {
      return new Response('Not found', { status: 404 })
    }
    return net.fetch(`file://${filePath}`)
  })

  createWindow()

  if (app.isPackaged) {
    initAutoUpdater()
  }
})

app.on('window-all-closed', () => app.quit())
