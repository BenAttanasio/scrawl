# Scrawl

Scrawl is a drawing overlay for Windows. Press a global hotkey and you can draw
freehand on top of whatever's already on screen, over any application, without
alt-tabbing anywhere.

It sits in the system tray and stays out of the way until you hit the shortcut.

## Running it

```bash
npm install
npm run start
```

That bundles the renderer and launches it in development mode.

To build something you can keep:

```bash
npm run pack
```

which produces `dist/win-unpacked/Scrawl.exe`.

## Using it

| Keys | Action |
|---|---|
| `Ctrl+Alt+1` | Toggle draw mode, same as clicking the tray icon |
| `Ctrl+Z` | Undo the last stroke |

Right-click the tray icon and choose Quit Scrawl to exit.

When draw mode is off, the overlay passes clicks straight through, so you can
carry on using whatever's underneath it.

## The strokes

Freehand drawing is done with
[perfect-freehand](https://github.com/steveruizok/perfect-freehand), which builds
a filled outline around the input points rather than stroking a path with a fixed
width. That's what gives you pressure-like tapering at the start and end of a
stroke from a mouse that reports no pressure at all, and it's the difference
between annotation that reads as handwriting and annotation that reads as a
wobbly line.

Undo is a stroke stack, so each `Ctrl+Z` removes one complete stroke rather than
a handful of points.

## Layout

```
main.js        the transparent always-on-top window, tray, and global shortcut
preload.js     exposes scrawlAPI to the renderer over the context bridge
renderer/      vanilla JS and an HTML5 canvas
```

Electron with a context-isolated preload, so the renderer reaches the main
process through IPC rather than touching Node directly.

## Scripts

| Command | What it does |
|---|---|
| `npm run build` | Bundle the renderer with esbuild into `renderer/bundle.js` |
| `npm run start` | Build, then launch with Electron |
| `npm run pack` | Build and package with electron-builder |

## Limitations

- Windows only, and the overlay spans the primary display rather than all of
  them.
- One colour and one brush size.
- Drawings aren't saved. Toggling draw mode off clears the canvas, since this is
  for pointing at something while you talk rather than for keeping.

## License

MIT. See [LICENSE](LICENSE).

More at [benattanasio.com/lab](https://benattanasio.com/lab).
