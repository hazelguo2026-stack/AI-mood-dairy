import { BrowserRouter, Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import TodayPage from './pages/TodayPage'
import CalendarPage from './pages/CalendarPage'
import HistoryPage from './pages/HistoryPage'
import DetailPage from './pages/DetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<TodayPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/detail/:id" element={<DetailPage />} />
        </Routes>
        <NavBar />
      </div>
    </BrowserRouter>
  )
}
