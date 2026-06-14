# CINEMATE 🎬

🔗 **Live Demo**: [cinemate.vercel.app](https://movie-app-virid-mu.vercel.app)

CINEMATE is a premium, dark-themed React web application built with Vite and Tailwind CSS. It allows users to search for movies/series, review metadata (ratings, plot, cast, awards), and curate a personalized watchlist synchronized in real-time with a Supabase PostgreSQL backend.

---
## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **API**: OMDb API
- **Deployment**: Vercel
---
## Key Features

- **Authentication System**:
  - Secure credential-based registration and login (Email & Password).
  - Social authentication via Google OAuth integration.
  - Session-aware navigation layout (updates dynamically based on auth status).
- **Personalized Watchlist**:
  - Live synchronization with a PostgreSQL database.
  - Categorize saved titles into status lists: **Want to Watch**, **Watching**, **Watched**, and **Dropped**.
  - Interactive status dropdown select controls and quick-delete actions on cards.
  - Route guards: Automatic login redirects for guests trying to access `/watchlist`.
- **Hybrid Search Engine**:
  - Pulls live movie details dynamically from the OMDb API.
  - Local database fallback when offline or when no Omit key is provided.

---

## Configuration & Environment Setup

Create a `.env` file in the root directory and add the following keys:

```env
# OMDb API Key Configuration (http://www.omdbapi.com/)
VITE_OMDB_API_KEY=your_omdb_key_here

# Supabase Configurations (https://supabase.com/)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

*Note: The `.env` file is automatically ignored by Git (configured in `.gitignore`).*

---

## Database Schema (Supabase)

Run the following script in the **Supabase SQL Editor** to create the custom status enum, watchlist table, and enable Row Level Security (RLS) rules:

```sql
-- 1. Create the custom status enum type
create type watchlist_status as enum ('want_to_watch', 'watching', 'watched', 'dropped');

-- 2. Create the watchlist table
create table watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  movie_id text not null,
  movie_title text not null,
  movie_poster text,
  status watchlist_status not null default 'want_to_watch',
  added_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS) on the watchlist table
alter table watchlist enable row level security;

-- 4. Create the access policy
create policy "Users can manage their own watchlist"
on watchlist
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

---

## Third-Party Auth Configurations

### 1. Google OAuth (Google Cloud Console)
- Navigate to **APIs & Services** > **Credentials** > Click **Create Credentials** > **OAuth client ID**.
- Set Application Type to **Web application**.
- Under **Authorized redirect URIs**, paste the redirect URI provided in your Supabase Auth Dashboard (e.g. `https://<your-project-ref>.supabase.co/auth/v1/callback`).
- Save to get your **Client ID** and **Client Secret**.

### 2. Supabase Provider Settings
- Go to your **Supabase Dashboard** > **Authentication** > **Providers** > **Google**.
- Toggle **Enable Google Provider**.
- Paste your Google **Client ID** and **Client Secret**.
- Under **Redirect URLs** in Authentication Settings, add:
  - `http://localhost:5173/**` (for local development)
  - `https://movie-app-virid-mu.vercel.app/**` (for production Vercel deployment)

---

## Vercel Deployment

1. Initialize a Git repository, commit the changes, and push to GitHub.
2. Log in to Vercel and import the repository.
3. In the project setup, add the **Environment Variables** matching your `.env` keys.
4. Click **Deploy**.
