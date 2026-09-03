// Platform-neutral core of the HorseLLM chat endpoint. The Netlify function in
// netlify/functions/chat.mjs and the Vite dev middleware both call into this.
import { buildSystemPrompt, findRelevantHorses, findRelevantRaces } from './data/buildContext.js';

export const MODEL = 'claude-sonnet-5';
export const MAX_TOKENS = 1024;

// Cost controls. These bound what a single visitor can spend, but the counters
// live in memory and a serverless platform runs many instances, so they are a
// speed bump rather than a guarantee. The only hard ceiling is a spend limit
// set on the Anthropic account itself; see the README.
const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 8;              // per IP per minute
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_REQUESTS_PER_DAY = 200;    // per IP per day
const MAX_TURNS_SENT = 6;            // history turns forwarded upstream
const MAX_INSTANCE_REQUESTS_PER_DAY = 2000; // across all callers on this instance

const rateLimit = {};
const dailyLimit = {};
let instanceDay = Date.now();
let instanceCount = 0;

// Keeps the limiter maps from growing without bound on a long-lived instance.
function sweep(store, now, ttl) {
  if (Object.keys(store).length < 5000) return;
  for (const [k, v] of Object.entries(store)) {
    if (now - v.start > ttl) delete store[k];
  }
}

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://localhost:8888',
  'https://equimetrics2026.mahakmkumawat.com',
];

// ALLOWED_ORIGINS is a comma-separated list of extra origins (e.g. a second
// custom domain) that should be accepted alongside the defaults above.
export function allowedOrigins(env = process.env) {
  const extra = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(o => o.trim())
    .filter(Boolean);
  return [...DEFAULT_ALLOWED_ORIGINS, ...extra];
}

export function isAllowedOrigin(origin, env = process.env) {
  if (!origin) return false;
  const list = allowedOrigins(env);
  if (list.includes(origin)) return true;
  // Accept the exact origin as well as a referer, which carries a path.
  if (list.some(o => origin.startsWith(o + '/'))) return true;
  // Netlify production and deploy-preview URLs.
  if (/^https:\/\/[^/]+\.netlify\.app(\/|$)/.test(origin)) return true;
  return false;
}

/**
 * Fixed-window limiter with three ceilings: per-IP per-minute, per-IP per-day,
 * and a whole-instance daily cap so one busy day cannot run away even if the
 * caller rotates addresses. In memory, so per function instance.
 */
export function isRateLimited(ip) {
  const now = Date.now();

  if (now - instanceDay > DAY_MS) { instanceDay = now; instanceCount = 0; }
  instanceCount++;
  if (instanceCount > MAX_INSTANCE_REQUESTS_PER_DAY) return true;

  sweep(rateLimit, now, RATE_WINDOW_MS);
  sweep(dailyLimit, now, DAY_MS);

  if (!dailyLimit[ip] || now - dailyLimit[ip].start > DAY_MS) {
    dailyLimit[ip] = { start: now, count: 1 };
  } else {
    dailyLimit[ip].count++;
    if (dailyLimit[ip].count > MAX_REQUESTS_PER_DAY) return true;
  }

  if (!rateLimit[ip] || now - rateLimit[ip].start > RATE_WINDOW_MS) {
    rateLimit[ip] = { start: now, count: 1 };
    return false;
  }
  rateLimit[ip].count++;
  return rateLimit[ip].count > MAX_REQUESTS;
}

// Rejects a malformed conversation and returns the reason, or null when valid.
export function validateMessages(messages) {
  if (!messages || !Array.isArray(messages)) return 'Invalid request';
  if (messages.length > 20) return 'Too many messages';
  for (const msg of messages) {
    if (!msg.role || !msg.content || typeof msg.content !== 'string') {
      return 'Invalid message format';
    }
    if (!['user', 'assistant'].includes(msg.role)) return 'Invalid role';
    if (msg.content.length > 5000) return 'Message too long';
  }
  return null;
}

// The stable half of the system prompt is cached; the per-question RAG context
// is appended after the cache breakpoint so it never invalidates the prefix.
export function buildSystemBlocks(messages) {
  const latestUserMsg = [...messages].reverse().find(m => m.role === 'user')?.content || '';
  const horseCtx = findRelevantHorses(latestUserMsg);
  const raceCtx = findRelevantRaces(latestUserMsg);

  let ragContext = '';
  if (horseCtx.length > 0) ragContext += '\n\nRELEVANT HORSE DATA:\n' + horseCtx.join('\n\n');
  if (raceCtx.length > 0) ragContext += '\n\nRELEVANT RACE DATA:\n' + raceCtx.join('\n');

  const blocks = [
    { type: 'text', text: buildSystemPrompt(), cache_control: { type: 'ephemeral' } },
  ];
  if (ragContext) blocks.push({ type: 'text', text: ragContext });
  return blocks;
}

// Flattens Claude's content blocks into the plain string the UI renders.
// Thinking blocks are internal reasoning and are deliberately dropped.
export function extractText(response) {
  return response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('')
    .trim();
}

export async function requestCompletion(client, messages) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'low' },
    system: buildSystemBlocks(messages),
    messages: messages.slice(-MAX_TURNS_SENT).map(m => ({ role: m.role, content: m.content })),
  });
  return { content: extractText(response), model: response.model };
}
