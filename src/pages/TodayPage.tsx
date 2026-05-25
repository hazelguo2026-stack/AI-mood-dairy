import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw } from 'lucide-react'
import { MOODS, type MoodType, getMoodConfig } from '../types'
import { today, getEntryByDate, saveEntry } from '../storage'
import { analyzeMood } from '../ai'
import QuoteCard from '../components/QuoteCard'

const up = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
})

/** 生成最近 N 天的日期数组（从最早到今天） */
function getRecentDates(n = 7): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().slice(0, 10)
  })
}

/** 日期芯片的友好标签 */
function chipLabel(dateStr: string, todayStr: string): string {
  const diff = Math.round(
    (new Date(todayStr + 'T00:00:00').getTime() - new Date(dateStr + 'T00:00:00').getTime()) /
      86400000,
  )
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  if (diff === 2) return '前天'
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export default function TodayPage() {
  const navigate = useNavigate()
  const { date: dateParam } = useParams<{ date?: string }>()
  const todayStr = today()

  // 当前编辑的日期：URL 参数优先，否则为今天
  const date = dateParam ?? todayStr
  const isToday = date === todayStr

  const recentDates = getRecentDates(7)

  // 每次 date 变化时重新加载对应日期的记录
  const [existing, setExisting] = useState(() => getEntryByDate(date))
  const [mood, setMood] = useState<MoodType | null>(existing?.mood ?? null)
  const [text, setText] = useState(existing?.text ?? '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(!!existing)
  const [aiError, setAiError] = useState<string | null>(null)

  useEffect(() => {
    const e = getEntryByDate(date)
    setExisting(e)
    setMood(e?.mood ?? null)
    setText(e?.text ?? '')
    setDone(!!e)
    setAiError(null)
  }, [date])

  async function handleSubmit() {
    if (!mood || !text.trim()) return
    setLoading(true)
    setAiError(null)

    // 先保存日记，确保内容不丢失
    const entryId = existing?.id ?? crypto.randomUUID()
    const entry = {
      id: entryId,
      date,
      mood,
      text: text.trim(),
      aiResponse: '',
      createdAt: existing?.createdAt ?? Date.now(),
    }
    saveEntry(entry)

    // 再请求 AI
    try {
      const aiResponse = await analyzeMood(text.trim(), mood)
      saveEntry({ ...entry, aiResponse })
      navigate(`/detail/${entryId}`)
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : '未知错误'
      // 判断常见错误类型给友好提示
      const isTimeout = errMsg.includes('timeout') || errMsg.includes('timed out')
      const isBusy = errMsg.includes('busy') || errMsg.includes('unavailable') || errMsg.includes('503')
      const friendly = isTimeout
        ? 'AI 响应超时了，日记已保存 ✓'
        : isBusy
          ? 'AI 服务器繁忙，日记已保存 ✓ 可以稍后重试'
          : `AI 回应失败，日记已保存 ✓（${errMsg.slice(0, 60)}）`
      setAiError(friendly)
      setLoading(false)
    }
  }

  const dateLabel = new Date(date + 'T00:00:00').toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  // 标题文案随日期动态变化
  const titleLine1 = isToday ? '今天感觉' : chipLabel(date, todayStr)
  const titleLine2 = isToday ? '怎么样？' : '那天感觉如何？'

  function handleChipClick(d: string) {
    if (d === todayStr) navigate('/')
    else navigate(`/diary/${d}`)
  }

  return (
    <div className="max-w-lg mx-auto px-5 pt-10 pb-32">
      {/* ── 近 7 天快速切换条 ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none"
      >
        {recentDates.map(d => {
          const isActive = d === date
          const hasEntry = !!getEntryByDate(d)
          const moodCfg = hasEntry ? getMoodConfig(getEntryByDate(d)!.mood) : null
          return (
            <motion.button
              key={d}
              onClick={() => handleChipClick(d)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border transition-all duration-200 ${
                isActive
                  ? 'bg-violet-500 border-violet-500 shadow-md shadow-violet-200'
                  : 'bg-white/80 border-white hover:border-violet-200'
              }`}
            >
              <span className={`text-xs font-medium whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {chipLabel(d, todayStr)}
              </span>
              {hasEntry && moodCfg ? (
                <span className="text-sm leading-none">{moodCfg.emoji}</span>
              ) : (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white/50' : 'bg-gray-200'}`} />
              )}
            </motion.button>
          )
        })}
      </motion.div>

      {/* ── 标题区 ── */}
      <motion.div {...up(0)} className="mb-8">
        <p className="text-xs font-medium tracking-widest text-purple-400 uppercase mb-1">{dateLabel}</p>
        {isToday ? (
          <h1 className="text-3xl font-bold text-gray-800 leading-tight">
            今天感觉<br />怎么样？
          </h1>
        ) : (
          <h1 className="text-3xl font-bold text-gray-800 leading-tight">
            {titleLine1}<br />
            <span className="text-2xl text-gray-500 font-semibold">{titleLine2}</span>
          </h1>
        )}
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
            <p className="text-gray-400 mb-6 font-light">
              {isToday ? '今天已经记录过啦' : '这天已经记录过啦'}
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(`/detail/${existing.id}`)}
              className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-8 py-3 rounded-2xl font-medium shadow-lg shadow-purple-200"
            >
              {isToday ? '查看今日日记' : '查看当日日记'}
            </motion.button>
            <div className="mt-4">
              <button
                onClick={() => setDone(false)}
                className="text-gray-400 text-sm flex items-center gap-1 mx-auto hover:text-gray-600 transition-colors"
              >
                <RotateCcw size={13} /> 重新写一篇
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* 心情选择 */}
            <motion.div
              {...up(0.08)}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white mb-4"
            >
              <p className="text-xs text-gray-400 font-medium mb-4 tracking-wide">
                {isToday ? '选择今日心情' : '选择当日心情'}
              </p>
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
                    style={
                      mood === m.type
                        ? { backgroundColor: m.color + '22', boxShadow: `0 4px 16px ${m.color}30` }
                        : { backgroundColor: 'transparent' }
                    }
                  >
                    <span className="text-3xl">{m.emoji}</span>
                    <span
                      className="text-xs font-medium transition-colors duration-200"
                      style={{ color: mood === m.type ? m.color : '#d1d5db' }}
                    >
                      {m.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* 文字输入 */}
            <motion.div
              {...up(0.16)}
              className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white mb-4"
            >
              <p className="text-xs text-gray-400 font-medium mb-3 tracking-wide">
                {isToday ? '写下今天的故事' : '写下那天的故事'}
              </p>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={isToday ? '今天发生了什么？有什么感受想记录下来……' : '那天发生了什么？现在回想起来……'}
                rows={6}
                className="w-full bg-transparent text-gray-700 resize-none focus:outline-none text-sm leading-relaxed placeholder:text-gray-300"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-300">{text.length} 字</span>
              </div>
            </motion.div>

            {/* 提交按钮 */}
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

              {/* AI 错误提示 */}
              <AnimatePresence>
                {aiError && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3 flex items-start gap-3"
                  >
                    <span className="text-lg mt-0.5">⚠️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-700 text-sm leading-relaxed">{aiError}</p>
                      <button
                        onClick={() => {
                          const saved = getEntryByDate(date)
                          if (saved) navigate(`/detail/${saved.id}`)
                        }}
                        className="mt-2 text-violet-500 text-sm font-medium hover:text-violet-700 transition-colors"
                      >
                        查看已保存的日记 →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
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
