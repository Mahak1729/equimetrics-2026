// GET /api/horses/:name  (routed here by netlify.toml)
import allProfiles from '../../server/data/horseProfiles.json' with { type: 'json' };

const json = (body, status = 200, cache = 'no-store') =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': cache },
  });

export default async function handler(req) {
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);

  // Works whether we see the public path (/api/horses/Name) or the internal
  // function path (/.netlify/functions/horse/Name): the horse is the last segment.
  const segments = new URL(req.url).pathname.split('/').filter(Boolean);
  const last = segments[segments.length - 1] || '';
  if (!last || last === 'horse' || last === 'horses') {
    return json({ error: 'Horse name required' }, 400);
  }

  let name;
  try {
    name = decodeURIComponent(last);
  } catch {
    return json({ error: 'Invalid horse name' }, 400);
  }

  const profile = allProfiles[name];
  if (!profile) return json({ error: 'Horse not found' }, 404);

  return json(profile, 200, 'public, s-maxage=3600');
}
