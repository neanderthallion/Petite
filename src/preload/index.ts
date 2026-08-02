import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipcChannels'
import type {
  AppSettings,
  DeletePetResult,
  MessageRule,
  PetProfile,
  PickImageResult,
  TriggerPayload
} from '../shared/types'

const petiteApi = {
  getRules: (): Promise<MessageRule[]> => ipcRenderer.invoke(IPC.GET_RULES),
  setRules: (rules: MessageRule[]): Promise<void> => ipcRenderer.invoke(IPC.SET_RULES, rules),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.GET_SETTINGS),
  setSettings: (settings: AppSettings): Promise<void> => ipcRenderer.invoke(IPC.SET_SETTINGS, settings),
  openSettings: (): Promise<void> => ipcRenderer.invoke(IPC.OPEN_SETTINGS),
  testRule: (rule: MessageRule): Promise<void> => ipcRenderer.invoke(IPC.TEST_RULE, rule),

  getPets: (): Promise<PetProfile[]> => ipcRenderer.invoke(IPC.GET_PETS),
  addPet: (label: string): Promise<PetProfile> => ipcRenderer.invoke(IPC.ADD_PET, label),
  renamePet: (id: string, label: string): Promise<void> => ipcRenderer.invoke(IPC.RENAME_PET, { id, label }),
  deletePet: (id: string): Promise<DeletePetResult> => ipcRenderer.invoke(IPC.DELETE_PET, id),
  pickImage: (): Promise<PickImageResult> => ipcRenderer.invoke(IPC.PICK_IMAGE),
  addPose: (petId: string, pngDataUrl: string): Promise<{ pose: string }> =>
    ipcRenderer.invoke(IPC.ADD_POSE, { petId, pngDataUrl }),
  deletePose: (petId: string, pose: string): Promise<void> => ipcRenderer.invoke(IPC.DELETE_POSE, { petId, pose }),

  onShowMessage: (callback: (payload: TriggerPayload) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: TriggerPayload): void => callback(payload)
    ipcRenderer.on(IPC.SHOW_MESSAGE, listener)
    return () => ipcRenderer.removeListener(IPC.SHOW_MESSAGE, listener)
  },

  dismiss: (): void => {
    ipcRenderer.send(IPC.DISMISS_MESSAGE)
  },

  snooze: (payload: TriggerPayload): void => {
    ipcRenderer.send(IPC.SNOOZE_MESSAGE, payload)
  }
}

contextBridge.exposeInMainWorld('petite', petiteApi)

export type PetiteApi = typeof petiteApi
