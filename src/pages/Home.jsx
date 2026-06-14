import { useState, useEffect, useCallback } from 'react'
import { mockMovies } from '../mockData'
import WatchlistControl from '../components/WatchlistControl'

// Custom SVG Icons
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--gold)' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
)

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18M6 6l12 12" />
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

function MovieCard({ movie, onClick, user, watchlist, onWatchlistChange }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'
  const rating = movie.imdbRating && movie.imdbRating !== 'N/A' ? movie.imdbRating : null

  return (
    <div className="movie-card" onClick={() => onClick(movie.imdbID)}>
      <div className="card-poster-wrap">
        <div className="absolute top-3 left-3 z-10">
          <WatchlistControl
            movie={movie}
            user={user}
            watchlist={watchlist}
            onWatchlistChange={onWatchlistChange}
          />
        </div>

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

function Modal({ movie, onClose, user, watchlist, onWatchlistChange }) {
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
            
            <WatchlistControl
              movie={movie}
              user={user}
              watchlist={watchlist}
              onWatchlistChange={onWatchlistChange}
              fullWidth={true}
            />

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

function HeroSection({ movie, onClick, user, watchlist, onWatchlistChange }) {
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
          <WatchlistControl
            movie={movie}
            user={user}
            watchlist={watchlist}
            onWatchlistChange={onWatchlistChange}
          />
        </div>
      </div>
    </div>
  )
}

export default function Home({ query, user, watchlist, onWatchlistChange, apiKey, isLiveMode }) {
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [category, setCategory] = useState('all') // 'all', 'movie', 'series'
  
  // Landing page movies - updates details live from OMDb when key is active
  const [landingMovies, setLandingMovies] = useState(mockMovies)

  // Fetch real details of dashboard movies when live key is set
  useEffect(() => {
    if (!isLiveMode) {
      if (landingMovies !== mockMovies) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLandingMovies(mockMovies)
      }
      return
    }

    const loadRealDashboardDetails = async () => {
      try {
        const promises = mockMovies.map(async (m) => {
          const res = await fetch(`https://www.omdbapi.com/?i=${m.imdbID}&apikey=${apiKey}`)
          const data = await res.json()
          if (data.Response === 'True') {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (isLiveMode) {
      try {
        const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(trimmed)}&apikey=${apiKey}`)
        const data = await res.json()
        if (data.Response === 'True') {
          setMovies(data.Search)
        } else {
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMovies(query)
  }, [query, fetchMovies])

  const openMovie = async (id) => {
    const localMatch = landingMovies.find(m => m.imdbID === id) || watchlist.find(m => m.imdbID === id)
    
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

  const getFilteredMovies = () => {
    let sourceList = query.trim() ? movies : landingMovies

    return sourceList.filter(m => {
      if (category === 'movie' && m.Type !== 'movie') return false
      if (category === 'series' && m.Type !== 'series') return false
      return true
    })
  }

  const displayedMovies = getFilteredMovies()
  const featuredMovie = landingMovies[0]
  const showHero = !query.trim() && featuredMovie

  return (
    <>
      {showHero && (
        <HeroSection
          movie={featuredMovie}
          onClick={openMovie}
          user={user}
          watchlist={watchlist}
          onWatchlistChange={onWatchlistChange}
        />
      )}

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
        </div>

        {!loading && query.trim() && (
          <div className="results-count">
            Found <span>{displayedMovies.length}</span> {displayedMovies.length === 1 ? 'result' : 'results'} for <em>"{query}"</em>
          </div>
        )}
      </div>

      {error && !loading && displayedMovies.length === 0 && (
        <div className="error-state">
          <span className="error-icon">🔍</span>
          <h3>No Results Found</h3>
          <p>{error}</p>
        </div>
      )}

      <div className="grid">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          : displayedMovies.map(m => (
              <MovieCard
                key={m.imdbID}
                movie={m}
                onClick={openMovie}
                user={user}
                watchlist={watchlist}
                onWatchlistChange={onWatchlistChange}
              />
            ))
        }
      </div>

      {selected && (
        <Modal
          movie={selected}
          onClose={() => setSelected(null)}
          user={user}
          watchlist={watchlist}
          onWatchlistChange={onWatchlistChange}
        />
      )}
    </>
  )
}
