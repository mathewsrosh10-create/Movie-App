import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserWatchlist, removeFromWatchlist } from '../lib/watchlistService';
import WatchlistControl from '../components/WatchlistControl';

export default function WatchlistPage({ query, openAuthModal, watchlist, onWatchlistChange }) {
  const { user, loading: loadingAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'want_to_watch', 'watching', 'watched', 'dropped'

  // 1. Auth check and redirect
  useEffect(() => {
    if (!loadingAuth && !user) {
      navigate('/');
      openAuthModal();
    }
  }, [user, loadingAuth, navigate, openAuthModal]);

  // 2. Fetch watchlist on mount / user change
  useEffect(() => {
    if (user) {
      const fetchList = async () => {
        setLoading(true);
        try {
          const dbWatchlist = await getUserWatchlist(user.id);
          const mapped = dbWatchlist.map(item => ({
            imdbID: item.movie_id,
            Title: item.movie_title,
            Poster: item.movie_poster,
            status: item.status,
            Type: 'movie'
          }));
          // Sync with global state
          // To sync, we can call onWatchlistChange with an action 'sync' or similar, or just manage a local state in WatchlistPage.
          // Wait! If App.jsx passes watchlist state, we should update App.jsx's state so that it is shared globally!
          // Let's add a sync action to handleWatchlistChange in App.jsx:
          onWatchlistChange({ action: 'sync', list: mapped });
        } catch (err) {
          console.error('Failed to load watchlist:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (loadingAuth || (loading && watchlist.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <svg className="animate-spin h-8 w-8 text-[#6366f1]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-zinc-400 text-sm">Loading your watchlist...</p>
      </div>
    );
  }

  // 3. Status Tabs mapping
  const tabs = [
    { id: 'all', name: 'All' },
    { id: 'want_to_watch', name: 'Want to Watch' },
    { id: 'watching', name: 'Watching' },
    { id: 'watched', name: 'Watched' },
    { id: 'dropped', name: 'Dropped' }
  ];

  // 4. Handle quick remove click
  const handleRemoveClick = async (movieId) => {
    if (!user) return;
    try {
      await removeFromWatchlist(user.id, movieId);
      onWatchlistChange({ action: 'remove', movieId });
    } catch (err) {
      console.error('Failed to remove movie:', err);
      alert('Failed to remove movie from watchlist. Please try again.');
    }
  };

  // 5. Filter list by tab and global query
  const filteredMovies = watchlist.filter(m => {
    if (activeTab !== 'all' && m.status !== activeTab) return false;
    if (query.trim()) {
      return m.Title.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-3">
            <span className="text-gradient bg-gradient-to-r from-[#6366f1] to-[#f43f5e] bg-clip-text text-transparent">My Watchlist</span>
            <span className="text-xs bg-[#6366f1]/10 text-[#6366f1] px-3 py-1 rounded-full border border-[#6366f1]/20 font-bold uppercase tracking-wider font-body">
              {watchlist.length} {watchlist.length === 1 ? 'Title' : 'Titles'}
            </span>
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Organize and keep track of movies and series you want to watch or have completed.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 pb-6 border-b border-white/5">
        {tabs.map(tab => {
          const count = tab.id === 'all'
            ? watchlist.length
            : watchlist.filter(m => m.status === tab.id).length;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pill flex items-center gap-2 px-4.5 py-2.5 text-xs font-semibold rounded-full border transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#6366f1] border-[#6366f1] text-white shadow-lg shadow-[#6366f1]/20'
                  : 'bg-transparent border-white/5 hover:border-white/15 text-zinc-400 hover:text-white hover:bg-white/3'
              }`}
            >
              {tab.name}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-white/5 text-zinc-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Movies Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {filteredMovies.map(movie => {
            const hasPoster = movie.Poster && movie.Poster !== 'N/A';
            return (
              <div
                key={movie.imdbID}
                className="group relative flex flex-col bg-[#141419] border border-white/5 rounded-2xl overflow-hidden hover:border-[#6366f1]/30 transition-all duration-300 hover:-translate-y-2 shadow-xl shadow-black/40"
              >
                {/* Poster Wrap */}
                <div className="relative aspect-[2/3] bg-[#111115] overflow-hidden">
                  {hasPoster ? (
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 gap-2">
                      <span className="text-3xl">🎬</span>
                      <span className="text-xs">No Poster</span>
                    </div>
                  )}
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                    <button
                      onClick={() => handleRemoveClick(movie.imdbID)}
                      className="bg-[#f43f5e] hover:bg-rose-600 text-white p-3 rounded-full shadow-lg transition-transform transform scale-90 group-hover:scale-100 duration-200 cursor-pointer"
                      title="Remove from Watchlist"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Info & Controls */}
                <div className="p-5 flex-grow flex flex-col gap-4">
                  <h3
                    className="font-display font-semibold text-sm text-white line-clamp-2 leading-snug tracking-tight"
                    title={movie.Title}
                  >
                    {movie.Title}
                  </h3>

                  <div className="mt-auto space-y-2">
                    {/* Status Dropdown */}
                    <div className="w-full">
                      <WatchlistControl
                        movie={movie}
                        user={user}
                        watchlist={watchlist}
                        onWatchlistChange={onWatchlistChange}
                        fullWidth={true}
                      />
                    </div>
                    {/* Secondary explicit delete text link */}
                    <button
                      onClick={() => handleRemoveClick(movie.imdbID)}
                      className="w-full py-1.5 bg-transparent hover:bg-rose-500/5 text-[10px] text-zinc-500 hover:text-[#f43f5e] font-semibold border border-transparent hover:border-rose-500/10 rounded-lg transition-all duration-200 cursor-pointer"
                    >
                      Remove Title
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Tab State */
        <div className="flex flex-col items-center justify-center text-center p-16 py-24 bg-[#111115]/50 border border-white/5 backdrop-blur-md rounded-3xl max-w-xl mx-auto shadow-2xl space-y-6">
          <span className="text-5xl filter grayscale opacity-35">🍿</span>
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-display text-white">
              {query.trim() ? 'No Matching Titles' : 'Empty Status List'}
            </h3>
            <p className="text-zinc-500 text-xs max-w-sm leading-relaxed mx-auto">
              {query.trim()
                ? `We couldn't find any titles in this list matching "${query}".`
                : `You haven't marked any movies as "${tabs.find(t => t.id === activeTab).name}" yet.`}
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="btn btn-secondary px-6 py-2.5 text-xs font-semibold rounded-full hover:bg-white/10 hover:border-white/15 cursor-pointer shadow-md"
          >
            Browse Movies
          </button>
        </div>
      )}
    </div>
  );
}
