# Scrawl

Minimalist desktop drawing overlay for Windows, built with Electron. Press a global hotkey to draw smooth freehand annotations on top of anything on your screen.

## Features

- Transparent, always-on-top overlay that spans the primary display
- Smooth freehand strokes powered by [perfect-freehand](https://github.com/steveruizok/perfect-freehand)
- Toggle draw mode with a global shortcut (`Ctrl+Alt+1`) or the system tray icon
- Stack-based undo (`Ctrl+Z`)
- Lives in the system tray — runs quietly until you need it

## Getting Started

```bash
npm install
npm run start
```

This bundles the renderer and launches the app in development mode.

## Scripts

- `npm run build` — bundle the renderer code via esbuild into `renderer/bundle.js`
- `npm run start` — build, then launch with Electron (dev mode)
- `npm run pack` — build and package into `dist/win-unpacked/Scrawl.exe` via electron-builder

## Usage

- **Toggle draw mode:** `Ctrl+Alt+1`, or click the tray icon
- **Undo:** `Ctrl+Z`
- **Quit:** right-click the tray icon → *Quit Scrawl*

## Architecture

- **Main process** (`main.js`) — transparent always-on-top `BrowserWindow`, system tray, and global shortcut
- **Preload** (`preload.js`) — exposes `scrawlAPI` to the renderer via the context bridge (IPC)
- **Renderer** (`renderer/`) — vanilla JS with an HTML5 Canvas

## License

MIT
