import { app, ipcMain, powerMonitor } from 'electron'
import { IPC } from '../shared/ipcChannels'
import type { AppSettings, MessageRule, TriggerPayload } from '../shared/types'
import { getRules, setRules as persistRules, getSettings, setSettings as persistSettings } from './store'
import { Scheduler } from './scheduler'
import { createPetWindow, getPetWindow } from './windows/petWindow'
import { openSettingsWindow } from './windows/settingsWindow'
import { createTray } from './tray'

const gotLock = app.requestSingleInstanceLock()

if (!gotLock) {
  app.quit()
} else {
  let isShowingMessage = false
  const queue: TriggerPayload[] = []

  const scheduler = new Scheduler((rule, message) => {
    if (getSettings().paused) return
    enqueue({
      ruleId: rule.id,
      ruleName: rule.name,
      species: rule.species,
      message,
      snoozeDurationMinutes: rule.snoozeDurationMinutes
    })
  })

  function enqueue(payload: TriggerPayload): void {
    queue.push(payload)
    showNext()
  }

  function showNext(): void {
    if (isShowingMessage || queue.length === 0) return
    const petWindow = getPetWindow()
    if (!petWindow) return
    const payload = queue.shift()!
    isShowingMessage = true
    petWindow.show()
    petWindow.webContents.send(IPC.SHOW_MESSAGE, payload)
  }

  function finishCurrentMessage(): void {
    isShowingMessage = false
    getPetWindow()?.hide()
    showNext()
  }

  app.on('second-instance', () => {
    openSettingsWindow()
  })

  app.whenReady().then(() => {
    const settings = getSettings()
    app.setLoginItemSettings({ openAtLogin: settings.autoStart })

    const petWindow = createPetWindow(settings.petPosition)
    petWindow.on('moved', () => {
      const [x, y] = petWindow.getPosition()
      persistSettings({ ...getSettings(), petPosition: { x, y } })
    })
    scheduler.setRules(getRules())

    createTray({
      onPauseToggled: () => {
        // Scheduler keeps ticking in the background; the trigger handler
        // checks settings.paused and skips enqueueing while paused.
      },
      onQuit: () => app.quit()
    })

    powerMonitor.on('resume', () => scheduler.rescheduleAll())
    powerMonitor.on('unlock-screen', () => scheduler.rescheduleAll())

    registerIpcHandlers()
  })

  function registerIpcHandlers(): void {
    ipcMain.handle(IPC.GET_RULES, () => getRules())

    ipcMain.handle(IPC.SET_RULES, (_event, rules: MessageRule[]) => {
      persistRules(rules)
      scheduler.setRules(rules)
    })

    ipcMain.handle(IPC.GET_SETTINGS, () => getSettings())

    ipcMain.handle(IPC.SET_SETTINGS, (_event, settings: AppSettings) => {
      persistSettings(settings)
      app.setLoginItemSettings({ openAtLogin: settings.autoStart })
    })

    ipcMain.handle(IPC.OPEN_SETTINGS, () => {
      openSettingsWindow()
    })

    ipcMain.on(IPC.DISMISS_MESSAGE, () => {
      finishCurrentMessage()
    })

    ipcMain.on(IPC.SNOOZE_MESSAGE, (_event, payload: TriggerPayload) => {
      const rule = getRules().find((r) => r.id === payload.ruleId)
      if (rule) scheduler.scheduleSnooze(rule, payload.message)
      finishCurrentMessage()
    })
  }
}
