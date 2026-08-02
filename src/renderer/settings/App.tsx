import { useEffect, useState } from 'react'
import RuleEditor from './RuleEditor'
import { createDefaultRule } from '../../shared/types'
import type { AppSettings, MessageRule } from '../../shared/types'

interface Snapshot {
  rules: MessageRule[]
  settings: AppSettings
}

export default function App(): JSX.Element {
  const [draft, setDraft] = useState<Snapshot | null>(null)
  const [applied, setApplied] = useState<Snapshot | null>(null)

  useEffect(() => {
    Promise.all([window.petite.getRules(), window.petite.getSettings()]).then(([rules, settings]) => {
      const snapshot = { rules, settings }
      setDraft(snapshot)
      setApplied(snapshot)
    })
  }, [])

  if (draft === null || applied === null) {
    return <div className="loading">Loading…</div>
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(applied)

  const setRules = (rules: MessageRule[]): void => setDraft((current) => ({ ...current!, rules }))
  const setSettings = (settings: AppSettings): void => setDraft((current) => ({ ...current!, settings }))

  const updateRule = (id: string, updated: MessageRule): void =>
    setRules(draft.rules.map((r) => (r.id === id ? updated : r)))

  const deleteRule = (id: string): void => setRules(draft.rules.filter((r) => r.id !== id))

  const addRule = (): void => setRules([...draft.rules, createDefaultRule()])

  const applyChanges = (): void => {
    window.petite.setRules(draft.rules)
    window.petite.setSettings(draft.settings)
    setApplied(draft)
  }

  const cancelChanges = (): void => setDraft(applied)

  return (
    <div className="settings-app">
      <header>
        <h1>Petite</h1>
        <div className="global-toggles">
          <label className="inline">
            <input
              type="checkbox"
              checked={draft.settings.autoStart}
              onChange={(e) => setSettings({ ...draft.settings, autoStart: e.target.checked })}
            />
            Start with Windows
          </label>
          <label className="inline">
            <input
              type="checkbox"
              checked={draft.settings.paused}
              onChange={(e) => setSettings({ ...draft.settings, paused: e.target.checked })}
            />
            Paused
          </label>
        </div>
      </header>

      <div className="rule-list">
        {draft.rules.length === 0 && <p className="empty-state">No reminders yet — add one below.</p>}
        {draft.rules.map((rule) => (
          <RuleEditor
            key={rule.id}
            rule={rule}
            onChange={(updated) => updateRule(rule.id, updated)}
            onDelete={() => deleteRule(rule.id)}
          />
        ))}
      </div>

      <button type="button" className="add-rule" onClick={addRule}>
        + Add reminder
      </button>

      <div className="apply-bar">
        <span className="apply-status">{isDirty ? 'You have unsaved changes.' : 'All changes applied.'}</span>
        <div className="apply-actions">
          <button type="button" className="cancel" disabled={!isDirty} onClick={cancelChanges}>
            Cancel
          </button>
          <button type="button" className="confirm" disabled={!isDirty} onClick={applyChanges}>
            Apply changes
          </button>
        </div>
      </div>
    </div>
  )
}
