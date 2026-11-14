# PitchSide

Near-live football scores, Poisson-model predictions, player statistics and
model-implied odds — Next.js 16 (App Router) + Tailwind CSS 4, deployed on
Vercel.

Rebuilt from the original Streamlit prototype (`footballapp`). The theme is
black & yellow; yellow is deliberately an accent (~5% of surface) so the
dark surfaces stay readable during a match.

## Status

**Running on deterministic demo data.** No API keys required to run or deploy.
Every number is generated locally from a seeded PRNG, so the server render and
the browser hydration always agree.

Live scores are reconstructed from the real clock, so matches genuinely
progress while you watch: minutes tick, scores climb, stats accumulate.

## Routes

| Route | What it does |
|---|---|
| `/` | Today's matches, grouped by league, filterable via `?comps=PL,SA` |
| `/live` | Live matches, auto-refreshing every 15s, with a freshness stamp |
| `/matches/[id]` | Score, stats bars, timeline, prediction, both lineups |
| `/predictions` | 1X2 probabilities, xG, likely scorelines for every fixture |
| `/players` | Searchable / filterable / sortable player table |
| `/players/[slug]` | Player profile with per-90 metrics |
| `/odds` | Model-implied 1X2, over/under 2.5 and BTTS odds |
| `/api/live` | JSON feed polled by the live board |

## Run locally

Requires Node 20.9+ (Next 16). This machine has Node 22 installed at
`~/.local/opt/node-v22.23.4-darwin-arm64/bin`, so:

```bash
export PATH=$HOME/.local/opt/node-v22.23.4-darwin-arm64/bin:$PATH
npm install
npm run dev          # http://localhost:3000
npm run build        # production build check
```

## The prediction model

`lib/model/poisson.ts` is a Poisson / Dixon-Coles style model. Each side gets an
attack and defence multiplier; those combine with league averages:

```
λ_home = avgHome × attack(home) × defence(away) × form(home)
λ_away = avgAway × attack(away) × defence(home) × form(away)
```

A 9×9 matrix of scorelines `P(i,j) = Pois(λ_home, i) × Pois(λ_away, j)` is then
summed for 1X2, over/under, BTTS and the most likely correct score.

The Odds page derives its prices from the *same* matrix (plus a 6% overround),
so predictions and odds can never contradict each other. That was the main
weakness of the Streamlit version, where each tab invented its own numbers.

## Connecting a real provider

`app/api/live/route.ts` is the single choke point. The browser only ever talks
to that route, never to an upstream API — so traffic does not scale API usage.

When wiring a provider:

1. Put the key in `.env.local` (never `NEXT_PUBLIC_`). See `.env.example`.
2. Fetch inside the route handler / server component, not in a client component.
3. Set `export const revalidate = 30` and send
   `Cache-Control: public, s-maxage=30, stale-while-revalidate=120` so every
   viewer shares one upstream call per window.
4. Map the provider payload to the `Match` type in `lib/types.ts` — the UI needs
   no changes.

Quota reality check (verified against provider docs):

- **football-data.org free** — 10 calls/min, 12 competitions, **live scores are
  delayed**, no lineups/stats/odds. Non-commercial use only.
- **API-Football free** — ~100 calls/day. Real-time, but unusable for public
  traffic without aggressive caching.
- Vercel **Hobby crons run once per day only**, so live data must be refreshed
  on demand via ISR, not by cron.

## Swapping in the full player dataset

The repo ships a curated sample in `lib/data/players.ts`. To use the real
92,671-row file:

```bash
node scripts/prepare-data.mjs /path/to/player_profiles.csv
```

That writes `data/players.json` in the shape the app already consumes. Then
import it in `lib/data/players.ts` instead of the `ROWS` array.

Important: `player_profiles.csv` contains **biographical** data only (age,
height, foot, club, contract). It has **no goals, assists or ratings** — those
columns come out as `0` and must be joined from a stats provider.

## Deploy

```bash
git remote add origin https://github.com/ducklovercd-hash/football-site.git
git push -u origin main
```

Then import the repo at vercel.com — the framework is detected automatically.
Add `FOOTBALL_DATA_KEY` / `API_FOOTBALL_KEY` under Project → Settings →
Environment Variables when you move off demo data.
