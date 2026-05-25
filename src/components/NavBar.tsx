import { NavLink, useMatch } from 'react-router-dom'
import { PenLine, CalendarDays, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NavBar() {
  // /diary/:date 路由也属于"今日记录"入口，高亮今日 tab
  const isDiaryRoute = useMatch('/diary/:date')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10">
      <div className="max-w-lg mx-auto px-4 pb-5">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-100/50 border border-white/80 flex py-2 px-2">
          {/* 今日 */}
          <NavLink to="/" end className="flex-1 block">
            {({ isActive }) => {
              const active = isActive || !!isDiaryRoute
              return (
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`relative flex flex-col items-center gap-1 py-2 rounded-xl ${
                    active ? 'text-violet-600' : 'text-gray-400'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-violet-50 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <PenLine size={20} strokeWidth={active ? 2.5 : 1.8} />
                  <span className="text-xs font-medium">今日</span>
                </motion.div>
              )
            }}
          </NavLink>

          {/* 日历 */}
          <NavLink to="/calendar" className="flex-1 block">
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative flex flex-col items-center gap-1 py-2 rounded-xl ${
                  isActive ? 'text-violet-600' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-violet-50 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <CalendarDays size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-xs font-medium">日历</span>
              </motion.div>
            )}
          </NavLink>

          {/* 历史 */}
          <NavLink to="/history" className="flex-1 block">
            {({ isActive }) => (
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative flex flex-col items-center gap-1 py-2 rounded-xl ${
                  isActive ? 'text-violet-600' : 'text-gray-400'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-violet-50 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <BookOpen size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-xs font-medium">历史</span>
              </motion.div>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
