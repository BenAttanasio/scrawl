const { app, BrowserWindow, globalShortcut, screen, ipcMain, Tray, Menu, nativeImage, desktopCapturer } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;
let isOverlayVisible = false; // start hidden

app.disableHardwareAcceleration();

// Single-instance lock: if already running, show overlay in existing instance
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!isOverlayVisible) showOverlay();
  });
}

app.whenReady().then(() => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.size;

  mainWindow = new BrowserWindow({
    x: 0,
    y: 0,
    width: width,
    height: height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: false,
    fullscreenable: false,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    show: false, // start hidden
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(true, 'pop-up-menu');
  mainWindow.loadFile('renderer/index.html');

  // Show overlay immediately on launch
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    showOverlay();
  });

  // Prevent the window from actually closing — just hide the overlay
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      hideOverlay();
    }
  });

  // --- System tray ---
  const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'icon.ico')).resize({ width: 16, height: 16 });
  tray = new Tray(trayIcon);
  tray.setToolTip('Scrawl — Ctrl+Alt+1 to draw');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Toggle Draw Mode', click: () => toggleOverlay() },
    { type: 'separator' },
    { label: 'Quit Scrawl', click: () => { app.isQuitting = true; app.quit(); } },
  ]));
  tray.on('click', () => toggleOverlay());

  // --- Global shortcut ---
  globalShortcut.register('Ctrl+Alt+1', () => {
    toggleOverlay();
  });

  ipcMain.on('close-app', () => {
    hideOverlay();
  });

  ipcMain.handle('capture-screen', async () => {
    mainWindow.setOpacity(0);
    await new Promise(r => setTimeout(r, 150));

    const display = screen.getPrimaryDisplay();
    const sf = display.scaleFactor;
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: { width: display.size.width * sf, height: display.size.height * sf },
    });

    mainWindow.setOpacity(1);
    return sources[0].thumbnail.toDataURL();
  });
});

function showOverlay() {
  mainWindow.setIgnoreMouseEvents(false);
  mainWindow.webContents.send('overlay-toggle', true);
  mainWindow.focus();
  isOverlayVisible = true;
}

function hideOverlay() {
  mainWindow.setIgnoreMouseEvents(true, { forward: true });
  mainWindow.webContents.send('overlay-toggle', false);
  isOverlayVisible = false;
}

function toggleOverlay() {
  if (isOverlayVisible) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  // Don't quit — keep running in tray
});
