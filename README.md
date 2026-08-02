# Petite

Desktop pet reminder app. See `PRD.md` for the full spec.

## Stack
Electron + React + TypeScript, bundled with `electron-vite`. Rules/settings persist locally via `electron-store` (`%APPDATA%/petite/config.json`).

## Run

```
npm install
npm run dev
```

This launches the app: a hidden transparent pet window (appears when a reminder fires) plus a tray icon (right-click for Settings / Pause / Quit).

## Project layout
- `src/main` — Electron main process: window management, tray, local storage, the reminder scheduler (`scheduler.ts`).
- `src/preload` — contextBridge API (`window.petite`) exposed to both renderer windows.
- `src/renderer/pet` — the on-desktop pet + speech bubble UI.
- `src/renderer/settings` — the reminder rule editor UI.
- `src/shared` — types and IPC channel names shared by main/preload/renderer.
- `pet/` — source sprite sheets. Copies live in `src/renderer/public/pet` so Vite can serve them; re-copy if you replace the source art.

## Known scaffold gaps (not yet production-ready)
- Sprite frame boundaries (`src/shared/spriteConfig.ts`) assume equal-width poses per sheet — eyeball and adjust `frameWidth` if a pose looks cropped.
- Tray icon is the full cat sprite sheet squished to 16×16 — swap in a real icon asset.
- No packaging config yet (`electron-builder`) — `pet/` assets aren't wired into `extraResources` for a built app.
