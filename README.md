# Roast My List

A tiny static site that roasts a **MyAnimeList** profile.

- **No backend**
- **No keys**
- **No AI calls** (the roast is deterministic)
- Uses **Jikan v4** public endpoints: user profile, statistics, and favorites

## Run

Just open `index.html` in a browser.

## What it shows

- A roast (based on your public stats + favorites)
- A small stats panel
- A **Download JSON** button (downloads the fetched profile/stats/favorites)

## Notes

Jikan is rate-limited (and MyAnimeList can rate-limit upstream). If you get a 429, wait a bit and try again.
