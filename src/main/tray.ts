import { Tray, Menu, nativeImage, app } from 'electron'
import { join } from 'path'
import { getSettings, setSettings } from './store'
import { openSettingsWindow } from './windows/settingsWindow'

export interface TrayCallbacks {
  onPauseToggled: (paused: boolean) => void
  onQuit: () => void
}

let tray: Tray | null = null

function loadTrayIcon() {
  // Placeholder: derived from a cat pose, scaled down. Swap for a dedicated
  // 16x16/32x32 tray icon asset before shipping.
  const iconPath = join(app.getAppPath(), 'pet', 'Cat1.png')
  const image = nativeImage.createFromPath(iconPath)
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
