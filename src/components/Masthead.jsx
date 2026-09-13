import { NavLink, useNavigate } from 'react-router-dom'
import { ISSUE, USER } from '../data/content.js'
import BunkerLogo from './BunkerLogo.jsx'

const TABS = [
  ['Discover', '/discover'],
  ['Leaderboard', '/leaderboard'],
  ['Compare', '/compare'],
  ['Managers', '/managers'],
  ['Research', '/research'],
  ['Events', '/events'],
  ['Learn', '/learn'],
]

const UTIL = [
  ['Portfolio', '/portfolio'],
  ['Fees', '/fees'],
  ['Plans', '/plans'],
]

export default function Masthead() {
  const navigate = useNavigate()

  return (
    <header className="masthead">
      <div className="masthead__top">
        <div className="wordmark">
          <BunkerLogo size={52} tone="dark" title="Bunker-o-Billionaire" />
          <div className="wordmark__text">
            <span className="wordmark__name">
              Bunker<span>-o-</span>Billionaire
            </span>
            <span className="wordmark__meta">
              {ISSUE.dateLine} · {ISSUE.issue} · {ISSUE.tracked}
            </span>
          </div>
        </div>

        <div className="masthead__right">
          {UTIL.map(([label, to]) => (
            <NavLink
              key={label}
              to={to}
              className={({ isActive }) => `util${isActive ? ' util--on' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          <span className="whoami">
            {USER.name} · {USER.role}
          </span>
          <button type="button" className="btn btn--primary btn--lg" onClick={() => navigate('/invest')}>
            Invest now
          </button>
        </div>
      </div>

      <nav className="tabs">
        {TABS.map(([label, to]) => (
          <NavLink key={label} to={to} className={({ isActive }) => `tab${isActive ? ' tab--on' : ''}`}>
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
