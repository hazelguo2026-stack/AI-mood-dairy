import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Sparkles, Clock } from 'lucide-react'
import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: import.meta.env.VITE_DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com/v1',
  dangerouslyAllowBrowser: true,
})

interface ScheduleItem {
  time: string
  task: string
  duration: string
  tip: string
}

const up = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4 },
})

export default function PlanPage() {
  const [todos, setTodos] = useState<string[]>([''])
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('22:00')
  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function addTodo() {
    setTodos(t => [...t, ''])
  }

  function updateTodo(i: number, val: string) {
    setTodos(t => t.map((v, idx) => idx === i ? val : v))
  }

  function removeTodo(i: number) {
    setTodos(t => t.filter((_, idx) => idx !== i))
  }

  async function generate() {
    const tasks = todos.filter(t => t.trim())
    if (tasks.length === 0) return
    setLoading(true)
    setError('')
    setSchedule([])
    try {
      const prompt = `我今天的可用时间是 ${startTime} 到 ${endTime}，需要完成以下任务：\n${tasks.map((t, i) => `${i + 1}. ${t}`).join('\n')}\n\n请帮我制定一份科学合理的时间表。要求：\n1. 合理分配时间，考虑专注力曲线，重要/难的任务安排在精力充沛时段\n2. 适当安排休息\n3. 返回严格的JSON数组格式，不要有任何其他文字，格式如下：\n[{"time":"09:00","task":"任务名称","duration":"60分钟","tip":"简短建议"}]`

      const res = await client.chat.completions.create({
        model: 'deepseek-chat',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: '你是一个时间管理专家。只返回JSON数组，不要返回任何其他内容。' },
          { role: 'user', content: prompt },
        ],
      })

      const raw = res.choices[0]?.message?.content ?? ''
      const match = raw.match(/\[[\s\S]*\]/)
      if (!match) throw new Error('格式解析失败')
      setSchedule(JSON.parse(match[0]))
    } catch {
      setError('生成失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const colors = [
    '#6d28d9', '#7c3aed', '#8b5cf6', '#a78bfa',
    '#c4b5fd', '#3b82f6', '#0ea5e9', '#06b6d4',
  ]

  return (
    <div className="max-w-lg mx-auto px-5 pt-12 pb-32">
      <motion.div {...up(0)} className="mb-6">
        <p className="text-xs font-medium tracking-widest text-purple-400 uppercase mb-1">AI 时间管理</p>
        <h1 className="text-3xl font-bold text-gray-800">今日规划</h1>
      </motion.div>

      {/* Time range */}
      <motion.div {...up(0.06)} className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white mb-4">
        <p className="text-xs text-gray-400 font-medium mb-3 tracking-wide">可用时间段</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5">
            <Clock size={14} className="text-violet-400" />
            <input
              type="time" value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="bg-transparent text-gray-700 text-sm font-medium focus:outline-none w-full"
            />
          </div>
          <span className="text-gray-400 text-sm">—</span>
          <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-2.5">
            <Clock size={14} className="text-violet-400" />
            <input
              type="time" value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="bg-transparent text-gray-700 text-sm font-medium focus:outline-none w-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Todo list */}
      <motion.div {...up(0.12)} className="bg-white/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm border border-white mb-4">
        <p className="text-xs text-gray-400 font-medium mb-3 tracking-wide">今天要做的事</p>
        <div className="flex flex-col gap-2">
          {todos.map((todo, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <span className="text-xs text-violet-400 font-bold w-5 text-center">{i + 1}</span>
              <input
                value={todo}
                onChange={e => updateTodo(i, e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addTodo()}
                placeholder={`任务 ${i + 1}…`}
                className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-200 placeholder:text-gray-300"
              />
              {todos.length > 1 && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => removeTodo(i)}
                  className="text-gray-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={addTodo}
          className="mt-3 flex items-center gap-1.5 text-violet-400 text-sm font-medium hover:text-violet-600 transition-colors"
        >
          <Plus size={15} /> 添加任务
        </motion.button>
      </motion.div>

      {/* Generate button */}
      <motion.div {...up(0.18)}>
        <motion.button
          onClick={generate}
          disabled={loading || todos.every(t => !t.trim())}
          whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          className={`w-full py-4 rounded-2xl font-semibold text-white transition-all duration-300 ${
            !loading && todos.some(t => t.trim())
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
              AI 正在规划中…
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Sparkles size={16} /> 生成今日时间表
            </span>
          )}
        </motion.button>
        {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
      </motion.div>

      {/* Schedule result */}
      <AnimatePresence>
        {schedule.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <p className="text-xs text-gray-400 font-medium mb-4 tracking-wide px-1">你的时间表</p>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[30px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-violet-300 to-purple-200" />

              <div className="flex flex-col gap-3">
                {schedule.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35 }}
                    className="flex gap-4 items-start"
                  >
                    {/* Dot */}
                    <div className="flex-shrink-0 w-[60px] flex flex-col items-center gap-1 pt-1">
                      <div
                        className="w-3 h-3 rounded-full border-2 border-white shadow-sm z-10"
                        style={{ backgroundColor: colors[i % colors.length] }}
                      />
                      <span className="text-xs font-bold text-gray-500">{item.time}</span>
                    </div>

                    {/* Card */}
                    <div
                      className="flex-1 rounded-2xl p-4 border mb-1"
                      style={{
                        backgroundColor: colors[i % colors.length] + '10',
                        borderColor: colors[i % colors.length] + '30',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-gray-800 text-sm">{item.task}</p>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: colors[i % colors.length] + '20',
                            color: colors[i % colors.length],
                          }}
                        >
                          {item.duration}
                        </span>
                      </div>
                      {item.tip && (
                        <p className="text-xs text-gray-500 mt-1">{item.tip}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
