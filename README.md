# Equimetrics 2026

GPS-powered horse racing intelligence, built for the 2026 Equibase Econ Games.

Equimetrics turns raw sectional GPS data into something a human can read: per-furlong
speed, closing velocity, stride length and fade, ground loss from running wide, and
position at every gate. On top of that sits **HorseLLM**, a chat assistant that answers
questions about horses and upcoming races using the same dataset.

Built with React 19, Vite, Tailwind CSS, Recharts, Mapbox GL and the Anthropic API,
deployed on Vercel.

## Features

- **Profiles** — searchable horse profiles with GPS and traditional form
- **Race X-Ray** — gate-by-gate breakdown of a single race
- **Race Replay** — animated replay driven by GPS positions
- **Race Night / Preview / Insights** — upcoming cards with GPS-derived analysis
- **Journey Map** — Mapbox map of where a horse has raced
- **HorseLLM** — Claude-powered chat over the racing dataset

## Getting started

Requires Node.js 20 or newer.

```bash
git clone https://github.com/Mahak1729/equimetrics2026.git
cd equimetrics2026
npm install
cp .env.example .env   # then fill in your keys
npm run dev
```

The dev server runs at http://localhost:5173. The API routes under `/api` are served in
development by a Vite middleware plugin in `vite.config.js`, so the same URLs work
locally and in production without running `vercel dev`.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with the `/api` middleware |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the built output (no `/api` routes) |
| `npm run lint` | ESLint over the project |

## Environment variables

Copy `.env.example` to `.env` and fill it in. `.env` is gitignored.

| Variable | Required | Used by | Notes |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | Yes, for chat | `/api/chat` (server only) | From the [Anthropic Console](https://console.anthropic.com/settings/keys). Never exposed to the browser. |
| `VITE_MAPBOX_TOKEN` | Yes, for the map | `JourneyMap` (client) | A public Mapbox token. The `VITE_` prefix means it *is* bundled into the client, so use a token restricted by URL. |
| `ALLOWED_ORIGINS` | No | `/api/chat` (server only) | Comma-separated extra origins allowed to call the chat endpoint, on top of the built-in list. |

Everything else the app needs is committed under `api/_data/`, so there is no database
to provision.

## API routes

Two routes ship as Vercel functions in `api/`:

| Route | Method | Returns |
| --- | --- | --- |
| `/api/chat` | POST | HorseLLM reply |
| `/api/horses/:name` | GET | One horse profile |

The dev middleware in `vite.config.js` also serves `/api/races`, `/api/replays`,
`/api/forecast`, `/api/horses` and `/api/gps-races`. Those have no deployed counterpart
and nothing in the app calls them today: the pages fetch static JSON from
`public/data/` instead. If you start calling one of them from the client, add a matching
function under `api/` first, or it will 404 in production.

## How the chat endpoint works

`POST /api/chat` takes a conversation and returns a single reply:

```jsonc
// request
{ "messages": [{ "role": "user", "content": "How did Sea Boss close last out?" }] }

// response
{ "content": "...", "model": "claude-sonnet-5" }
```

What happens in between, in `api/chat.js`:

1. **Origin check.** In production the request must come from an allowed origin:
   `localhost`, any `*.vercel.app` deployment, `https://equimetrics2026.mahakmkumawat.com`,
   or anything listed in `ALLOWED_ORIGINS`. Everything else gets a 403.
2. **Rate limit.** 15 requests per IP per minute, in memory. This is per serverless
   instance, so treat it as a speed bump rather than a hard guarantee.
3. **Validation.** At most 20 messages, roles limited to `user` and `assistant`, and
   5,000 characters per message.
4. **Retrieval.** `buildContext.js` pulls the horses and races mentioned in the latest
   user message out of the local dataset.
5. **The model call.** The official `@anthropic-ai/sdk` calls `claude-sonnet-5` with
   adaptive thinking at `low` effort, which keeps replies quick and cheap while still
   letting the model reason when a question needs it.
6. **Normalisation.** Claude's content blocks are flattened to a plain string, so the
   client only ever reads `data.content`.

### Prompt caching

The system prompt is sent as two blocks. The first is the large, unchanging briefing
built by `buildSystemPrompt()`, marked with `cache_control: { type: 'ephemeral' }`. The
second is the per-question retrieved context, which sits *after* the cache breakpoint so
it never invalidates the cached prefix. Caching is a prefix match, so the ordering
matters: repeat questions reuse the cached briefing instead of paying for it again.

Because the chat key is only ever read server-side, it is safe in Vercel's environment
variables and never reaches the browser.

## Deployment

The project deploys to Vercel as a static Vite build plus Node functions under `api/`.
Routing and security headers are in `vercel.json`.

1. Import the repository into Vercel. The framework preset is Vite; build command
   `npm run build`, output directory `dist`.
2. Add `ANTHROPIC_API_KEY` and `VITE_MAPBOX_TOKEN` under **Settings → Environment
   Variables**, for Production and Preview. Add `ALLOWED_ORIGINS` only if you need to
   allow an origin beyond the defaults.
3. Redeploy after changing any environment variable — `VITE_`-prefixed values are baked
   in at build time, so an existing deployment will not pick them up.

### Custom domain

Production runs at **https://equimetrics2026.mahakmkumawat.com**.

To point a domain at your own deployment, add it under **Settings → Domains** in Vercel
and create the DNS record Vercel shows you (a `CNAME` to `cname.vercel-dns.com` for a
subdomain). The domain is already in the `/api/chat` origin allowlist; any other domain
needs to go into `ALLOWED_ORIGINS` or the chat endpoint will answer 403 while the rest
of the site works fine.

## Project layout

```
api/            Vercel serverless functions
  _data/        Dataset and the retrieval/system-prompt builder
  chat.js       HorseLLM endpoint
public/
  data/         Static JSON the pages fetch at runtime
src/
  components/   Charts, maps, replay, shared UI
  pages/        One file per route
vite.config.js  Vite config plus the dev-time /api middleware
vercel.json     Rewrites and security headers
```

## Maintainer

Maintained by [Mahak1729](https://github.com/Mahak1729).

Originally built with [chbayah-sudo](https://github.com/chbayah-sudo).
