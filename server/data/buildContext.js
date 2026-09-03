// Builds a compact context string from our data for the LLM.
// Static JSON imports so the function bundler inlines the data instead of
// relying on files being present next to the bundle at runtime.
import allProfiles from './horseProfiles.json' with { type: 'json' };
import allRaces from './allRaces.json' with { type: 'json' };
import { forecastRaces } from './forecastData.js';

const TRACK_NAMES = {
  AQU: 'Aqueduct (Queens, NY)', GP: 'Gulfstream Park (Hallandale Beach, FL)',
  'GP ': 'Gulfstream Park (FL)', HOU: 'Sam Houston (Houston, TX)',
  LRL: 'Laurel Park (Laurel, MD)', OP: 'Oaklawn Park (Hot Springs, AR)',
  'OP ': 'Oaklawn Park (AR)', SA: 'Santa Anita (Arcadia, CA)',
  'SA ': 'Santa Anita (CA)', TAM: 'Tampa Bay Downs (Tampa, FL)',
  TP: 'Turfway Park (Florence, KY)', 'TP ': 'Turfway Park (Florence, KY)',
  CT: 'Charles Town (Charles Town, WV)', 'CT ': 'Charles Town (WV)',
  PEN: 'Penn National (Grantville, PA)', PRX: 'Parx Racing (Bensalem, PA)',
  MVR: 'Mahoning Valley (Youngstown, OH)', FON: 'Fonner Park (Grand Island, NE)',
  TUP: 'Turf Paradise (Phoenix, AZ)', SUN: 'Sunland Park (Sunland Park, NM)',
  CMR: 'Camarero (San Juan, PR)', WRD: 'Will Rogers Downs (Claremore, OK)',
  CAM: 'Camarero (PR)', CHE: 'Cherokee (Cherokee, NC)',
  FG: 'Fair Grounds (New Orleans, LA)', CNL: 'Colonial Downs (New Kent, VA)',
  CD: 'Churchill Downs (Louisville, KY)', KEE: 'Keeneland (Lexington, KY)',
};

export function buildSystemPrompt() {
  // Upcoming race summary
  const dates = [...new Set(allRaces.map(r => r.date))].sort();
  const tracks = [...new Set(allRaces.map(r => r.track.trim()))];
  const trackList = tracks.map(t => `${t} (${TRACK_NAMES[t] || TRACK_NAMES[t.trim()] || t})`).join(', ');

  // Top horses
  const profileList = Object.values(allProfiles);
  const topGPS = profileList.filter(p => p.hasGPS && p.gpsScore).sort((a, b) => b.gpsScore - a.gpsScore).slice(0, 30);
  const topEarners = profileList.sort((a, b) => (b.totalEarnings || 0) - (a.totalEarnings || 0)).slice(0, 20);

  // Featured race summaries
  const featuredSummaries = forecastRaces.map(r => {
    const picks = r.gpsEdgePicks.map(p => `${p.name} (${p.odds}): ${p.headline}`).join('; ');
    return `${r.trackName} R${r.raceNumber} ${r.date} ${r.distance} ${r.surface} ${r.type} ${r.purse} - ${r.fieldSize} horses, ${r.gpsCoverage}% GPS. Pace: ${r.paceAnalysis.label}. GPS Picks: ${picks}`;
  }).join('\n');

  return `You are HorseLLM, the AI assistant for Equimetrics, a GPS-powered horse racing intelligence platform built for the 2026 Equibase Econ Games competition.

PERSONALITY: You are a knowledgeable racing analyst who speaks clearly and concisely. You give confident, specific answers. You reference actual data. You explain GPS concepts simply. Keep answers to 2-4 sentences unless the user asks for detail. Use a conversational but informed tone, like a sharp friend at the track, not a textbook.

WRITING STYLE: Never use em dashes (—) or en dashes (–) in your answers. Use a comma, a colon, or a new sentence instead. Do not use contractions.

DATA YOU HAVE ACCESS TO:
- ${profileList.length.toLocaleString()} horse profiles (${profileList.filter(p => p.hasGPS).length} with GPS data, ${profileList.filter(p => !p.hasGPS).length} traditional only)
- ${allRaces.length} upcoming races across ${dates.length} days (${dates[0]} to ${dates[dates.length - 1]})
- Tracks: ${trackList}
- GPS metrics include: sectional speed (mph), closing velocity, stride length, stride fade %, ground loss (extra meters from running wide), position at every 1/16 mile gate
- Traditional metrics: finish position, lengths behind, morning line odds, purse, field size

FEATURED RACES (with full GPS analysis):
${featuredSummaries}

TOP 15 HORSES BY GPS SCORE:
${topGPS.slice(0, 15).map(h => `${h.name}: GPS ${h.gpsScore}, ${h.style || '?'}, peak ${h.bestPeak || '?'}mph, closing ${h.avgClosing || '?'}mph, ground loss ${h.avgGroundLoss || '?'}m, fade ${h.strideFade || '?'}%, record ${h.record}, earnings $${(h.totalEarnings || 0).toLocaleString()}`).join('\n')}

TOP 10 EARNERS:
${topEarners.slice(0, 10).map(h => `${h.name}: $${(h.totalEarnings || 0).toLocaleString()}, record ${h.record}, ${h.numRaces} races${h.hasGPS ? `, GPS score ${h.gpsScore}` : ', traditional only'}`).join('\n')}

TRACK LOCATIONS (for proximity questions):
${Object.entries(TRACK_NAMES).filter(([k]) => !k.includes(' ')).map(([k, v]) => `${k}: ${v}`).join('\n')}

KEY CONCEPTS:
- Ground Loss: Horses running wide cover more distance. A horse with +15m ground loss ran 15m further than one on the rail. This is invisible in traditional data.
- Closing Velocity: Speed at the finish line. Higher = more energy remaining. Key indicator of next-race improvement.
- Stride Fade: % change in stride length from mid-race to finish. Close to 0% = great stamina. -8% = tiring badly.
- GPS Score: 0-100 composite of speed, closing power, efficiency, and stamina from GPS data.
- Running Styles: Front Runner (leads early), Stalker (sits 2nd-3rd), Closer (comes from behind).
- Pace Scenario: When many front-runners enter, they duel and tire, benefiting closers. Few speed horses = soft pace favoring front-runners.

RULES:
- Always reference specific horses and numbers when possible
- If asked about a specific horse, look them up in the data
- For "who will win" questions, give a pick with reasoning but add a disclaimer
- For location questions, suggest the nearest track(s) from TRACK LOCATIONS
- Keep answers SHORT and punchy unless asked to elaborate
- Never fabricate data. If you don't have info on a horse, say so`;
}

export function buildHorseContext(horseName) {
  const h = allProfiles[horseName];
  if (!h) return null;

  let ctx = `HORSE: ${h.name}\nRecord: ${h.record} | Races: ${h.numRaces} | Earnings: $${(h.totalEarnings || 0).toLocaleString()}`;
  if (h.hasGPS) {
    ctx += `\nGPS Score: ${h.gpsScore} | Style: ${h.style} | Peak: ${h.bestPeak}mph | Closing: ${h.avgClosing}mph | Ground Loss: ${h.avgGroundLoss}m avg | Stride Fade: ${h.strideFade}%`;
  }
  ctx += `\nRecent races:`;
  (h.races || []).slice(0, 5).forEach(r => {
    ctx += `\n  ${r.date} ${r.track} R${r.raceNum}: ${r.distance} ${r.surface} ${r.raceType} - Finished ${r.position || '?'}/${r.fieldSize || '?'}, earned $${(r.earnings || 0).toLocaleString()} of $${(r.purse || 0).toLocaleString()} purse`;
    if (r.hasGPS && r.peakMPH) ctx += ` [GPS: peak ${r.peakMPH}mph, close ${r.closingMPH}mph, loss +${r.groundLoss}m]`;
  });
  return ctx;
}

export function findRelevantHorses(query) {
  const q = query.toLowerCase();
  const profiles = Object.values(allProfiles);

  // Check if any horse names are mentioned
  const mentioned = profiles.filter(p => q.includes(p.name.toLowerCase()));
  if (mentioned.length > 0) return mentioned.map(h => buildHorseContext(h.name)).filter(Boolean);

  return [];
}

export function findRelevantRaces(query) {
  const q = query.toLowerCase();
  const relevant = [];

  // Check for track mentions
  for (const [code, name] of Object.entries(TRACK_NAMES)) {
    if (q.includes(code.toLowerCase().trim()) || q.includes(name.toLowerCase().split('(')[0].trim()) || q.includes(name.toLowerCase().split(',')[0].replace('(', '').trim())) {
      const trackRaces = allRaces.filter(r => r.track.trim() === code.trim()).slice(0, 5);
      if (trackRaces.length > 0) {
        relevant.push(`Upcoming at ${name}: ${trackRaces.map(r => `${r.date} R${r.raceNumber} (${r.fieldSize}h, ${r.gpsPct}% GPS)`).join(', ')}`);
      }
    }
  }

  // Check for date mentions
  const dateMatch = q.match(/march?\s+(\d+)|(\d+)\/(\d+)/i);
  if (dateMatch) {
    const day = dateMatch[1] || dateMatch[3];
    const races = allRaces.filter(r => r.date.endsWith(`-${day.padStart(2, '0')}`));
    if (races.length > 0) {
      const byTrack = {};
      races.forEach(r => { byTrack[r.track.trim()] = (byTrack[r.track.trim()] || 0) + 1; });
      relevant.push(`Races on March ${day}: ${Object.entries(byTrack).map(([t, c]) => `${TRACK_NAMES[t] || t} (${c} races)`).join(', ')}`);
    }
  }

  return relevant;
}
