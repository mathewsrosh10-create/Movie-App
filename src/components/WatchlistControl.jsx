import { useState } from 'react';
import { addToWatchlist, removeFromWatchlist, updateStatus } from '../lib/watchlistService';

export default function WatchlistControl({ movie, user, watchlist, onWatchlistChange, fullWidth }) {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const currentItem = watchlist.find(m => m.imdbID === (movie.imdbID || movie.movie_id));
  const status = currentItem ? currentItem.status : null;

  const handleDropdownClick = (e) => {
    e.stopPropagation();
  };

  const handleStatusSelect = async (newStatus) => {
    setIsOpen(false);
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

  if (!user) {
    return (
      <div className={`group relative inline-block ${fullWidth ? 'w-full' : ''}`} onClick={handleDropdownClick}>
        <button
          disabled
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-white/5 border border-white/5 text-zinc-500 rounded-full cursor-not-allowed ${fullWidth ? 'w-full justify-center' : ''}`}
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

  const statusLabels = {
    want_to_watch: 'Want to Watch',
    watching: 'Watching',
    watched: 'Watched',
    dropped: 'Dropped',
  };

  const statusOptions = [
    { id: 'want_to_watch', label: 'Want to Watch' },
    { id: 'watching', label: 'Watching' },
    { id: 'watched', label: 'Watched' },
    { id: 'dropped', label: 'Dropped' },
  ];

  if (!status) {
    return (
      <button
        onClick={() => handleStatusSelect('want_to_watch')}
        className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full bg-gradient-to-r from-[#6366f1] to-[#f43f5e] hover:from-[#4f46e5] hover:to-[#e11d48] text-white active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#6366f1]/15 cursor-pointer ${fullWidth ? 'w-full justify-center' : ''}`}
      >
        ＋ Add to Watchlist
      </button>
    );
  }

  return (
    <div className={`relative inline-block ${fullWidth ? 'w-full' : ''}`} onClick={handleDropdownClick}>
      {/* Dropdown Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-[#141419] hover:bg-zinc-800 text-white border border-white/10 hover:border-white/15 rounded-full shadow-md cursor-pointer transition-all duration-200 ${fullWidth ? 'w-full' : ''}`}
      >
        <span>{statusLabels[status]}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Click Catcher to close menu on click outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[140] cursor-default"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Floating Menu List */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 bg-[#141419] border border-white/10 rounded-xl py-1.5 shadow-2xl z-[150] flex flex-col overflow-hidden animate-popover-fade-in ${
            fullWidth ? 'w-full right-0' : 'min-w-[160px]'
          }`}
        >
          {statusOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => handleStatusSelect(opt.id)}
              className={`w-full text-left px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${
                status === opt.id
                  ? 'text-[#6366f1] bg-[#6366f1]/10 hover:bg-[#6366f1]/15'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="border-t border-white/5 my-1" />
          <button
            onClick={() => handleStatusSelect('remove')}
            className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-400 hover:text-white hover:bg-[#f43f5e]/15 transition-all duration-150 cursor-pointer flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}
