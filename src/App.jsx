import { useState, useEffect } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import AuthModal from './components/AuthModal'
import Home from './pages/Home'
import WatchlistPage from './pages/Watchlist'
import { getUserWatchlist } from './lib/watchlistService'

// Custom SVG Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const ENV_API_KEY = import.meta.env.VITE_OMDB_API_KEY || ''

export default function App() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [watchlist, setWatchlist] = useState([])

  // Custom API Key states (stores in localstorage so user doesn't need to rebuild vite)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('cinemate_api_key') || ENV_API_KEY || ''
  })
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(apiKey)
  
  const isLiveMode = !!apiKey && apiKey !== 'YOUR_OMDB_API_KEY_HERE' && apiKey.trim() !== ''

  // Fetch watchlist from Supabase when user logs in or local storage when guest
  useEffect(() => {
    if (!user) {
      try {
        const localWatchlist = JSON.parse(localStorage.getItem('cinemate_watchlist') || '[]')
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setWatchlist(localWatchlist)
      } catch {
        setWatchlist([])
      }
      return
    }

    const fetchUserWatchlist = async () => {
      try {
        const dbWatchlist = await getUserWatchlist(user.id)
        const mapped = dbWatchlist.map(item => ({
          imdbID: item.movie_id,
          Title: item.movie_title,
          Poster: item.movie_poster,
          status: item.status,
          Type: 'movie'
        }))
        setWatchlist(mapped)
      } catch (err) {
        console.error('Failed to load watchlist from Supabase:', err)
      }
    }

    fetchUserWatchlist()
  }, [user])

  // Save watchlist to localstorage only for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cinemate_watchlist', JSON.stringify(watchlist))
    }
  }, [watchlist, user])

  const handleWatchlistChange = ({ action, movie, movieId, status, list }) => {
    setWatchlist(prev => {
      if (action === 'sync') {
        return list
      } else if (action === 'remove') {
        return prev.filter(m => m.imdbID !== movieId)
      } else if (action === 'add') {
        const id = movie.imdbID || movie.movie_id
        if (prev.some(m => m.imdbID === id)) return prev
        return [...prev, {
          imdbID: id,
          Title: movie.Title || movie.movie_title,
          Poster: movie.Poster || movie.movie_poster,
          status,
          Type: 'movie'
        }]
      } else if (action === 'update') {
        return prev.map(m => m.imdbID === movieId ? { ...m, status } : m)
      }
      return prev
    })
  }

  // Save Custom Key handler
  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim()
    localStorage.setItem('cinemate_api_key', trimmed)
    setApiKey(trimmed)
    setShowSettings(false)
  }

  // Clear Custom Key handler
  const handleClearApiKey = () => {
    localStorage.removeItem('cinemate_api_key')
    setApiKey('')
    setApiKeyInput('')
    setShowSettings(false)
  }

  return (
    <>
      <div className="grain" />
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="header-brand" onClick={() => { setQuery(''); navigate('/'); }}>
              <div className="logo">
                <span className="logo-icon">✦</span>
                <span className="logo-text">CINEMATE</span>
              </div>
            </div>

            <div className="search-wrap">
              <span className="search-icon"><SearchIcon /></span>
              <input
                className="search-input"
                type="text"
                placeholder="Search movies, series, genres..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button className="clear-btn" onClick={() => setQuery('')} aria-label="Clear search">
                  <CloseIcon />
                </button>
              )}
            </div>

            <div className="header-actions-right">
              <span className={`status-badge ${isLiveMode ? 'live' : 'demo'}`}>
                <span className="status-dot"></span>
                {isLiveMode ? 'Live Mode' : 'Demo Mode'}
              </span>

              {/* Authentication navbar controls */}
              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/watchlist"
                    className="text-xs font-semibold text-zinc-400 hover:text-white transition-all bg-white/5 border border-white/5 hover:border-white/10 px-3.5 py-1.5 rounded-full"
                  >
                    🍿 My Watchlist
                  </Link>
                  <span className="hidden sm:inline text-xs text-zinc-400 max-w-[150px] truncate" title={user.email}>
                    {user.email}
                  </span>
                  <button
                    onClick={signOut}
                    className="btn btn-secondary py-1.5 px-3.5 text-xs rounded-full border border-white/10 hover:bg-white/10 text-white cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="btn py-1.5 px-4 text-xs font-semibold rounded-full bg-white text-black hover:bg-zinc-200 transition-all duration-200 cursor-pointer"
                >
                  Sign In
                </button>
              )}

              <div className="settings-wrap">
                <button
                  className={`settings-btn ${showSettings ? 'active' : ''}`}
                  onClick={() => setShowSettings(!showSettings)}
                  title="Configure OMDb API Key"
                >
                  <SettingsIcon />
                </button>

                {showSettings && (
                  <div className="settings-popover">
                    <h4 className="settings-title">OMDb Configuration</h4>
                    <p className="settings-label">
                      Enter an API Key to query real, live movie metadata details:
                    </p>
                    <input
                      type="text"
                      className="settings-input"
                      placeholder="Paste OMDb API Key..."
                      value={apiKeyInput}
                      onChange={e => setApiKeyInput(e.target.value)}
                    />
                    <div className="settings-actions">
                      {apiKey && (
                        <button className="settings-btn-clear" onClick={handleClearApiKey}>
                          Reset
                        </button>
                      )}
                      <button className="settings-btn-save" onClick={handleSaveApiKey}>
                        Save
                      </button>
                    </div>
                    <a
                      href="http://www.omdbapi.com/apikey.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="settings-link"
                    >
                      ✦ Get a free OMDb API Key
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="main">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  query={query}
                  user={user}
                  watchlist={watchlist}
                  onWatchlistChange={handleWatchlistChange}
                  apiKey={apiKey}
                  isLiveMode={isLiveMode}
                />
              }
            />
            <Route
              path="/watchlist"
              element={
                <WatchlistPage
                  query={query}
                  openAuthModal={() => setIsAuthModalOpen(true)}
                  watchlist={watchlist}
                  onWatchlistChange={handleWatchlistChange}
                />
              }
            />
          </Routes>
        </main>

        <footer className="footer">
          <p>© {new Date().getFullYear()} CINEMATE · Powered by OMDb API & Local Demo Engine</p>
        </footer>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}