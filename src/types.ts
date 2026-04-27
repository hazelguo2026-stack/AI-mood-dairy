export type MoodType = 'happy' | 'calm' | 'sad' | 'anxious' | 'angry'

export interface MoodEntry {
  id: string
  date: string // YYYY-MM-DD
  mood: MoodType
  text: string
  aiResponse: string
  createdAt: number
}

export const MOODS: { type: MoodType; emoji: string; label: string; color: string; bg: string }[] = [
  { type: 'happy',   emoji: '😊', label: '开心',  color: '#22c55e', bg: 'bg-green-100'  },
  { type: 'calm',    emoji: '😌', label: '平静',  color: '#3b82f6', bg: 'bg-blue-100'   },
  { type: 'sad',     emoji: '😔', label: '难过',  color: '#64748b', bg: 'bg-slate-100'  },
  { type: 'anxious', emoji: '😰', label: '焦虑',  color: '#a855f7', bg: 'bg-purple-100' },
  { type: 'angry',   emoji: '😤', label: '烦躁',  color: '#f97316', bg: 'bg-orange-100' },
]

export const getMoodConfig = (type: MoodType) => MOODS.find(m => m.type === type)!
