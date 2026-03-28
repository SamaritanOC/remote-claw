import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  saveGatewayUrl: (url: string): Promise<void> =>
    ipcRenderer.invoke('save-gateway-url', url)
})
