import { NavLink } from 'react-router-dom'
import { PenLine, CalendarDays, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'

const links = [
  { to: '/', label: '今日', Icon: PenLine },
  { to: '/calendar', label: '日历', Icon: CalendarDays },
  { to: '/history', label: '历史', Icon: BookOpen },
]

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10">
      <div className="max-w-lg mx-auto px-4 pb-5">
        <div className="bg-white/75 backdrop-blur-xl rounded-2xl shadow-2xl shadow-purple-100/50 border border-white/80 flex py-2 px-2">
          {links.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end className="flex-1 block">
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
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="text-xs font-medium">{label}</span>
                </motion.div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
