import type { DayOfWeek, MessageRule, PetProfile } from '../../shared/types'

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
  pets: PetProfile[]
  onChange: (rule: MessageRule) => void
  onDelete: () => void
}): JSX.Element {
  const { rule, pets, onChange, onDelete } = props

  const update = (patch: Partial<MessageRule>): void => onChange({ ...rule, ...patch })

  const hasContent = rule.contentList.some((c) => c.trim().length > 0)
  const selectedPetUsable = pets.some((p) => p.id === rule.species && p.poses.length > 0)

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
        <button
          type="button"
          disabled={!hasContent}
          title={hasContent ? 'Show this reminder on the pet right now' : 'Add a message first'}
          onClick={() => window.petite.testRule(rule)}
        >
          Test now
        </button>
        <button type="button" className="danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="field-row">
        <label>
          Pet
          <select value={rule.species} onChange={(e) => update({ species: e.target.value })}>
            {pets
              .filter((p) => p.poses.length > 0)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            {!selectedPetUsable && (
              <option value={rule.species} disabled>
                {pets.find((p) => p.id === rule.species)?.label ?? 'Unknown pet (deleted)'}
              </option>
            )}
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

      {!selectedPetUsable && (
        <span className="field-warning">
          This reminder&apos;s pet has no pictures yet (or was deleted) and will never appear correctly. Choose a
          different pet or add pictures to it.
        </span>
      )}

      <label className="block">
        Messages (one per line — a random one is shown each time)
        <textarea
          rows={3}
          value={rule.contentList.join('\n')}
          onChange={(e) => update({ contentList: e.target.value.split('\n') })}
          placeholder={'Time to stretch!\nDrink some water.'}
        />
        {rule.enabled && !hasContent && (
          <span className="field-warning">
            This reminder is enabled but has no message text, so it will never appear. Add at least one message.
          </span>
        )}
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
