# Scrawl

Minimalist desktop drawing overlay for Windows built with Electron.

## Build & Run

- `npm run build` — bundles renderer code via esbuild into `renderer/bundle.js`
- `npm run start` — builds then launches with Electron (dev mode)
- `npm run pack` — builds, packages with electron-builder into `dist/win-unpacked/Scrawl.exe`, sets icon

## After Every Code Change

**Always run `npm run build` after modifying any renderer source file** (`renderer/canvas.js`, `renderer/toolbar.js`, `renderer/stroke-utils.js`, `renderer/app.js`). The app loads `renderer/bundle.js`, not the source files directly.

**Always run `npm run pack` after any change** to rebuild the distributable. The user runs `Scrawl.exe` from `dist/win-unpacked/`, not `npm start`. If pack fails with "Access is denied", the user needs to quit Scrawl from the system tray first — the exe locks the dist directory.

Files that require rebuild after changes:
- `main.js` — main process (needs pack, not build)
- `preload.js` — preload script (needs pack, not build)
- `renderer/*.js` — renderer source (needs build + pack)
- `renderer/index.html` — HTML (needs pack)
- `renderer/styles.css` — styles (needs pack)

## Architecture

- **Main process**: `main.js` — transparent always-on-top BrowserWindow, system tray, global shortcut (Ctrl+Alt+1)
- **Preload**: `preload.js` — exposes `scrawlAPI` via context bridge (IPC)
- **Renderer**: `renderer/` — vanilla JS with HTML5 Canvas, uses `perfect-freehand` for smooth strokes
- **Undo**: stack-based (`strokes[]` array), Ctrl+Z pops last entry and redraws
- **Bundler**: esbuild, IIFE format, output to `renderer/bundle.js`
