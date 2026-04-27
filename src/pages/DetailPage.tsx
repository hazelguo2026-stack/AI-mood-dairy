import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { getEntryById } from '../storage'
import { getMoodConfig } from '../types'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
})

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const entry = id ? getEntryById(id) : undefined

  if (!entry) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-20 pb-32 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-400">找不到这篇日记</p>
        <button onClick={() => navigate('/')} className="mt-4 text-violet-500 font-medium">返回首页</button>
      </div>
    )
  }

  const cfg = getMoodConfig(entry.mood)
  const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-32">
      <motion.button
        {...fadeUp(0)}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-gray-400 text-sm mb-8 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft size={15} /> 返回
      </motion.button>

      {/* Mood header */}
      <motion.div
        {...fadeUp(0.05)}
        className="rounded-3xl p-6 mb-4 border"
        style={{ backgroundColor: cfg.color + '12', borderColor: cfg.color + '25' }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl"
            style={{ backgroundColor: cfg.color + '22' }}
          >
            {cfg.emoji}
          </motion.div>
          <div>
            <p className="text-sm font-semibold mb-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
            <p className="text-sm text-gray-400 font-light">{dateLabel}</p>
          </div>
        </div>
      </motion.div>

      {/* Diary text */}
      <motion.div
        {...fadeUp(0.12)}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white mb-4"
      >
        <p className="text-xs text-gray-400 font-medium mb-3 tracking-wide">我的记录</p>
        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{entry.text}</p>
      </motion.div>

      {/* AI response */}
      <motion.div
        {...fadeUp(0.2)}
        className="rounded-3xl p-6 border"
        style={{ backgroundColor: cfg.color + '0a', borderColor: cfg.color + '25' }}
      >
        <p className="text-xs font-medium mb-3 flex items-center gap-1.5" style={{ color: cfg.color }}>
          <Sparkles size={13} /> AI 的话
        </p>
        <p className="text-gray-700 leading-relaxed text-sm">{entry.aiResponse}</p>
      </motion.div>
    </div>
  )
}
