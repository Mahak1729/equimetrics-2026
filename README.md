# Equimetrics 2026

GPS-powered horse racing intelligence, built for the 2026 Equibase Econ Games.

Equimetrics turns raw sectional GPS data into something a human can read: per-furlong
speed, closing velocity, stride length and fade, ground loss from running wide, and
position at every gate. On top of that sits **HorseLLM**, a chat assistant that answers
questions about horses and upcoming races using the same dataset.

Built with React 19, Vite, Tailwind CSS, Recharts, Mapbox GL and the Anthropic API,
deployed on Netlify.

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
locally and in production. You do not need the Netlify CLI for day-to-day work, but
`npx netlify dev` (port 8888) runs the real functions if you want to test those.

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
| `ANTHROPIC_API_KEY` | Yes, for chat | `/api/chat` (function only) | From the [Anthropic Console](https://console.anthropic.com/settings/keys). Never exposed to the browser. On Netlify, scope it to **Functions**. |
| `VITE_MAPBOX_TOKEN` | Yes, for the map | `JourneyMap` (client) | A public Mapbox token. The `VITE_` prefix means it *is* bundled into the client, so use a token restricted by URL. On Netlify, scope it to **Builds**. |
| `ALLOWED_ORIGINS` | No | `/api/chat` (function only) | Comma-separated extra origins allowed to call the chat endpoint, on top of the built-in list. |

Everything else the app needs is committed under `server/data/`, so there is no database
to provision.

## API routes

Two routes ship as Netlify Functions in `netlify/functions/`, and `netlify.toml`
rewrites the public `/api` paths onto them:

| Route | Method | Function | Returns |
| --- | --- | --- | --- |
| `/api/chat` | POST | `chat.mjs` | HorseLLM reply |
| `/api/horses/:name` | GET | `horse.mjs` | One horse profile |

The dev middleware in `vite.config.js` also serves `/api/races`, `/api/replays`,
`/api/forecast`, `/api/horses` and `/api/gps-races`. Those have no deployed counterpart
and nothing in the app calls them today: the pages fetch static JSON from
`public/data/` instead. If you start calling one of them from the client, add a matching
function under `netlify/functions/` and a redirect in `netlify.toml` first, or it will
fall through to the SPA fallback and return `index.html`.

## How the chat endpoint works

`POST /api/chat` takes a conversation and returns a single reply:

```jsonc
// request
{ "messages": [{ "role": "user", "content": "How did Sea Boss close last out?" }] }

// response
{ "content": "...", "model": "claude-sonnet-5" }
```

The function in `netlify/functions/chat.mjs` handles the HTTP layer, and everything
else lives in the platform-neutral `server/chat.js`, which the Vite dev middleware shares:

1. **Origin check.** The request must come from an allowed origin: `localhost`, any
   `*.netlify.app` deployment, `https://equimetrics2026.mahakmkumawat.com`, or anything
   listed in `ALLOWED_ORIGINS`. Everything else gets a 403. The check is skipped only
   under `netlify dev`.
2. **Rate limit.** 15 requests per IP per minute, in memory. This is per function
   instance, so treat it as a speed bump rather than a hard guarantee.
3. **Validation.** At most 20 messages, roles limited to `user` and `assistant`, and
   5,000 characters per message.
4. **Retrieval.** `server/data/buildContext.js` pulls the horses and races mentioned in
   the latest user message out of the dataset. The JSON is imported statically so the
   function bundler inlines it; nothing is read from disk at runtime.
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

Because the chat key is only ever read inside the function, it is safe in Netlify's
environment variables and never reaches the browser.

## Deployment

The project deploys to Netlify as a static Vite build plus two Netlify Functions.
Build settings, `/api` redirects, the SPA fallback and the security headers all live in
`netlify.toml`, so the Netlify UI needs almost nothing.

1. In Netlify choose **Add new site → Import an existing project**, connect GitHub and
   pick this repository. Netlify reads `netlify.toml`, so the build command
   (`npm run build`), publish directory (`dist`) and functions directory are prefilled.
   Leave them as they are and deploy.
2. Open **Site configuration → Environment variables** and add:
   - `ANTHROPIC_API_KEY`, scoped to **Functions**
   - `VITE_MAPBOX_TOKEN`, scoped to **Builds**
   - `ALLOWED_ORIGINS`, scoped to Functions, only if you need an origin beyond the defaults
3. Trigger a redeploy from **Deploys → Trigger deploy → Deploy site**. Environment
   variables only take effect on deploys that happen after they are set, and
   `VITE_`-prefixed values are compiled into the client bundle at build time.

The first deploy is a good moment to open HorseLLM and ask one question. If it answers,
the function, the key and the redirects are all wired up.

### Custom domain

Production runs at **https://equimetrics2026.mahakmkumawat.com**.

To attach it, go to **Domain management → Add a domain**, enter the subdomain, and
create the DNS record Netlify shows you (a `CNAME` pointing at your
`<site-name>.netlify.app` address). Netlify provisions the TLS certificate automatically
once DNS resolves. The domain is already in the `/api/chat` origin allowlist; any other
domain needs to go into `ALLOWED_ORIGINS` or the chat endpoint will answer 403 while the
rest of the site works fine.

## Project layout

```
netlify/
  functions/    Netlify Functions: chat.mjs and horse.mjs (the HTTP layer only)
server/
  chat.js       Platform-neutral chat logic shared by the function and the dev server
  data/         Dataset and the retrieval/system-prompt builder
public/
  data/         Static JSON the pages fetch at runtime
src/
  components/   Charts, maps, replay, shared UI
  pages/        One file per route
netlify.toml    Build settings, /api redirects, SPA fallback, security headers
vite.config.js  Vite config plus the dev-time /api middleware
```

## Credits

Originally built by [chbayah-sudo](https://github.com/chbayah-sudo) and
[Mahak1729](https://github.com/Mahak1729) as the coders, with contributions from the
rest of the Econ Games 2026 teams.

Maintained by [Mahak1729](https://github.com/Mahak1729).
