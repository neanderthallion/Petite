import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import { getSettings, setSettings } from './store'
import { openSettingsWindow } from './windows/settingsWindow'

export interface TrayCallbacks {
  onPauseToggled: (paused: boolean) => void
  onQuit: () => void
}

let tray: Tray | null = null

function trayIconPath(): string {
  // Deliberately independent of the (now user-editable/deletable) pets list —
  // extraResources in package.json's build config copies resources/ alongside
  // the packaged app; in dev it's read straight from the repo.
  return app.isPackaged
    ? join(process.resourcesPath, 'resources', 'tray-icon.png')
    : join(app.getAppPath(), 'resources', 'tray-icon.png')
}

function loadTrayIcon() {
  // Placeholder art derived from a cat pose, scaled down. Swap resources/tray-icon.png
  // for dedicated icon art before shipping.
  const image = nativeImage.createFromPath(trayIconPath())
  return image.isEmpty() ? nativeImage.createEmpty() : image.resize({ width: 16, height: 16 })
}

export function createTray(callbacks: TrayCallbacks): Tray {
  tray = new Tray(loadTrayIcon())
  tray.setToolTip('Petite')
  refreshMenu(callbacks)
  return tray
}

export function refreshMenu(callbacks: TrayCallbacks): void {
  if (!tray) return
  const settings = getSettings()

  const menu = Menu.buildFromTemplate([
    { label: 'Open Settings', click: () => openSettingsWindow() },
    {
      label: settings.paused ? 'Resume' : 'Pause',
      click: () => {
        const next = { ...getSettings(), paused: !settings.paused }
        setSettings(next)
        callbacks.onPauseToggled(next.paused)
        refreshMenu(callbacks)
      }
    },
    { type: 'separator' },
    { label: 'Quit', click: () => callbacks.onQuit() }
  ])

  tray.setContextMenu(menu)
}
