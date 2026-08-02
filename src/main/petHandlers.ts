import { dialog, ipcMain } from 'electron'
import { randomUUID } from 'crypto'
import { readFile, stat } from 'fs/promises'
import { basename, extname } from 'path'
import { IPC } from '../shared/ipcChannels'
import type { DeletePetResult, PetProfile, PickImageResult } from '../shared/types'
import { getPets, getRules, setPets } from './store'
import { deletePetDirectory, deletePoseFile, readPickedImageAsDataUrl, savePoseImage } from './petAssets'
import { getSettingsWindow } from './windows/settingsWindow'

const MAX_PICK_BYTES = 20 * 1024 * 1024

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp'
}

export function registerPetIpcHandlers(): void {
  ipcMain.handle(IPC.GET_PETS, (): PetProfile[] => getPets())

  ipcMain.handle(IPC.ADD_PET, (_event, label: string): PetProfile => {
    const pet: PetProfile = { id: randomUUID(), label, poses: [] }
    setPets([...getPets(), pet])
    return pet
  })

  ipcMain.handle(IPC.RENAME_PET, (_event, { id, label }: { id: string; label: string }): void => {
    setPets(getPets().map((p) => (p.id === id ? { ...p, label } : p)))
  })

  ipcMain.handle(IPC.DELETE_PET, async (_event, id: string): Promise<DeletePetResult> => {
    const count = getRules().filter((r) => r.species === id).length
    if (count > 0) return { ok: false, reason: 'in-use', count }
    setPets(getPets().filter((p) => p.id !== id))
    await deletePetDirectory(id)
    return { ok: true }
  })

  ipcMain.handle(IPC.PICK_IMAGE, async (): Promise<PickImageResult> => {
    const options: Electron.OpenDialogOptions = {
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'] }]
    }
    const settingsWindow = getSettingsWindow()
    const result = settingsWindow
      ? await dialog.showOpenDialog(settingsWindow, options)
      : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return { canceled: true }

    const path = result.filePaths[0]
    const info = await stat(path)
    if (info.size > MAX_PICK_BYTES) return { canceled: false, error: 'unreadable' }

    const buffer = await readFile(path)
    const mime = MIME_BY_EXT[extname(path).toLowerCase()] ?? 'application/octet-stream'
    const decoded = readPickedImageAsDataUrl(buffer, mime)
    if ('error' in decoded) return { canceled: false, error: 'unreadable' }

    return { canceled: false, dataUrl: decoded.dataUrl, fileName: basename(path) }
  })

  ipcMain.handle(
    IPC.ADD_POSE,
    async (_event, { petId, pngDataUrl }: { petId: string; pngDataUrl: string }): Promise<{ pose: string }> => {
      const pets = getPets()
      if (!pets.some((p) => p.id === petId)) throw new Error('Unknown pet')
      const { pose } = await savePoseImage(petId, pngDataUrl)
      setPets(pets.map((p) => (p.id === petId ? { ...p, poses: [...p.poses, pose] } : p)))
      return { pose }
    }
  )

  ipcMain.handle(IPC.DELETE_POSE, async (_event, { petId, pose }: { petId: string; pose: string }): Promise<void> => {
    setPets(getPets().map((p) => (p.id === petId ? { ...p, poses: p.poses.filter((x) => x !== pose) } : p)))
    await deletePoseFile(pose)
  })
}
