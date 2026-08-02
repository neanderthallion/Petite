import Store from 'electron-store'
import type { AppSettings, MessageRule } from '../shared/types'

interface StoreSchema {
  rules: MessageRule[]
  settings: AppSettings
}

const store = new Store<StoreSchema>({
  defaults: {
    rules: [],
    settings: {
      autoStart: true,
      paused: false,
      petPosition: null
    }
  }
})

export function getRules(): MessageRule[] {
  return store.get('rules')
}

export function setRules(rules: MessageRule[]): void {
  store.set('rules', rules)
}

export function getSettings(): AppSettings {
  return store.get('settings')
}

export function setSettings(settings: AppSettings): void {
  store.set('settings', settings)
}

export default store
