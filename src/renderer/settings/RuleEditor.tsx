import type { DayOfWeek, MessageRule, PetSpecies } from '../../shared/types'
import { PET_SPECIES_CONFIG } from '../../shared/spriteConfig'

const DAY_LABELS: { day: DayOfWeek; label: string }[] = [
  { day: 0, label: 'Su' },
  { day: 1, label: 'Mo' },
  { day: 2, label: 'Tu' },
  { day: 3, label: 'We' },
  { day: 4, label: 'Th' },
  { day: 5, label: 'Fr' },
  { day: 6, label: 'Sa' }
]

function DayPicker(props: { activeDays: DayOfWeek[]; onChange: (days: DayOfWeek[]) => void }): JSX.Element {
  const { activeDays, onChange } = props
  const toggle = (day: DayOfWeek): void => {
    onChange(activeDays.includes(day) ? activeDays.filter((d) => d !== day) : [...activeDays, day].sort())
  }
  return (
    <div className="day-picker">
      {DAY_LABELS.map(({ day, label }) => (
        <button
          key={day}
          type="button"
          className={activeDays.includes(day) ? 'day active' : 'day'}
          onClick={() => toggle(day)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export default function RuleEditor(props: {
  rule: MessageRule
  onChange: (rule: MessageRule) => void
  onDelete: () => void
}): JSX.Element {
  const { rule, onChange, onDelete } = props

  const update = (patch: Partial<MessageRule>): void => onChange({ ...rule, ...patch })

  return (
    <div className="rule-card">
      <div className="rule-header">
        <input
          className="rule-name"
          value={rule.name}
          onChange={(e) => update({ name: e.target.value })}
          placeholder="Reminder name"
        />
        <label className="inline">
          <input type="checkbox" checked={rule.enabled} onChange={(e) => update({ enabled: e.target.checked })} />
          Enabled
        </label>
        <button type="button" className="danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="field-row">
        <label>
          Pet
          <select value={rule.species} onChange={(e) => update({ species: e.target.value as PetSpecies })}>
            {(Object.keys(PET_SPECIES_CONFIG) as PetSpecies[]).map((species) => (
              <option key={species} value={species}>
                {PET_SPECIES_CONFIG[species].label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Snooze (minutes)
          <input
            type="number"
            min={1}
            value={rule.snoozeDurationMinutes}
            onChange={(e) => update({ snoozeDurationMinutes: Number(e.target.value) || 1 })}
          />
        </label>
      </div>

      <label className="block">
        Messages (one per line — a random one is shown each time)
        <textarea
          rows={3}
          value={rule.contentList.join('\n')}
          onChange={(e) => update({ contentList: e.target.value.split('\n') })}
          placeholder={'Time to stretch!\nDrink some water.'}
        />
      </label>

      <div className="field-row">
        <label>
          Frequency
          <select
            value={rule.scheduleType}
            onChange={(e) => update({ scheduleType: e.target.value as 'interval' | 'fixed' })}
          >
            <option value="interval">Recurring interval</option>
            <option value="fixed">Fixed time(s)</option>
          </select>
        </label>
      </div>

      {rule.scheduleType === 'interval' ? (
        <div className="schedule-block">
          <label>
            Every
            <input
              type="number"
              min={1}
              value={rule.intervalConfig?.everyMinutes ?? 60}
              onChange={(e) =>
                update({
                  intervalConfig: {
                    everyMinutes: Number(e.target.value) || 1,
                    activeDays: rule.intervalConfig?.activeDays ?? [0, 1, 2, 3, 4, 5, 6],
                    activeWindow: rule.intervalConfig?.activeWindow ?? { start: '09:00', end: '21:00' }
                  }
                })
              }
            />
            minutes
          </label>
          <label>
            From
            <input
              type="time"
              value={rule.intervalConfig?.activeWindow.start ?? '09:00'}
              onChange={(e) =>
                update({
                  intervalConfig: {
                    everyMinutes: rule.intervalConfig?.everyMinutes ?? 60,
                    activeDays: rule.intervalConfig?.activeDays ?? [0, 1, 2, 3, 4, 5, 6],
                    activeWindow: { start: e.target.value, end: rule.intervalConfig?.activeWindow.end ?? '21:00' }
                  }
                })
              }
            />
          </label>
          <label>
            To
            <input
              type="time"
              value={rule.intervalConfig?.activeWindow.end ?? '21:00'}
              onChange={(e) =>
                update({
                  intervalConfig: {
                    everyMinutes: rule.intervalConfig?.everyMinutes ?? 60,
                    activeDays: rule.intervalConfig?.activeDays ?? [0, 1, 2, 3, 4, 5, 6],
                    activeWindow: { start: rule.intervalConfig?.activeWindow.start ?? '09:00', end: e.target.value }
                  }
                })
              }
            />
          </label>
          <DayPicker
            activeDays={rule.intervalConfig?.activeDays ?? [0, 1, 2, 3, 4, 5, 6]}
            onChange={(activeDays) =>
              update({
                intervalConfig: {
                  everyMinutes: rule.intervalConfig?.everyMinutes ?? 60,
                  activeWindow: rule.intervalConfig?.activeWindow ?? { start: '09:00', end: '21:00' },
                  activeDays
                }
              })
            }
          />
        </div>
      ) : (
        <div className="schedule-block">
          <label className="block">
            Times (one "HH:mm" per line)
            <textarea
              rows={2}
              value={(rule.fixedConfig?.times ?? []).join('\n')}
              onChange={(e) =>
                update({
                  fixedConfig: {
                    times: e.target.value.split('\n'),
                    activeDays: rule.fixedConfig?.activeDays ?? [0, 1, 2, 3, 4, 5, 6]
                  }
                })
              }
              placeholder={'09:00\n13:00\n18:00'}
            />
          </label>
          <DayPicker
            activeDays={rule.fixedConfig?.activeDays ?? [0, 1, 2, 3, 4, 5, 6]}
            onChange={(activeDays) =>
              update({
                fixedConfig: { times: rule.fixedConfig?.times ?? [], activeDays }
              })
            }
          />
        </div>
      )}
    </div>
  )
}
