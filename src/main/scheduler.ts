import type { DayOfWeek, MessageRule } from '../shared/types'

const SEARCH_HORIZON_DAYS = 8

const HHMM_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

function isValidHHmm(value: string): boolean {
  return HHMM_PATTERN.test(value)
}

function parseHHmm(hhmm: string): { hours: number; minutes: number } {
  const [hours, minutes] = hhmm.split(':').map(Number)
  return { hours, minutes }
}

function combine(date: Date, hhmm: string): Date {
  const { hours, minutes } = parseHHmm(hhmm)
  const combined = new Date(date)
  combined.setHours(hours, minutes, 0, 0)
  return combined
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

function isDayActive(date: Date, activeDays: DayOfWeek[]): boolean {
  return activeDays.includes(date.getDay() as DayOfWeek)
}

function nextIntervalTrigger(rule: MessageRule, from: Date): Date | null {
  const config = rule.intervalConfig
  if (!config || config.everyMinutes <= 0) return null
  if (!isValidHHmm(config.activeWindow.start) || !isValidHHmm(config.activeWindow.end)) return null

  for (let dayOffset = 0; dayOffset < SEARCH_HORIZON_DAYS; dayOffset++) {
    const candidateDay = addDays(from, dayOffset)
    if (!isDayActive(candidateDay, config.activeDays)) continue

    const windowStart = combine(candidateDay, config.activeWindow.start)
    const windowEnd = combine(candidateDay, config.activeWindow.end)
    if (windowEnd <= windowStart) continue

    const stepMs = config.everyMinutes * 60_000

    if (dayOffset === 0) {
      if (from < windowStart) return windowStart
      if (from >= windowEnd) continue
      const elapsed = from.getTime() - windowStart.getTime()
      const steps = Math.ceil(elapsed / stepMs)
      const candidate = new Date(windowStart.getTime() + steps * stepMs)
      if (candidate < windowEnd) return candidate
      continue
    }

    return windowStart
  }

  return null
}

function nextFixedTrigger(rule: MessageRule, from: Date): Date | null {
  const config = rule.fixedConfig
  if (!config || config.times.length === 0) return null

  const sortedTimes = [...config.times].filter(isValidHHmm).sort()
  if (sortedTimes.length === 0) return null

  for (let dayOffset = 0; dayOffset < SEARCH_HORIZON_DAYS; dayOffset++) {
    const candidateDay = addDays(from, dayOffset)
    if (!isDayActive(candidateDay, config.activeDays)) continue

    for (const time of sortedTimes) {
      const candidate = combine(candidateDay, time)
      if (dayOffset === 0 && candidate <= from) continue
      return candidate
    }
  }

  return null
}

export function computeNextTrigger(rule: MessageRule, from: Date): Date | null {
  if (!rule.enabled) return null
  return rule.scheduleType === 'interval' ? nextIntervalTrigger(rule, from) : nextFixedTrigger(rule, from)
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export type TriggerHandler = (rule: MessageRule, message: string) => void

/**
 * Owns one setTimeout per enabled rule for its regular cadence. Snoozes are
 * scheduled as untracked one-off timers so they don't disturb the cadence.
 */
export class Scheduler {
  private timers = new Map<string, ReturnType<typeof setTimeout>>()
  private rules: MessageRule[] = []
  private readonly onTrigger: TriggerHandler

  constructor(onTrigger: TriggerHandler) {
    this.onTrigger = onTrigger
  }

  setRules(rules: MessageRule[]): void {
    this.rules = rules
    this.rescheduleAll()
  }

  /** Recompute every rule's next trigger from the current time. Call on app start and on system resume. */
  rescheduleAll(): void {
    this.clearAll()
    const now = new Date()
    for (const rule of this.rules) {
      if (rule.enabled) this.scheduleNext(rule, now)
    }
  }

  /** One-off re-fire of the same message, used by Snooze. Doesn't touch the rule's regular cadence. */
  scheduleSnooze(rule: MessageRule, message: string): void {
    const delay = rule.snoozeDurationMinutes * 60_000
    setTimeout(() => this.onTrigger(rule, message), delay)
  }

  stop(): void {
    this.clearAll()
  }

  private scheduleNext(rule: MessageRule, from: Date): void {
    const next = computeNextTrigger(rule, from)
    if (!next) return
    const delay = Math.max(0, next.getTime() - Date.now())
    const timer = setTimeout(() => this.fire(rule), delay)
    this.timers.set(rule.id, timer)
  }

  private fire(rule: MessageRule): void {
    this.scheduleNext(rule, new Date())
    const content = rule.contentList.map((c) => c.trim()).filter((c) => c.length > 0)
    if (content.length === 0) return
    this.onTrigger(rule, pickRandom(content))
  }

  private clearAll(): void {
    for (const timer of this.timers.values()) clearTimeout(timer)
    this.timers.clear()
  }
}
