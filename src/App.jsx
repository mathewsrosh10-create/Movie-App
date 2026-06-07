import { useState, useEffect, useCallback } from 'react'

const API_KEY = import.meta.env.VITE_OMDB_API_KEY
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-poster" />
      <div className="skeleton-info">
        <div className="skeleton-line long" />
        <div className="skeleton-line short" />
      </div>
    </div>
  )
}

function MovieCard({ movie, onClick }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'

  return (
    <div className="movie-card" onClick={() => onClick(movie.imdbID)}>
      <div className="card-poster-wrap">
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
          <div className="no-poster"><span>No Poster</span></div>
        )}
        <div className="card-overlay">
          <span className="card-type">{movie.Type}</span>
        </div>
      </div>
      <div className="card-info">
        <h3 className="card-title">{movie.Title}</h3>
        <p className="card-year">{movie.Year}</p>
      </div>
    </div>
  )
}

function Modal({ movie, onClose, aiInsight, aiLoading }) {
  const hasPoster = movie.Poster && movie.Poster !== 'N/A'

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-inner">
          <div className="modal-left">
            {hasPoster
              ? <img src={movie.Poster} alt={movie.Title} className="modal-poster" />
              : <div className="no-poster tall"><span>No Poster</span></div>
            }
            <div className="modal-ratings">
              {movie.imdbRating && movie.imdbRating !== 'N/A' && (
                <div className="rating-badge">
                  <span className="rating-label">IMDb</span>
                  <span className="rating-value">{movie.imdbRating}</span>
                </div>
              )}
              {movie.Metascore && movie.Metascore !== 'N/A' && (
                <div className="rating-badge meta">
                  <span className="rating-label">Meta</span>
                  <span className="rating-value">{movie.Metascore}</span>
                </div>
              )}
            </div>
          </div>
          <div className="modal-right">
            <div className="modal-type">{movie.Type} · {movie.Year}</div>
            <h2 className="modal-title">{movie.Title}</h2>
            <div className="modal-tags">
              {movie.Genre && movie.Genre !== 'N/A' && movie.Genre.split(',').map(g => (
                <span key={g} className="tag">{g.trim()}</span>
              ))}
            </div>
            <div className="modal-meta-grid">
              {movie.Director && movie.Director !== 'N/A' && (
                <div className="meta-item"><span className="meta-label">Director</span><span className="meta-val">{movie.Director}</span></div>
              )}
              {movie.Actors && movie.Actors !== 'N/A' && (
                <div className="meta-item"><span className="meta-label">Cast</span><span className="meta-val">{movie.Actors}</span></div>
              )}
              {movie.Runtime && movie.Runtime !== 'N/A' && (
                <div className="meta-item"><span className="meta-label">Runtime</span><span className="meta-val">{movie.Runtime}</span></div>
              )}
              {movie.Language && movie.Language !== 'N/A' && (
                <div className="meta-item"><span className="meta-label">Language</span><span className="meta-val">{movie.Language}</span></div>
              )}
            </div>
            {movie.Plot && movie.Plot !== 'N/A' && (
              <p className="modal-plot">{movie.Plot}</p>
            )}
            <div className="ai-section">
              <div className="ai-header">
                <span className="ai-icon">✦</span>
                <span className="ai-label">Why Watch This?</span>
              </div>
              {aiLoading
                ? <div className="ai-loading"><span /><span /><span /></div>
                : <p className="ai-text">{aiInsight || 'Could not generate insight.'}</p>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [query, setQuery] = useState('inception')
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState(null)
  const [aiInsight, setAiInsight] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 500)

  const fetchMovies = useCallback(async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&apikey=${API_KEY}`)
      const data = await res.json()
      if (data.Response === 'True') {
        setMovies(data.Search)
      } else {
        setMovies([])
        setError(data.Error || 'No results found.')
      }
    } catch {
      setError('Failed to fetch. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMovies(debouncedQuery) }, [debouncedQuery, fetchMovies])

  const openMovie = async (id) => {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${API_KEY}`)
    const data = await res.json()
    setSelected(data)
    setAiInsight('')
    setAiLoading(true)

    try {
      const prompt = `You are a passionate film critic. In 2-3 sentences, tell me why "${data.Title}" (${data.Year}) is worth watching. Be specific and enthusiastic. Genre: ${data.Genre}. Director: ${data.Director}. Plot: ${data.Plot}`

      const aiRes = await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${HF_TOKEN}`
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 150, temperature: 0.7 }
          })
        }
      )
      const aiData = await aiRes.json()
      console.log('AI response:', JSON.stringify(aiData))
      const raw = Array.isArray(aiData) ? aiData[0]?.generated_text : aiData?.generated_text
      const insight = raw?.replace(prompt, '').trim()
      setAiInsight(insight || 'A must-watch cinematic experience.')
    } catch {
      setAiInsight('A must-watch cinematic experience.')
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <>
      <div className="grain" />
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <div className="logo">
              <span className="logo-icon">◈</span>
              <span className="logo-text">CINEMATE</span>
            </div>
            <div className="search-wrap">
              <span className="search-icon">⌕</span>
              <input
                className="search-input"
                type="text"
                placeholder="Search movies, series, episodes..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                autoFocus
              />
              {query && (
                <button className="clear-btn" onClick={() => setQuery('')}>✕</button>
              )}
            </div>
          </div>
        </header>

        <main className="main">
          <div className="results-header">
            {!loading && movies.length > 0 && (
              <p className="results-count">
                <span>{movies.length}</span> results for <em>"{debouncedQuery}"</em>
              </p>
            )}
          </div>

          {error && <div className="error-state"><p>{error}</p></div>}

          <div className="grid">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : movies.map(m => (
                  <MovieCard key={m.imdbID} movie={m} onClick={openMovie} />
                ))
            }
          </div>
        </main>

        <footer className="footer">
          <p>Powered by OMDb API · AI insights by Mistral · Built with React</p>
        </footer>
      </div>

      {selected && (
        <Modal
          movie={selected}
          onClose={() => setSelected(null)}
          aiInsight={aiInsight}
          aiLoading={aiLoading}
        />
      )}
    </>
  )
}