import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Masthead from './components/Masthead.jsx'
import { ISSUE } from './data/content.js'

import Discover from './screens/Discover.jsx'
import Leaderboard from './screens/Leaderboard.jsx'
import Compare from './screens/Compare.jsx'
import Managers from './screens/Managers.jsx'
import ManagerProfile from './screens/ManagerProfile.jsx'
import StrategyDetail from './screens/StrategyDetail.jsx'
import Research from './screens/Research.jsx'
import Events from './screens/Events.jsx'
import Learn from './screens/Learn.jsx'
import Invest from './screens/Invest.jsx'
import Portfolio from './screens/Portfolio.jsx'
import Fees from './screens/Fees.jsx'
import Plans from './screens/Plans.jsx'

export default function App() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="page">
      <div className="shell">
        <Masthead />

        <Routes>
          <Route path="/" element={<Navigate to="/discover" replace />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/managers" element={<Managers />} />
          <Route path="/managers/:slug" element={<ManagerProfile />} />
          <Route path="/strategy/:slug" element={<StrategyDetail />} />
          <Route path="/research" element={<Research />} />
          <Route path="/events" element={<Events />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/invest" element={<Invest />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/fees" element={<Fees />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="*" element={<Navigate to="/discover" replace />} />
        </Routes>

        <footer className="foot">
          <span>Past performance is not indicative of future returns. Figures net of fees unless stated.</span>
          <span>Bunker-o-Billionaire · {ISSUE.asAt} · sample data</span>
        </footer>
      </div>
    </div>
  )
}
