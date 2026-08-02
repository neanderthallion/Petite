import { BrowserWindow } from 'electron'
import { join } from 'path'

let settingsWindow: BrowserWindow | null = null

export function openSettingsWindow(): BrowserWindow {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show()
    settingsWindow.focus()
    return settingsWindow
  }

  settingsWindow = new BrowserWindow({
    width: 640,
    height: 720,
    title: 'Petite Settings',
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    settingsWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/settings/index.html`)
  } else {
    settingsWindow.loadFile(join(__dirname, '../renderer/settings/index.html'))
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })

  return settingsWindow
}

export function getSettingsWindow(): BrowserWindow | null {
  return settingsWindow
}
