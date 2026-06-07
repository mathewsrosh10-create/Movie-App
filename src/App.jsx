import { useState, useEffect } from 'react'

function App() {
  const [movies, setMovies] = useState([])
  const [search, setSearch] = useState('batman')
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchMovies = async (query) => {
    setLoading(true)
    const res = await fetch(`https://www.omdbapi.com/?s=${query}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`)
    const data = await res.json()
    if (data.Search) setMovies(data.Search)
    setLoading(false)
  }

  const fetchMovieDetails = async (id) => {
    const res = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${import.meta.env.VITE_OMDB_API_KEY}`)
    const data = await res.json()
    setSelectedMovie(data)
  }

  useEffect(() => {
    fetchMovies(search)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchMovies(search)
  }

  return (
    <div className="bg-gray-900 min-h-screen p-8">
      <h1 className="text-white text-4xl font-bold text-center mb-8">🎬 Movie Search</h1>

      <form onSubmit={handleSearch} className="flex justify-center gap-2 mb-8">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for a movie..."
          className="px-4 py-2 rounded-lg w-80 bg-gray-800 text-white outline-none"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
        >
          Search
        </button>
      </form>

      {/* Movie Detail Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full p-6 relative">
            <button
              onClick={() => setSelectedMovie(null)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-red-400"
            >
              ✕
            </button>
            <div className="flex gap-6">
              <img
                src={selectedMovie.Poster !== 'N/A' ? selectedMovie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={selectedMovie.Title}
                className="w-40 h-60 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-white text-2xl font-bold mb-2">{selectedMovie.Title}</h2>
                <p className="text-yellow-400 mb-1">⭐ {selectedMovie.imdbRating} / 10</p>
                <p className="text-gray-400 mb-1">📅 {selectedMovie.Year}</p>
                <p className="text-gray-400 mb-1">🎭 {selectedMovie.Genre}</p>
                <p className="text-gray-400 mb-1">🎬 {selectedMovie.Director}</p>
                <p className="text-gray-400 mb-1">⏱ {selectedMovie.Runtime}</p>
                <p className="text-gray-300 mt-3 text-sm leading-relaxed">{selectedMovie.Plot}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map(movie => (
            <div
              key={movie.imdbID}
              onClick={() => fetchMovieDetails(movie.imdbID)}
              className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer"
            >
              <img
                src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={movie.Title}
                className="w-full h-64 object-cover"
              />
              <div className="p-3">
                <h2 className="text-white font-semibold text-sm">{movie.Title}</h2>
                <p className="text-gray-400 text-sm">{movie.Year}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App