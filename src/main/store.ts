import Store from 'electron-store'
import type { AppSettings, MessageRule, PetProfile } from '../shared/types'
import { BUILTIN_PET_PROFILES } from '../shared/spriteConfig'

interface StoreSchema {
  rules: MessageRule[]
  settings: AppSettings
  pets: PetProfile[]
}

const store = new Store<StoreSchema>({
  defaults: {
    rules: [],
    settings: {
      autoStart: true,
      paused: false,
      petPosition: null
    },
    // Only applied when the 'pets' key is absent, so upgrading installs get
    // seeded once and existing rules' species ids ('cat'/'dog'/'pokemon') keep resolving.
    pets: BUILTIN_PET_PROFILES
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

export function getPets(): PetProfile[] {
  return store.get('pets')
}

export function setPets(pets: PetProfile[]): void {
  store.set('pets', pets)
}

export default store
