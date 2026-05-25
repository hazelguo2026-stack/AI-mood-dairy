import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react'
import { getEntryById, saveEntry } from '../storage'
import { getMoodConfig } from '../types'
import { analyzeMood } from '../ai'

const up = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
})

export default function DetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [entry, setEntry] = useState(() => (id ? getEntryById(id) : undefined))
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  if (!entry) {
    return (
      <div className="max-w-lg mx-auto px-5 pt-20 pb-32 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-gray-400">找不到这篇日记</p>
        <button onClick={() => navigate('/')} className="mt-4 text-violet-500 font-medium">
          返回首页
        </button>
      </div>
    )
  }

  const cfg = getMoodConfig(entry.mood)
  const dateLabel = new Date(entry.date + 'T00:00:00').toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
  })

  async function handleRetryAI() {
    setRetrying(true)
    setRetryError(null)
    try {
      const aiResponse = await analyzeMood(entry!.text, entry!.mood)
      const updated = { ...entry!, aiResponse }
      saveEntry(updated)
      setEntry(updated)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      const isBusy = msg.includes('busy') || msg.includes('unavailable') || msg.includes('503')
      const isTimeout = msg.includes('timeout') || msg.includes('timed out')
      setRetryError(
        isBusy ? 'AI 服务器繁忙，稍后再试试吧' :
        isTimeout ? '请求超时，检查一下网络？' :
        `请求失败：${msg.slice(0, 50)}`
      )
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-32">
      <motion.button
        {...up(0)}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-gray-400 text-sm mb-8 hover:text-gray-600 transition-colors"
      >
        <ArrowLeft size={15} /> 返回
      </motion.button>

      {/* 心情标题 */}
      <motion.div
        {...up(0.05)}
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

      {/* 日记内容 */}
      <motion.div
        {...up(0.12)}
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-white mb-4"
      >
        <p className="text-xs text-gray-400 font-medium mb-3 tracking-wide">我的记录</p>
        <p className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">{entry.text}</p>
      </motion.div>

      {/* AI 回应 */}
      <motion.div
        {...up(0.2)}
        className="rounded-3xl p-6 border"
        style={{ backgroundColor: cfg.color + '0a', borderColor: cfg.color + '25' }}
      >
        <p className="text-xs font-medium mb-3 flex items-center gap-1.5" style={{ color: cfg.color }}>
          <Sparkles size={13} /> AI 的话
        </p>

        <AnimatePresence mode="wait">
          {entry.aiResponse ? (
            // 有内容：正常显示
            <motion.p
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap"
            >
              {entry.aiResponse}
            </motion.p>
          ) : retrying ? (
            // 重试中
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 py-2"
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="w-4 h-4 border-2 border-gray-300 border-t-violet-500 rounded-full block flex-shrink-0"
              />
              <span className="text-sm text-gray-400">AI 正在感受你的心情…</span>
            </motion.div>
          ) : (
            // 无回应：提示 + 重试按钮
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p className="text-sm text-gray-400 mb-3">
                上次 AI 回应没有获取到，点下面重新试试？
              </p>
              {retryError && (
                <p className="text-xs text-amber-600 mb-3 bg-amber-50 rounded-xl px-3 py-2">
                  ⚠️ {retryError}
                </p>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleRetryAI}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white"
                style={{ backgroundColor: cfg.color }}
              >
                <RefreshCw size={14} />
                重新获取 AI 回应
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
