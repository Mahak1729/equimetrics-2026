import Anthropic from '@anthropic-ai/sdk';
import { buildSystemPrompt, findRelevantHorses, findRelevantRaces } from './_data/buildContext.js';

const rateLimit = {};
const RATE_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 15;

export const MODEL = 'claude-sonnet-5';
export const MAX_TOKENS = 2048;

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://equimetrics2026.mahakmkumawat.com',
];

// ALLOWED_ORIGINS is a comma-separated list of extra origins (e.g. a preview
// domain) that should be accepted alongside the defaults above.
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
  if (/^https:\/\/[^/]+\.vercel\.app(\/|$)/.test(origin)) return true;
  return false;
}

function isRateLimited(ip) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Origin check
  const origin = req.headers.origin || req.headers.referer || '';
  if (process.env.NODE_ENV === 'production' && !isAllowedOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  const { messages } = req.body || {};
  const invalid = validateMessages(messages);
  if (invalid) return res.status(400).json({ error: invalid });

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Chat is not configured' });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    res.status(200).json(await requestCompletion(client, messages));
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
    }
    if (err instanceof Anthropic.APIError) {
      return res.status(502).json({ error: 'Upstream request failed' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
