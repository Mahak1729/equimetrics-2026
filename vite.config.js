import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function loadJSON(name) {
  return JSON.parse(readFileSync(resolve(__dirname, `server/data/${name}`), 'utf-8'))
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  // Rate limiter for dev
  const rateLimit = {}

  // Lazy-loaded data
  let _profiles, _allRaces, _replays, _forecastRaces, _gpsRaces

  function getProfiles() { if (!_profiles) _profiles = loadJSON('horseProfiles.json'); return _profiles }
  function getAllRaces() { if (!_allRaces) _allRaces = loadJSON('allRaces.json'); return _allRaces }
  function getReplays() { if (!_replays) _replays = loadJSON('replayRaces.json'); return _replays }
  async function getForecast() {
    if (!_forecastRaces) {
      const mod = await import('./server/data/forecastData.js')
      _forecastRaces = mod.forecastRaces
    }
    return _forecastRaces
  }
  function getGPSRaces() {
    if (_gpsRaces) return _gpsRaces
    const profiles = getProfiles()
    const raceMap = {}
    Object.values(profiles).forEach(p => {
      (p.races || []).forEach(r => {
        if (!r.hasGPS || !r.speeds?.length) return
        const key = `${r.date}-${r.track}-${r.raceNum}`
        if (!raceMap[key]) raceMap[key] = { id: key, date: r.date, track: r.track, raceNum: r.raceNum, distance: r.distance, surface: r.surface, type: r.raceType, purse: r.purse, horses: [] }
        raceMap[key].horses.push({ name: p.name, position: r.position, fieldSize: r.fieldSize, speeds: r.speeds, strideLengths: r.strideLengths, closingMPH: r.closingMPH, peakMPH: r.peakMPH, totalDist: r.totalDist, groundLoss: r.groundLoss, positions: r.positions, earnings: r.earnings })
      })
    })
    _gpsRaces = Object.values(raceMap).filter(r => r.horses.length >= 3).sort((a, b) => b.date.localeCompare(a.date) || a.track.localeCompare(b.track) || a.raceNum - b.raceNum)
    return _gpsRaces
  }

  const TRACK_NAMES = { AQU:'Aqueduct', GP:'Gulfstream Park', HOU:'Sam Houston', LRL:'Laurel Park', OP:'Oaklawn Park', SA:'Santa Anita', TAM:'Tampa Bay', TP:'Turfway Park', FG:'Fair Grounds', CNL:'Colonial Downs', CT:'Charles Town', PEN:'Penn National', PRX:'Parx', MVR:'Mahoning Valley' }

  function sendJSON(res, data, cache) {
    res.setHeader('Content-Type', 'application/json')
    if (cache) res.setHeader('Cache-Control', cache)
    res.end(JSON.stringify(data))
  }

  function parseBody(req, maxBytes = 102400) {
    return new Promise((resolve, reject) => {
      let body = ''
      let size = 0
      req.on('data', c => {
        size += c.length
        if (size > maxBytes) { req.destroy(); reject(new Error('Body too large')); return }
        body += c
      })
      req.on('end', () => { try { resolve(JSON.parse(body)) } catch { resolve({}) } })
    })
  }

  return {
    build: {
      rollupOptions: {
        output: {
          // Split the heavy libraries out of the page chunks. Each is used by
          // only part of the app, and separating them lets a visitor download
          // just what the route needs and keeps the rest cached across deploys.
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('mapbox-gl')) return 'vendor-map'
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-charts'
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'vendor-motion'
            if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/')) return 'vendor-react'
            return 'vendor'
          },
        },
      },
      chunkSizeWarningLimit: 900,
    },
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'api-dev-proxy',
        configureServer(server) {

          // /api/replays
          server.middlewares.use('/api/replays', (req, res) => {
            sendJSON(res, getReplays(), 's-maxage=3600')
          })

          // /api/races
          server.middlewares.use('/api/races', (req, res, next) => {
            if (req.url && req.url.startsWith('/api/races')) { next(); return }
            sendJSON(res, getAllRaces(), 's-maxage=1800')
          })
          server.middlewares.use('/api/races', (req, res) => {
            sendJSON(res, getAllRaces(), 's-maxage=1800')
          })

          // /api/forecast
          server.middlewares.use('/api/forecast', async (req, res) => {
            sendJSON(res, await getForecast(), 's-maxage=3600')
          })

          // /api/horses (search + top)
          server.middlewares.use('/api/horses', (req, res, next) => {
            const url = new URL(req.url, 'http://localhost')
            // Skip if it's a /api/horses/[name] request
            const pathAfter = req.originalUrl?.replace('/api/horses', '') || ''
            if (pathAfter.startsWith('/') && pathAfter.length > 1) { next(); return }

            const profiles = getProfiles()
            const profileList = Object.values(profiles).sort((a, b) => (b.gpsScore || 0) - (a.gpsScore || 0))
            const summarize = p => ({ name: p.name, style: p.style, numRaces: p.numRaces, numGPSRaces: p.numGPSRaces, hasGPS: p.hasGPS, gpsScore: p.gpsScore, totalEarnings: p.totalEarnings, record: p.record, avgFinish: p.avgFinish, wins: p.wins, places: p.places })

            const q = url.searchParams.get('q')
            const top = url.searchParams.get('top')
            if (q && q.length >= 2) {
              const results = profileList.filter(p => p.name.toLowerCase().includes(q.toLowerCase())).slice(0, 15).map(summarize)
              return sendJSON(res, results, 's-maxage=60')
            }
            if (top) {
              const n = Math.min(parseInt(top) || 16, 50)
              return sendJSON(res, profileList.filter(p => p.numRaces >= 2).slice(0, n).map(summarize), 's-maxage=3600')
            }
            sendJSON(res, { total: profileList.length, gpsCount: profileList.filter(p => p.hasGPS).length }, 's-maxage=3600')
          })

          // /api/horses/[name]
          server.middlewares.use('/api/horses', (req, res) => {
            const name = decodeURIComponent(req.originalUrl.replace('/api/horses/', ''))
            const profiles = getProfiles()
            const profile = profiles[name]
            if (!profile) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not found' })) }
            sendJSON(res, profile, 's-maxage=3600')
          })

          // /api/gps-races
          server.middlewares.use('/api/gps-races', (req, res) => {
            const url = new URL(req.url || req.originalUrl, 'http://localhost')
            const q = url.searchParams.get('q')
            const id = url.searchParams.get('id')
            const top = url.searchParams.get('top')
            const races = getGPSRaces()

            const summarizeRace = r => {
              const winner = [...r.horses].sort((a, b) => (a.position || 99) - (b.position || 99))[0]
              return { id: r.id, date: r.date, track: r.track, raceNum: r.raceNum, distance: r.distance, surface: r.surface, type: r.type, purse: r.purse, horseCount: r.horses.length, winnerName: winner?.name, trackName: TRACK_NAMES[r.track] || r.track }
            }

            if (id) {
              const race = races.find(r => r.id === id)
              if (!race) { res.statusCode = 404; return res.end(JSON.stringify({ error: 'Not found' })) }
              return sendJSON(res, race, 's-maxage=3600')
            }
            if (q && q.length >= 2) {
              const query = q.toLowerCase()
              const results = races.filter(r => {
                const tn = (TRACK_NAMES[r.track] || r.track).toLowerCase()
                return `${tn} r${r.raceNum} ${r.date}`.includes(query) || r.horses.some(h => h.name.toLowerCase().includes(query))
              }).slice(0, 12).map(summarizeRace)
              return sendJSON(res, results, 's-maxage=60')
            }
            const n = Math.min(parseInt(top) || 12, 30)
            sendJSON(res, { total: races.length, races: races.slice(0, n).map(summarizeRace) }, 's-maxage=3600')
          })

          // /api/chat — mirrors netlify/functions/chat.mjs so dev matches production
          server.middlewares.use('/api/chat', async (req, res) => {
            if (req.method !== 'POST') { res.statusCode = 405; return res.end(JSON.stringify({ error: 'Method not allowed' })) }
            const ip = req.socket?.remoteAddress || 'local'
            const now = Date.now()
            if (!rateLimit[ip] || now - rateLimit[ip].start > 60000) rateLimit[ip] = { start: now, count: 1 }
            else rateLimit[ip].count++
            if (rateLimit[ip].count > 15) { res.statusCode = 429; return res.end(JSON.stringify({ error: 'Too many requests.' })) }

            const body = await parseBody(req)
            const { messages } = body

            // Loaded lazily so the dev server does not pay for the data files at startup
            const { validateMessages, requestCompletion } = await import('./server/chat.js')
            const invalid = validateMessages(messages)
            if (invalid) { res.statusCode = 400; return res.end(JSON.stringify({ error: invalid })) }

            if (!env.ANTHROPIC_API_KEY) {
              res.statusCode = 500
              return res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY is not set — add it to .env' }))
            }

            try {
              const { default: Anthropic } = await import('@anthropic-ai/sdk')
              const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
              sendJSON(res, await requestCompletion(client, messages))
            } catch {
              res.statusCode = 502
              res.end(JSON.stringify({ error: 'Failed to reach the Claude API' }))
            }
          })
        },
      },
    ],
  }
})
