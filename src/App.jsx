import { useState, useEffect, useCallback } from 'react'
import { mockMovies } from './mockData'

const ENV_API_KEY = import.meta.env.VITE_OMDB_API_KEY || ''

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

// Custom SVG Icons
const HeartIcon = ({ filled }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
)

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

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

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
)

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster" />
      <div className="skeleton-info">
        <div className="skeleton-line short" />
        <div className="skeleton-line long" />
        <div className="skeleton-line medium" />
      </div>
    </div>
  )
}

function MovieCard({ movie, onClick, isWatchlisted, onWatchlistToggle }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null

  return (
    <div className="movie-card" onClick={() => onClick(movie.imdbID)}>
      <div className="card-poster-wrap">
        <button
          className={`watchlist-btn-overlay ${isWatchlisted ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation()
            onWatchlistToggle(movie.imdbID)
          }}
          title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
        >
          <HeartIcon filled={isWatchlisted} />
        </button>

        {rating && (
          <div className="card-rating-badge">
            <StarIcon />
            <span>{rating}</span>
          </div>
        )}

        {hasPoster ? (
          <>
            {!imgLoaded && <div className="skeleton-poster abs" />}
            <img
              src={movie.Poster}
              alt={movie.Title}
              className={`card-poster ${imgLoaded ? 'visible' : 'hidden'}`}
              onLoad={() => setImgLoaded(true)}
            />
          </>
        ) : (
          <div className="no-poster">
            <span className="no-poster-icon">🎬</span>
            <span>No Poster</span>
          </div>
        )}
        <div className="card-overlay">
          <span className="card-type">{movie.Type}</span>
        </div>
      </div>
      <div className="card-info">
        <div className="card-meta">
          <span>{movie.Year}</span>
        </div>
        <h3 className="card-title">{movie.Title}</h3>
      </div>
    </div>
  )
}

function Modal({ movie, onClose, isWatchlisted, onWatchlistToggle }) {
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          <CloseIcon />
        </button>
        <div className="modal-inner">
          <div className="modal-left">
            {hasPoster
              ? <img src={movie.Poster} alt={movie.Title} className="modal-poster" />
              : <div className="no-poster tall">
                  <span className="no-poster-icon">🎬</span>
                  <span>No Poster</span>
                </div>
            }
            
            <button
              className={`btn btn-secondary ${isWatchlisted ? 'active' : ''}`}
              onClick={() => onWatchlistToggle(movie.imdbID)}
              style={{ width: '100%' }}
            >
              <HeartIcon filled={isWatchlisted} />
              {isWatchlisted ? 'In Watchlist' : 'Add to Watchlist'}
            </button>

            <div className="modal-ratings">
              {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                <div className="rating-badge">
                  <span className="rating-label">IMDb Rating</span>
                  <span className="rating-value">
                    <StarIcon />
                    {movie.imdbRating}
                  </span>
                </div>
              )}
              {movie.Metascore && movie.Metascore !== 'N/A' && (
                <div className="rating-badge">
                  <span className="rating-label">Metascore</span>
                  <span className="rating-value meta">{movie.Metascore}</span>
                </div>
              )}
            </div>
          </div>
          <div className="modal-right">
            <div className="modal-type-year">{movie.Type} · {movie.Year}</div>
            <h2 className="modal-title">{movie.Title}</h2>
            
            <div className="modal-tags">
              {movie.Genre && movie.Genre !== 'N/A' && movie.Genre.split(',').map(g => (
                <span key={g} className="tag">{g.trim()}</span>
              ))}
            </div>

            {movie.Plot && movie.Plot !== 'N/A' && (
              <p className="modal-plot">"{movie.Plot}"</p>
            )}

            <div className="modal-meta-grid">
              {movie.Director && movie.Director !== 'N/A' && (
                <div className="meta-item">
                  <span className="meta-label">Director</span>
                  <span className="meta-val">{movie.Director}</span>
                </div>
              )}
              {movie.Actors && movie.Actors !== 'N/A' && (
                <div className="meta-item">
                  <span className="meta-label">Cast</span>
                  <span className="meta-val">{movie.Actors}</span>
                </div>
              )}
              {movie.Runtime && movie.Runtime !== 'N/A' && (
                <div className="meta-item">
                  <span className="meta-label">Runtime</span>
                  <span className="meta-val">{movie.Runtime}</span>
                </div>
              )}
              {movie.Language && movie.Language !== 'N/A' && (
                <div className="meta-item">
                  <span className="meta-label">Languages</span>
                  <span className="meta-val">{movie.Language}</span>
                </div>
              )}
              {movie.Awards && movie.Awards !== 'N/A' && (
                <div className="meta-item">
                  <span className="meta-label">Awards</span>
                  <span className="meta-val">{movie.Awards}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSection({ movie, onClick, isWatchlisted, onWatchlistToggle }) {
  if (!movie) return null

  return (
    <div className="hero">
      <div className="hero-backdrop">
        <img src={movie.Backdrop || movie.Poster} alt={movie.Title} />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-tag">Featured {movie.Type}</div>
        <h1 className="hero-title">{movie.Title}</h1>
        {movie.Tagline && <div className="hero-tagline">"{movie.Tagline}"</div>}
        {movie.Plot && <p className="hero-plot">{movie.Plot}</p>}
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => onClick(movie.imdbID)}>
            <InfoIcon />
            View Details
          </button>
          <button
            className={`btn btn-secondary ${isWatchlisted ? 'active' : ''}`}
            onClick={() => onWatchlistToggle(movie.imdbID)}
          >
            <HeartIcon filled={isWatchlisted} />
            {isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('all') // 'all', 'movie', 'series', 'watchlist'
  
  // Custom API Key states (stores in localstorage so user doesn't need to rebuild vite)
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('cinemate_api_key') || ENV_API_KEY || ''
  })
  const [showSettings, setShowSettings] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState(apiKey)
  
  const isLiveMode = !!apiKey && apiKey !== 'YOUR_OMDB_API_KEY_HERE' && apiKey.trim() !== ''

  // Landing page movies - updates details live from OMDb when key is active
  const [landingMovies, setLandingMovies] = useState(mockMovies)

  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('cinemate_watchlist') || '[]')
    } catch {
      return []
    }
  })

  const debouncedQuery = useDebounce(query, 500)

  // Save watchlist to localstorage
  useEffect(() => {
    localStorage.setItem('cinemate_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  // Fetch real details of dashboard movies when live key is set
  useEffect(() => {
    if (!isLiveMode) {
      setLandingMovies(mockMovies)
      return
    }

    const loadRealDashboardDetails = async () => {
      try {
        const promises = mockMovies.map(async (m) => {
          const res = await fetch(`https://www.omdbapi.com/?i=${m.imdbID}&apikey=${apiKey}`)
          const data = await res.json()
          if (data.Response === 'True') {
            // Merge backdrop & tagline with raw real OMDb info
            return { ...m, ...data }
          }
          return m
        })
        const updated = await Promise.all(promises)
        setLandingMovies(updated)
      } catch (err) {
        console.warn("Failed to retrieve real OMDb data for landing page: ", err)
      }
    }

    loadRealDashboardDetails()
  }, [apiKey, isLiveMode])

  const fetchMovies = useCallback(async (q) => {
    const trimmed = q.trim()
    if (!trimmed) {
      setMovies([])
      setError('')
      return
    }

    setLoading(true)
    setError('')

    // Fetch implementation with API or local mock fallback
    if (isLiveMode) {
      try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(trimmed)}&apikey=${apiKey}`)
        const data = await res.json()
        if (data.Response === 'True') {
          // If searching on OMDb, we get a list of Search results
          setMovies(data.Search)
        } else {
          // Fallback to local mock search when live search yields no results
          const queryLower = trimmed.toLowerCase()
          const matched = landingMovies.filter(m => 
            m.Title.toLowerCase().includes(queryLower) ||
            m.Genre.toLowerCase().includes(queryLower) ||
            (m.Director && m.Director.toLowerCase().includes(queryLower)) ||
            (m.Actors && m.Actors.toLowerCase().includes(queryLower))
          )
          if (matched.length > 0) {
            setMovies(matched)
          } else {
            setMovies([])
            setError(data.Error || 'No results found on OMDb.')
          }
        }
      } catch {
        // Fallback to local data search on request failure
        const queryLower = trimmed.toLowerCase()
        const matched = landingMovies.filter(m => 
          m.Title.toLowerCase().includes(queryLower) ||
          m.Genre.toLowerCase().includes(queryLower)
        )
        if (matched.length > 0) {
          setMovies(matched)
        } else {
          setError('Failed to query OMDb. Please check your internet connection or API Key.')
        }
      } finally {
        setLoading(false)
      }
    } else {
      // Offline/Demo Mode Search
      setTimeout(() => {
        const queryLower = trimmed.toLowerCase()
        const matched = landingMovies.filter(m => 
          m.Title.toLowerCase().includes(queryLower) ||
          m.Genre.toLowerCase().includes(queryLower) ||
          (m.Director && m.Director.toLowerCase().includes(queryLower)) ||
          (m.Actors && m.Actors.toLowerCase().includes(queryLower))
        )
        setMovies(matched)
        if (matched.length === 0) {
          setError('No results found in demo database. Configure an OMDb API Key for full results!')
        }
        setLoading(false)
      }, 300)
    }
  }, [apiKey, isLiveMode, landingMovies])

  useEffect(() => {
    fetchMovies(debouncedQuery)
  }, [debouncedQuery, fetchMovies])

  const openMovie = async (id) => {
    // Check if it's already in our local landing/mock database or watchlist
    const localMatch = landingMovies.find(m => m.imdbID === id) || watchlist.find(m => m.imdbID === id)
    
    // If we have detailed info already (like Plot details loaded), just use it
    if (localMatch && localMatch.Plot && localMatch.Director && localMatch.Director !== 'N/A') {
      setSelected(localMatch)
      return
    }

    if (isLiveMode) {
      setLoading(true)
      try {
        const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`)
        const data = await res.json()
        if (data.Response === 'True') {
          setSelected(data)
        } else {
          if (localMatch) setSelected(localMatch)
        }
      } catch {
        if (localMatch) setSelected(localMatch)
      } finally {
        setLoading(false)
      }
    } else {
      if (localMatch) setSelected(localMatch)
    }
  }

  const toggleWatchlist = (id) => {
    setWatchlist(prev => {
      const isBookmarked = prev.some(m => m.imdbID === id)
      if (isBookmarked) {
        return prev.filter(m => m.imdbID !== id)
      } else {
        const item = movies.find(m => m.imdbID === id) || landingMovies.find(m => m.imdbID === id)
        if (item) return [...prev, item]
        return prev
      }
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

  // Determine what to display based on tab category and search query
  const getFilteredMovies = () => {
    let sourceList = []
    
    if (category === 'watchlist') {
      sourceList = watchlist
    } else if (query.trim()) {
      sourceList = movies
    } else {
      sourceList = landingMovies
    }

    return sourceList.filter(m => {
      if (category === 'movie' && m.Type !== 'movie') return false
      if (category === 'series' && m.Type !== 'series') return false
      
      // If searching within the Watchlist tab
      if (category === 'watchlist' && query.trim()) {
        const qLower = query.toLowerCase()
        return m.Title.toLowerCase().includes(qLower) || 
               (m.Genre && m.Genre.toLowerCase().includes(qLower))
      }
      
      return true
    })
  }

  const displayedMovies = getFilteredMovies()
  const featuredMovie = landingMovies[0] // Featured item
  const showHero = !query.trim() && category !== 'watchlist' && featuredMovie

  return (
    <>
      <div className="grain" />
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="header-brand" onClick={() => { setQuery(''); setCategory('all'); }}>
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
          {/* Hero Banner Section */}
          {showHero && (
            <HeroSection
              movie={featuredMovie}
              onClick={openMovie}
              isWatchlisted={watchlist.some(m => m.imdbID === featuredMovie.imdbID)}
              onWatchlistToggle={toggleWatchlist}
            />
          )}

          {/* Filtering Tabs / Category Pills */}
          <div className="categories-container">
            <div className="pills-group">
              <button
                className={`pill ${category === 'all' ? 'active' : ''}`}
                onClick={() => setCategory('all')}
              >
                All
              </button>
              <button
                className={`pill ${category === 'movie' ? 'active' : ''}`}
                onClick={() => setCategory('movie')}
              >
                Movies
              </button>
              <button
                className={`pill ${category === 'series' ? 'active' : ''}`}
                onClick={() => setCategory('series')}
              >
                Series
              </button>
              <button
                className={`pill ${category === 'watchlist' ? 'active' : ''}`}
                onClick={() => setCategory('watchlist')}
              >
                Watchlist ({watchlist.length})
              </button>
            </div>

            {!loading && (query.trim() || category === 'watchlist') && (
              <div className="results-count">
                Found <span>{displayedMovies.length}</span> {displayedMovies.length === 1 ? 'result' : 'results'} 
                {query.trim() && <> for <em>"{query}"</em></>}
              </div>
            )}
          </div>

          {/* Error / Offline Alert */}
          {error && !loading && displayedMovies.length === 0 && (
            <div className="error-state">
              <span className="error-icon">🔍</span>
              <h3>No Results Found</h3>
              <p>{error}</p>
            </div>
          )}

          {/* Movie Grid */}
          <div className="grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : displayedMovies.map(m => (
                  <MovieCard
                    key={m.imdbID}
                    movie={m}
                    onClick={openMovie}
                    isWatchlisted={watchlist.some(item => item.imdbID === m.imdbID)}
                    onWatchlistToggle={toggleWatchlist}
                  />
                ))
            }
          </div>

          {/* Empty Watchlist State */}
          {!loading && category === 'watchlist' && watchlist.length === 0 && (
            <div className="error-state">
              <span className="error-icon">❤️</span>
              <h3>Your Watchlist is Empty</h3>
              <p>Explore movies and click the bookmark button to build your personal watchlist.</p>
              <button className="btn btn-secondary" onClick={() => setCategory('all')} style={{ marginTop: '0.5rem' }}>
                Browse Movies
              </button>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>© {new Date().getFullYear()} CINEMATE · Powered by OMDb API & Local Demo Engine</p>
        </footer>
      </div>

      {selected && (
        <Modal
          movie={selected}
          onClose={() => setSelected(null)}
          isWatchlisted={watchlist.some(item => item.imdbID === selected.imdbID)}
          onWatchlistToggle={toggleWatchlist}
        />
      )}
    </>
  )
}