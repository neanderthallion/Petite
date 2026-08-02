import { BrowserWindow, screen } from 'electron'
import { join } from 'path'
import type { PetPosition } from '../../shared/types'

const PET_WINDOW_WIDTH = 260
const PET_WINDOW_HEIGHT = 270

let petWindow: BrowserWindow | null = null

function defaultPosition(): PetPosition {
  const { workArea } = screen.getPrimaryDisplay()
  return {
    x: workArea.x + workArea.width - PET_WINDOW_WIDTH - 24,
    y: workArea.y + workArea.height - PET_WINDOW_HEIGHT - 24
  }
}

export function createPetWindow(savedPosition: PetPosition | null): BrowserWindow {
  const position = savedPosition ?? defaultPosition()

  petWindow = new BrowserWindow({
    width: PET_WINDOW_WIDTH,
    height: PET_WINDOW_HEIGHT,
    x: position.x,
    y: position.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  petWindow.setAlwaysOnTop(true, 'screen-saver')
  petWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })

  if (process.env['ELECTRON_RENDERER_URL']) {
    petWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/pet/index.html`)
  } else {
    petWindow.loadFile(join(__dirname, '../renderer/pet/index.html'))
  }

  // Stays hidden until the scheduler has a message to show (see main/index.ts).
  return petWindow
}

export function getPetWindow(): BrowserWindow | null {
  return petWindow
}
