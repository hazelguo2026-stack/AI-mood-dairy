import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { loadEntries } from '../storage'
import { getMoodConfig } from '../types'

export default function HistoryPage() {
  const navigate = useNavigate()
  const entries = loadEntries()

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }} className="mb-6"
      >
        <p className="text-xs font-medium tracking-widest text-purple-400 uppercase mb-1">回忆录</p>
        <h1 className="text-3xl font-bold text-gray-800">历史日记</h1>
      </motion.div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-sm border border-white text-center"
        >
          <div className="text-5xl mb-4">📖</div>
          <p className="text-gray-400 font-light">还没有日记，去写第一篇吧</p>
        </motion.div>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => {
            const cfg = getMoodConfig(entry.mood)
            const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('zh-CN', {
              month: 'long', day: 'numeric', weekday: 'short',
            })
            return (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                whileHover={{ y: -2, shadow: 'lg' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/detail/${entry.id}`)}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white text-left flex gap-4 items-center hover:shadow-md transition-shadow duration-200"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ backgroundColor: cfg.color + '22' }}
                >
                  {cfg.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{dateLabel}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{entry.text}</p>
                </div>
                <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
