import { useState } from 'react';
import { addToWatchlist, removeFromWatchlist, updateStatus } from '../lib/watchlistService';

export default function WatchlistControl({ movie, user, watchlist, onWatchlistChange, fullWidth }) {
  const [loading, setLoading] = useState(false);
  const currentItem = watchlist.find(m => m.imdbID === (movie.imdbID || movie.movie_id));
  const status = currentItem ? currentItem.status : null;

  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  const handleStatusChange = async (e) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    if (loading) return;
    setLoading(true);

    try {
      const movieId = movie.imdbID || movie.movie_id;
      if (newStatus === 'remove') {
        await removeFromWatchlist(user.id, movieId);
        onWatchlistChange({ action: 'remove', movieId });
      } else if (!status) {
        await addToWatchlist(user.id, movie, newStatus);
        onWatchlistChange({ action: 'add', movie, status: newStatus });
      } else {
        await updateStatus(user.id, movieId, newStatus);
        onWatchlistChange({ action: 'update', movieId, status: newStatus });
      }
    } catch (err) {
      console.error('Watchlist action failed:', err);
      alert(`Failed to update watchlist: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = async (e) => {
    e.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const defaultStatus = 'want_to_watch';
      await addToWatchlist(user.id, movie, defaultStatus);
      onWatchlistChange({ action: 'add', movie, status: defaultStatus });
    } catch (err) {
      console.error('Watchlist add failed:', err);
      alert(`Failed to add movie to watchlist: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className={`group relative inline-block ${fullWidth ? 'w-full' : ''}`} onClick={handleDropdownClick}>
        <button
          disabled
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/5 border border-white/5 text-zinc-500 rounded-full cursor-not-allowed ${fullWidth ? 'w-full justify-center' : ''}`}
        >
          ＋ Add to Watchlist
        </button>
        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-zinc-900 text-zinc-200 text-xs py-1.5 px-2.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-xl z-[999]">
          Sign in to save movies
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-zinc-400 bg-white/5 border border-white/5 rounded-full ${fullWidth ? 'w-full justify-center' : ''}`} onClick={handleDropdownClick}>
        <svg className="animate-spin h-3.5 w-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span>Updating...</span>
      </div>
    );
  }

  if (!status) {
    return (
      <button
        onClick={handleAddClick}
        className={`inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-white text-black hover:bg-zinc-200 rounded-full transition-all duration-200 shadow-md cursor-pointer ${fullWidth ? 'w-full justify-center' : ''}`}
      >
        ＋ Add to Watchlist
      </button>
    );
  }

  return (
    <div className={`relative inline-block ${fullWidth ? 'w-full' : ''}`} onClick={handleDropdownClick}>
      <select
        value={status}
        onChange={handleStatusChange}
        className={`appearance-none bg-[#1c1c24] text-white border border-[#3b3b4f] hover:border-white/20 rounded-full pl-3.5 pr-8 py-1.5 text-xs font-semibold outline-none focus:border-[#6366f1] transition-all cursor-pointer shadow-md ${fullWidth ? 'w-full' : ''}`}
        style={{
          backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='white' stroke-width='2.5'><path d='M6 9l6 6 6-6'/></svg>")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          backgroundSize: '12px'
        }}
      >
        <option value="want_to_watch">Want to Watch</option>
        <option value="watching">Watching</option>
        <option value="watched">Watched</option>
        <option value="dropped">Dropped</option>
        <option value="remove">✖ Remove</option>
      </select>
    </div>
  );
}
