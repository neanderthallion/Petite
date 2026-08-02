export type PetSpecies = 'cat' | 'dog' | 'pokemon'

/** 0 = Sunday ... 6 = Saturday, matches Date#getDay() */
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface IntervalScheduleConfig {
  everyMinutes: number
  activeDays: DayOfWeek[]
  /** "HH:mm" 24h, local time */
  activeWindow: { start: string; end: string }
}

export interface FixedScheduleConfig {
  /** "HH:mm" 24h, local time */
  times: string[]
  activeDays: DayOfWeek[]
}

export interface MessageRule {
  id: string
  name: string
  enabled: boolean
  species: PetSpecies
  contentList: string[]
  scheduleType: 'interval' | 'fixed'
  intervalConfig?: IntervalScheduleConfig
  fixedConfig?: FixedScheduleConfig
  snoozeDurationMinutes: number
}

export interface PetPosition {
  x: number
  y: number
}

export interface AppSettings {
  autoStart: boolean
  paused: boolean
  petPosition: PetPosition | null
}

export interface TriggerPayload {
  ruleId: string
  ruleName: string
  species: PetSpecies
  message: string
  snoozeDurationMinutes: number
}

export function createDefaultRule(): MessageRule {
  return {
    id: crypto.randomUUID(),
    name: 'New reminder',
    enabled: true,
    species: 'cat',
    contentList: [''],
    scheduleType: 'interval',
    intervalConfig: {
      everyMinutes: 60,
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      activeWindow: { start: '09:00', end: '21:00' }
    },
    snoozeDurationMinutes: 10
  }
}
