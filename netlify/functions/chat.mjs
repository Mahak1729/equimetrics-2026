// POST /api/chat  (routed here by netlify.toml)
import Anthropic from '@anthropic-ai/sdk';
import { isAllowedOrigin, isRateLimited, validateMessages, requestCompletion } from '../../server/chat.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async function handler(req, context) {
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // `netlify dev` sets NETLIFY_DEV; everywhere else the origin check is on.
  const origin = req.headers.get('origin') || req.headers.get('referer') || '';
  if (process.env.NETLIFY_DEV !== 'true' && !isAllowedOrigin(origin)) {
    return json({ error: 'Forbidden' }, 403);
  }

  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown';
  if (isRateLimited(ip)) {
    return json({ error: 'Too many requests. Please wait a moment.' }, 429);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }
  const invalid = validateMessages(body?.messages);
  if (invalid) return json({ error: invalid }, 400);

  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ error: 'Chat is not configured' }, 500);
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    return json(await requestCompletion(client, body.messages));
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return json({ error: 'Too many requests. Please wait a moment.' }, 429);
    }
    if (err instanceof Anthropic.APIError) {
      return json({ error: 'Upstream request failed' }, 502);
    }
    return json({ error: 'Internal server error' }, 500);
  }
}
