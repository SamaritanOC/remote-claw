import { app, BrowserWindow, shell } from 'electron'
import { autoUpdater } from 'electron-updater'
import * as path from 'path'
import * as fs from 'fs'
import * as http from 'http'

const UI_PORT = 18790

let mainWindow: BrowserWindow | null = null
let uiServer: http.Server | null = null

const MIME: Record<string, string> = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
  '.svg':  'image/svg+xml',
  '.map':  'application/json',
}

function getControlUiRoot(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar.unpacked', 'control-ui')
    : path.join(__dirname, '..', '..', 'control-ui')
}

function startUiServer(): Promise<void> {
  const root = getControlUiRoot()
  return new Promise((resolve, reject) => {
    uiServer = http.createServer((req, res) => {
      const rel = req.url === '/' ? 'index.html' : req.url!.split('?')[0]
      const filePath = path.join(root, rel)
      fs.readFile(filePath, (err, data) => {
        if (err) {
          fs.readFile(path.join(root, 'index.html'), (e2, d2) => {
            if (e2) { res.writeHead(404); res.end(); return }
            res.writeHead(200, { 'Content-Type': 'text/html' })
            res.end(d2)
          })
          return
        }
        const ext = path.extname(filePath)
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' })
        res.end(data)
      })
    })
    uiServer.listen(UI_PORT, '127.0.0.1', resolve)
    uiServer.on('error', reject)
  })
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
  await startUiServer()
  mainWindow.loadURL(`http://127.0.0.1:${UI_PORT}`)
  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  createWindow()
  if (app.isPackaged) initAutoUpdater()
})

app.on('window-all-closed', () => {
  uiServer?.close()
  app.quit()
})
