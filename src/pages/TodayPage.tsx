import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw } from 'lucide-react'
import { MOODS, type MoodType } from '../types'
import { today, getEntryByDate, saveEntry } from '../storage'
import { analyzeMood } from '../ai'
import QuoteCard from '../components/QuoteCard'

const up = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
})

export default function TodayPage() {
  const navigate = useNavigate()
  const date = today()
  const existing = getEntryByDate(date)

  const [mood, setMood] = useState<MoodType | null>(existing?.mood ?? null)
  const [text, setText] = useState(existing?.text ?? '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(!!existing)

  useEffect(() => { if (existing) setDone(true) }, [])

  async function handleSubmit() {
    if (!mood || !text.trim()) return
    setLoading(true)
    try {
      const aiResponse = await analyzeMood(text, mood)
      const entry = {
        id: existing?.id ?? crypto.randomUUID(),
        date, mood, text: text.trim(), aiResponse,
        createdAt: existing?.createdAt ?? Date.now(),
      }
      saveEntry(entry)
      navigate(`/detail/${entry.id}`)
    } finally {
      setLoading(false)
    }
  }

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-32">
      <motion.div {...up(0)} className="mb-8">
        <p className="text-xs font-medium tracking-widest text-purple-400 uppercase mb-1">{dateLabel}</p>
        <h1 className="text-3xl font-bold text-gray-800 leading-tight">今天感觉<br/>怎么样？</h1>
      </motion.div>

      <AnimatePresence mode="wait">
        {done && existing ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="text-6xl mb-4"
            >
              {MOODS.find(m => m.type === existing.mood)?.emoji}
            </motion.div>
            <p className="text-gray-400 mb-6 font-light">今天已经记录过啦</p>
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/detail/${existing.id}`)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-medium shadow-lg shadow-purple-200"
            >
              查看今日日记
            </motion.button>
            <div className="mt-4">
              <button onClick={() => setDone(false)} className="text-gray-400 text-sm flex items-center gap-1 mx-auto hover:text-gray-600 transition-colors">
                <RotateCcw size={13} /> 重新写一篇
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Mood selector */}
            <motion.div {...up(0.08)} className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white mb-4">
              <p className="text-xs text-gray-400 font-medium mb-4 tracking-wide">选择今日心情</p>
              <div className="flex justify-between gap-2">
                {MOODS.map(m => (
                  <motion.button
                    key={m.type}
                    onClick={() => setMood(m.type)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    animate={mood === m.type ? { scale: 1.1 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="flex flex-col items-center gap-2 flex-1 py-3 rounded-2xl transition-colors duration-200"
                    style={mood === m.type
                      ? { backgroundColor: m.color + '22', boxShadow: `0 4px 16px ${m.color}30` }
                      : { backgroundColor: 'transparent' }
                    }
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span className="text-xs font-medium transition-colors duration-200"
                      style={{ color: mood === m.type ? m.color : '#d1d5db' }}
                    >
                      {m.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Textarea */}
            <motion.div {...up(0.16)} className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white mb-4">
              <p className="text-xs text-gray-400 font-medium mb-3 tracking-wide">写下今天的故事</p>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="今天发生了什么？有什么感受想记录下来……"
                rows={6}
                className="w-full bg-transparent text-gray-700 resize-none focus:outline-none text-sm leading-relaxed placeholder:text-gray-300"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-300">{text.length} 字</span>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div {...up(0.24)}>
              <motion.button
                onClick={handleSubmit}
                disabled={!mood || !text.trim() || loading}
                whileHover={mood && text.trim() && !loading ? { scale: 1.02, y: -2 } : {}}
                whileTap={mood && text.trim() && !loading ? { scale: 0.98 } : {}}
                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${
                  mood && text.trim() && !loading
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-purple-200'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full block"
                    />
                    AI 正在感受你的心情…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={16} /> 保存并获取 AI 回应
                  </span>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div {...up(0.4)} className="mt-4">
        <QuoteCard />
      </motion.div>
    </div>
  )
}
