import { supabase } from './supabaseClient';

export const addToWatchlist = async (user_id, movieData, status) => {
  const { data, error } = await supabase
    .from('watchlist')
    .insert([
      {
        user_id,
        movie_id: movieData.imdbID || movieData.movie_id,
        movie_title: movieData.Title || movieData.movie_title,
        movie_poster: movieData.Poster || movieData.movie_poster || '',
        status: status || 'want_to_watch',
      },
    ])
    .select();
  if (error) throw error;
  return data[0];
};

export const removeFromWatchlist = async (user_id, movie_id) => {
  const { error } = await supabase
    .from('watchlist')
    .delete()
    .eq('user_id', user_id)
    .eq('movie_id', movie_id);
  if (error) throw error;
};

export const updateStatus = async (user_id, movie_id, newStatus) => {
  const { data, error } = await supabase
    .from('watchlist')
    .update({ status: newStatus })
    .eq('user_id', user_id)
    .eq('movie_id', movie_id)
    .select();
  if (error) throw error;
  return data[0];
};

export const getUserWatchlist = async (user_id) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('*')
    .eq('user_id', user_id)
    .order('added_at', { ascending: false });
  if (error) throw error;
  return data;
};

export const checkIfInWatchlist = async (user_id, movie_id) => {
  const { data, error } = await supabase
    .from('watchlist')
    .select('status')
    .eq('user_id', user_id)
    .eq('movie_id', movie_id)
    .maybeSingle();
  if (error) throw error;
  return data ? data.status : null;
};
