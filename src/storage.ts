import type { MoodEntry } from './types'

const KEY = 'mood-diary-entries'

export function loadEntries(): MoodEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch {
    return []
  }
}

export function saveEntry(entry: MoodEntry): void {
  const entries = loadEntries()
  const idx = entries.findIndex(e => e.id === entry.id)
  if (idx >= 0) entries[idx] = entry
  else entries.unshift(entry)
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export function getEntryByDate(date: string): MoodEntry | undefined {
  return loadEntries().find(e => e.date === date)
}

export function getEntryById(id: string): MoodEntry | undefined {
  return loadEntries().find(e => e.id === id)
}

export function today(): string {
  return new Date().toISOString().slice(0, 10)
}
