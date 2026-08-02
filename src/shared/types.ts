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
  /** References a PetProfile.id. Kept as `species` for backwards compatibility with persisted data. */
  species: string
  contentList: string[]
  scheduleType: 'interval' | 'fixed'
  intervalConfig?: IntervalScheduleConfig
  fixedConfig?: FixedScheduleConfig
  snoozeDurationMinutes: number
}

export interface PetProfile {
  id: string
  label: string
  /** Each entry is a CSS url()-usable reference: a relative filename for
   *  built-in poses (served from src/renderer/public/pet/), or a
   *  petasset://<petId>/<file>.png URL for user-uploaded poses. */
  poses: string[]
}

export type PickImageResult =
  | { canceled: true }
  | { canceled: false; error: 'unreadable' }
  | { canceled: false; dataUrl: string; fileName: string }

export type DeletePetResult = { ok: true } | { ok: false; reason: 'in-use'; count: number }

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
  species: string
  /** Resolved at trigger time from the live pets list, so the pet window never needs a species lookup table. */
  poses: string[]
  message: string
  snoozeDurationMinutes: number
}

export function createDefaultRule(defaultPetId: string): MessageRule {
  return {
    id: crypto.randomUUID(),
    name: 'New reminder',
    enabled: true,
    species: defaultPetId,
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
