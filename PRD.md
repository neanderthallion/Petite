# PRD: Petite — Desktop Pet Companion

**Status:** Draft v1.0
**Owner:** bookzenhome@gmail.com
**Last updated:** 2026-08-01

---

## 1. Overview

**Petite** is a Windows desktop pet app. A small pixel-art animal (cat or dog) lives on your desktop and periodically pops up with a speech bubble showing a personal reminder or message, on a schedule you define. It's a reminder tool wearing a pet costume — the goal is to make nudges (drink water, stretch, take a break, an affirmation, whatever you want) something you actually notice and enjoy, instead of another notification you swipe away without reading.

**Vision:** a low-friction, delightful nudge system disguised as a desktop pet.

---

## 2. Problem Statement & Goals

**Problem:** Reminder and notification apps are easy to ignore — they're generic system toasts that blend into the noise. A visible, charming, persistent companion on your desktop is harder to tune out and more pleasant to interact with, which increases the odds you actually act on the reminder.

**Goals (MVP):**
- Ship a working desktop pet that runs continuously in the background.
- Let users fully customize what reminders they get, how often, and in what words.
- Make the interaction (seeing + dismissing a message) fast and low-friction.

**Non-goals (MVP):**
- No multi-user or social features (see [Future Roadmap](#8-future-roadmap)).
- No mobile app.
- No cloud sync or accounts — everything is local to the machine.

---

## 3. Target Users

Individuals who want lightweight, personal, customizable desktop reminders — hydration, posture, breaks, habits, affirmations, medication, etc. — with more charm and stickiness than Windows' built-in notification center.

---

## 4. Core MVP Features

### 4.1 Pet Selection & Display
- Pet species (**cat** or **dog**) is chosen **per message rule**, not globally — different reminders can have different pets (e.g. the dog nags you about hydration, the cat reminds you to stretch).
- Each species has multiple poses (sprite assets already exist in `pet/`: cat has standing, lying, sitting-alert, and sitting; dog has standing, sitting, and sleeping).
- When a rule triggers, its pet appears in a **randomly chosen pose** from that rule's species set, alongside the message bubble.
- The pet window is transparent-background and always-on-top, so it visually sits on the desktop over other windows.
- **Draggable:** click-and-drag repositions the pet anywhere on screen.
- **Clickable:** clicking the pet (outside of a drag) triggers a small idle animation / pose change, purely cosmetic — no functional side effect.
- The pet's last position persists across app restarts and is reused for the next appearance regardless of which rule's pet is showing.
- Since only one bubble is shown at a time (see 4.2), only one pet is ever visible at once — it simply may be a different species depending on which rule just triggered.

### 4.2 Message Rules (the reminder system)
Users create one or more independent **Message Rules**. Each rule has:

| Field | Description |
|---|---|
| Name | Short label for the user's own reference in the rule list (e.g. "Hydration") |
| Pet | Species (cat/dog) shown when this rule triggers |
| Content | One or more text strings. At trigger time, the app randomly picks one to display. |
| Frequency | Either **Recurring interval** or **Fixed time marker(s)** (see below) |
| Snooze duration | How long to wait before re-showing this rule's message after Snooze (default **10 minutes**, editable per rule) |
| Enabled | On/off toggle for the rule |

**Frequency — Recurring interval:**
- Repeats every N minutes/hours.
- Scoped to an **active time window** (e.g. only between 9:00 AM–9:00 PM).
- Scoped to **active days of week** (e.g. weekdays only).

**Frequency — Fixed time marker(s):**
- One or more specific clock times per day (e.g. 9:00 AM, 1:00 PM, 6:00 PM).
- Scoped to **active days of week** (e.g. Mon/Wed/Fri only).

**Rule management (Settings UI):**
- Full CRUD: create, edit, delete, enable/disable each rule.
- Within a rule, add/remove content text variants freely (minimum 1 required).
- Multiple rules can be active at once. If two triggers land at the same moment, their bubbles are **queued and shown sequentially** — never stacked or overlapping.

### 4.3 Message Bubble Display & Interaction
- When a rule triggers, that rule's pet appears in a random pose, with a speech bubble showing the chosen content string.
- The bubble offers exactly two actions:
  - **Snooze** — dismiss now, re-show the same message after that rule's snooze duration (default 10 minutes).
  - **OK** — dismiss and resume the rule's normal schedule.
- If the user ignores the bubble entirely, it auto-dismisses after a timeout (default 60 seconds) as a soft-dismiss — this does **not** consume a snooze.

### 4.4 System Tray & Lifecycle
- Petite runs as a background tray app.
- **Auto-start on Windows login**, toggleable in Settings.
- Tray menu: Open Settings, Pause/Resume, Quit.
- **Pause** (from the tray) stops all scheduling globally without deleting any rules; resuming picks the schedule back up.

### 4.5 Settings App
A separate window/panel providing:
- Message rule management (per 4.2), including per-rule pet species and snooze duration
- Auto-start toggle
- Pause / Quit controls

---

## 5. Data Model (sketch)

```
MessageRule {
  id: string
  name: string
  enabled: boolean
  species: 'cat' | 'dog'              // pet shown when this rule triggers
  contentList: string[]              // random pick at trigger time
  scheduleType: 'interval' | 'fixed'
  intervalConfig?: {
    everyMinutes: number
    activeDays: DayOfWeek[]
    activeWindow: { start: string, end: string }  // "HH:mm"
  }
  fixedConfig?: {
    times: string[]                  // "HH:mm"[]
    activeDays: DayOfWeek[]
  }
  snoozeDurationMinutes: number       // default 10
}

AppSettings {
  autoStart: boolean
  paused: boolean
  petPosition: { x: number, y: number } | null   // last dropped position, reused for any rule's pet
}
```

Persistence is **local-only** for MVP (e.g. a JSON file or SQLite database in Electron's `userData` directory). No accounts, no network calls.

---

## 6. Non-Functional Requirements
- Lightweight idle footprint (low CPU/RAM) — the app runs continuously in the background.
- Scheduling must remain correct across system sleep/wake (recompute next-trigger times on wake rather than relying on elapsed timers alone).
- Target platform: Windows 10 and 11.

---

## 7. Tech Stack Recommendation
- **Electron + React** for the app shell and UI.
  - A transparent, always-on-top `BrowserWindow` for the pet itself.
  - A separate standard window for Settings.
- **Local storage:** JSON file or SQLite for rules/settings persistence.
- **Scheduler:** a custom interval/fixed-time scheduler (or `node-cron`-style library) that reconciles against the system clock on wake, rather than trusting only in-memory timers.

---

## 8. Future Roadmap

Not part of MVP scope; noted here so the MVP architecture doesn't foreclose it:

- **Friend system:** each user gets a unique code; add friends by entering their code.
- **Cross-user messaging:** send a message to a friend, either immediately or scheduled — always **one-time**, not repeating.
- **"Pigeon" delivery:** the message arrives at the recipient's pet via a pigeon-courier animation, reinforcing the pet theme.
- This implies an eventual need for user accounts and a backend/sync service. The MVP's local-only data model should be kept in mind as something that will need to evolve, but no backend work is in scope now.

---

## 9. Success Metrics (suggested)
- Daily active usage (pet running in tray).
- Number of message rules created per user.
- Snooze-vs-OK ratio, as a rough engagement/annoyance signal.

---

## 10. Open Questions
- None outstanding for MVP scope.
