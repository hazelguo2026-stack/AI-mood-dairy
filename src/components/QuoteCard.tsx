import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote } from 'lucide-react'

const QUOTES = [
  { text: '千里之行，始于足下', author: '老子' },
  { text: '不积跬步，无以至千里', author: '荀子' },
  { text: '世上无难事，只要肯攀登', author: '毛泽东' },
  { text: '天道酬勤', author: '古语' },
  { text: '柳暗花明又一村', author: '陆游' },
  { text: '种一棵树最好的时间是十年前，其次是现在', author: '古谚' },
  { text: '今日的努力，是明日的幸运', author: '' },
  { text: '每一个不曾起舞的日子，都是对生命的辜负', author: '尼采' },
  { text: '生活不止眼前的苟且，还有诗和远方', author: '高晓松' },
  { text: '心中有光，何惧路长', author: '' },
  { text: '愿你出走半生，归来仍是少年', author: '王栋生' },
  { text: '慢慢来，比较快', author: '台湾谚语' },
  { text: '失败是成功之母', author: '古语' },
  { text: '你只管努力，剩下的交给时间', author: '' },
  { text: '把每一个平凡的日子，过成不平凡的自己', author: '' },
]

export default function QuoteCard() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length))

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % QUOTES.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const quote = QUOTES[index]

  return (
    <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-sm rounded-3xl p-5 border border-violet-100 overflow-hidden">
      <div className="flex items-start gap-3">
        <Quote size={16} className="text-violet-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-h-[56px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <p className="text-gray-700 font-medium text-sm leading-relaxed">{quote.text}</p>
              {quote.author && (
                <p className="text-violet-400 text-xs mt-1.5">—— {quote.author}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1 mt-4 justify-end">
        {QUOTES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index ? 'w-4 h-1.5 bg-violet-400' : 'w-1.5 h-1.5 bg-violet-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
