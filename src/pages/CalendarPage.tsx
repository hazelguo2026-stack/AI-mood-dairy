import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { MOODS, getMoodConfig } from '../types'
import { loadEntries } from '../storage'

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstWeekday(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const entries = loadEntries()
  const entryMap: Record<string, typeof entries[0]> = {}
  for (const e of entries) entryMap[e.date] = e

  const daysInMonth = getDaysInMonth(year, month)
  const firstWeekday = getFirstWeekday(year, month)
  const todayStr = now.toISOString().slice(0, 10)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  const recordCount = Object.keys(entryMap).filter(
    d => d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  ).length

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0) }
    else setMonth(m => m + 1)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="mb-6"
      >
        <p className="text-xs font-medium tracking-widest text-purple-400 uppercase mb-1">心情地图</p>
        <h1 className="text-3xl font-bold text-gray-800">日历</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4 }}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white"
      >
        {/* Month nav */}
        <div className="flex items-center justify-between mb-5">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={prevMonth}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <ChevronLeft size={18} />
          </motion.button>
          <div className="text-center">
            <p className="font-semibold text-gray-800">{year} 年 {month + 1} 月</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {recordCount > 0 ? `已记录 ${recordCount} 天` : '本月还没有记录'}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={nextMonth}
            className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors"
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekdays.map(d => (
            <div key={d} className="text-center text-xs text-gray-300 font-medium py-1">{d}</div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstWeekday }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const entry = entryMap[dateStr]
            const isToday = dateStr === todayStr
            const moodCfg = entry ? getMoodConfig(entry.mood) : null

            return (
              <motion.button
                key={day}
                whileHover={entry ? { scale: 1.15 } : {}}
                whileTap={entry ? { scale: 0.95 } : {}}
                onClick={() => entry && navigate(`/detail/${entry.id}`)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-shadow ${
                  entry ? 'cursor-pointer shadow-sm' : 'cursor-default'
                } ${isToday && !entry ? 'ring-2 ring-violet-300 ring-offset-1' : ''}`}
                style={{ backgroundColor: moodCfg ? moodCfg.color + '28' : '#f9fafb' }}
              >
                <span className={`text-xs ${entry ? 'text-gray-600 font-medium' : 'text-gray-300'}`}>{day}</span>
                {entry && <span className="text-xs leading-none mt-0.5">{moodCfg?.emoji}</span>}
                {isToday && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-violet-400" />
                )}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="mt-4 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white"
      >
        <p className="text-xs text-gray-400 font-medium mb-3">心情图例</p>
        <div className="grid grid-cols-5 gap-2">
          {MOODS.map(m => (
            <div key={m.type} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
                style={{ backgroundColor: m.color + '28' }}
              >
                {m.emoji}
              </div>
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
