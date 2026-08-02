import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipcChannels'
import type { AppSettings, MessageRule, TriggerPayload } from '../shared/types'

const petiteApi = {
  getRules: (): Promise<MessageRule[]> => ipcRenderer.invoke(IPC.GET_RULES),
  setRules: (rules: MessageRule[]): Promise<void> => ipcRenderer.invoke(IPC.SET_RULES, rules),
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke(IPC.GET_SETTINGS),
  setSettings: (settings: AppSettings): Promise<void> => ipcRenderer.invoke(IPC.SET_SETTINGS, settings),
  openSettings: (): Promise<void> => ipcRenderer.invoke(IPC.OPEN_SETTINGS),

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
