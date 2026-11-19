const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  getConfig: () => ipcRenderer.invoke('config:get'),
  saveConfig: (c) => ipcRenderer.invoke('config:save', c),
  pickExe: () => ipcRenderer.invoke('browser:pick'),
  detectBrowsers: () => ipcRenderer.invoke('browser:detect'),
  setDefault: () => ipcRenderer.invoke('app:setDefault'),
  getPrompt: () => ipcRenderer.invoke('prompt:get'),
  promptOpen: (id) => ipcRenderer.invoke('prompt:open', id),
  promptCancel: () => ipcRenderer.invoke('prompt:cancel'),
});
