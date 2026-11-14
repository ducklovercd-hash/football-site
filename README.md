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

There are two supported data paths.

### A. SofaScore scraper (implemented)

The `sofascore-scraper` project produces a JSON snapshot of matches, which this
site reads at runtime. Nothing is fetched from a third party during a request,
so viewer traffic can never consume a quota.

```
matches-YYYY-MM-DD.json  ->  npm run prepare:matches
                         ->  lib/data/generated/matches.json   (committed)
                         ->  lib/data/snapshot.ts              (runtime loader)
                         ->  getMatches() / /api/live
```

```bash
# 1. scrape (in the scraper repo; needs a sofa_captcha cookie)
python -m sofascore_scraper.cli --date today

# 2. normalise + validate into the committed snapshot
cd ../football-site
npm run prepare:matches

# 3. rebuild
npm run dev
```

`lib/data/snapshot.ts` resolves data in this order and never throws:

1. `FOOTBALL_SNAPSHOT` env var (JSON string) — lets you refresh scores in
   Vercel without a redeploy.
2. `lib/data/generated/matches.json` — the committed snapshot.
3. Demo fixtures — the deterministic generator, if both above are empty.

A malformed value logs a warning and falls through, so bad data can never break
a build. `/api/live` reports which path is live via its `source` field
(`sofascore-snapshot` or `demo`).

### B. Football-data / API-Football providers

`app/api/live/route.ts` is the natural choke point if you later add a
request-time provider.

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
  on demand via ISR or the snapshot variable, not by cron.


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

The repo is ready for Vercel. No environment variables are required.

```bash
# already pushed to https://github.com/ducklovercd-hash/football-site
```

Import it at vercel.com: **Add New → Project → import `football-site`**. The
framework is detected as Next.js; accept the defaults and deploy.

Then, under **Project → Settings → Environment Variables** (all optional):

| Variable | Required | Purpose |
| --- | --- | --- |
| `FOOTBALL_SNAPSHOT` | No | One-line match JSON to refresh scores without a redeploy (64 KB cap) |
| `FOOTBALL_DATA_KEY` | No | Only if you switch to a request-time provider |
| `API_FOOTBALL_KEY` | No | Only if you switch to a request-time provider |
| `DATA_MODE` | No | `demo` (default) or `live` |

Never prefix these with `NEXT_PUBLIC_` — that would expose them to the browser.

To refresh data without a redeploy:

```bash
cd ../football-site
npm run prepare:matches
cat lib/data/generated/matches.json | python3 -c 'import json,sys; print(json.dumps(json.load(sys.stdin), separators=(",",":")))'
```

Paste the output into `FOOTBALL_SNAPSHOT` and redeploy the environment
(Vercel → Deployments → ⋯ → Redeploy, or just save the variable and
re-trigger). Invalid JSON is ignored with a warning, so a bad paste degrades to
the committed snapshot rather than a broken site.
