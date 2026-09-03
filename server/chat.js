// Platform-neutral core of the HorseLLM chat endpoint. The Netlify function in
// netlify/functions/chat.mjs and the Vite dev middleware both call into this.
import { buildSystemPrompt, findRelevantHorses, findRelevantRaces } from './data/buildContext.js';

export const MODEL = 'claude-sonnet-5';
export const MAX_TOKENS = 2048;

const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;
const rateLimit = {};

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

// Fixed-window limiter, in memory. Per function instance, so treat it as a
// speed bump rather than a hard guarantee.
export function isRateLimited(ip) {
  const now = Date.now();
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
    messages: messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
  });
  return { content: extractText(response), model: response.model };
}
