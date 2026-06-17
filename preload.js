const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('scrawlAPI', {
  onToggleOverlay: (callback) => {
    ipcRenderer.on('overlay-toggle', (_event, visible) => callback(visible));
  },
  closeApp: () => {
    ipcRenderer.send('close-app');
  },
  captureScreen: () => {
    return ipcRenderer.invoke('capture-screen');
  },
});
