import { useRef, useEffect, useMemo, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const TRACK_COORDS = {
  AQU: [-73.8235, 40.6722, 'Aqueduct', 'Queens, NY'],
  GP:  [-80.1120, 25.9561, 'Gulfstream Park', 'Hallandale Beach, FL'],
  SA:  [-118.0467, 34.1392, 'Santa Anita', 'Arcadia, CA'],
  CD:  [-85.7701, 38.2025, 'Churchill Downs', 'Louisville, KY'],
  KEE: [-84.4988, 38.0432, 'Keeneland', 'Lexington, KY'],
  TAM: [-82.6082, 28.1564, 'Tampa Bay Downs', 'Tampa, FL'],
  OP:  [-93.0780, 34.4774, 'Oaklawn Park', 'Hot Springs, AR'],
  LRL: [-76.8547, 39.0870, 'Laurel Park', 'Laurel, MD'],
  TP:  [-84.6102, 38.9886, 'Turfway Park', 'Florence, KY'],
  FG:  [-90.1030, 29.9397, 'Fair Grounds', 'New Orleans, LA'],
  SAR: [-73.7997, 43.0691, 'Saratoga', 'Saratoga Springs, NY'],
  DMR: [-117.2701, 33.0018, 'Del Mar', 'Del Mar, CA'],
  MTH: [-74.0226, 40.2299, 'Monmouth Park', 'Oceanport, NJ'],
  PIM: [-76.7115, 39.3143, 'Pimlico', 'Baltimore, MD'],
  BEL: [-73.7181, 40.6720, 'Belmont Park', 'Elmont, NY'],
  HOU: [-95.5012, 29.6925, 'Sam Houston', 'Houston, TX'],
  CT:  [-77.8697, 39.2883, 'Charles Town', 'Charles Town, WV'],
  PEN: [-76.7291, 40.3478, 'Penn National', 'Grantville, PA'],
  PRX: [-74.9319, 40.1103, 'Parx Racing', 'Bensalem, PA'],
  MVR: [-80.6680, 40.9967, 'Mahoning Valley', 'Youngstown, OH'],
  CNL: [-76.9991, 37.5199, 'Colonial Downs', 'New Kent, VA'],
  SUN: [-106.5989, 31.8257, 'Sunland Park', 'Sunland Park, NM'],
  TUP: [-112.0116, 33.6165, 'Turf Paradise', 'Phoenix, AZ'],
  FON: [-98.3379, 40.9136, 'Fonner Park', 'Grand Island, NE'],
  WRD: [-95.4519, 36.3162, 'Will Rogers Downs', 'Claremore, OK'],
  RP:  [-97.4700, 35.8500, 'Remington Park', 'Oklahoma City, OK'],
  GG:  [-122.3903, 37.5926, 'Golden Gate Fields', 'Albany, CA'],
  IND: [-86.2960, 39.7640, 'Indiana Grand', 'Shelbyville, IN'],
  MED: [-74.0917, 40.8212, 'Meadowlands', 'East Rutherford, NJ'],
  DEL: [-75.5998, 39.5855, 'Delaware Park', 'Wilmington, DE'],
  LS:  [-97.0803, 32.8169, 'Lone Star Park', 'Grand Prairie, TX'],
  DED: [-93.4040, 30.2070, 'Delta Downs', 'Vinton, LA'],
  EVD: [-92.0111, 30.5266, 'Evangeline Downs', 'Opelousas, LA'],
  LAD: [-93.7040, 32.4870, 'Louisiana Downs', 'Bossier City, LA'],
  CBY: [-93.5258, 44.7510, 'Canterbury Park', 'Shakopee, MN'],
  PRM: [-93.4523, 41.6592, 'Prairie Meadows', 'Altoona, IA'],
  HAW: [-87.8008, 41.8148, 'Hawthorne', 'Cicero, IL'],
  AP:  [-88.1357, 42.0820, 'Arlington Park', 'Arlington Heights, IL'],
  FL:  [-77.1640, 42.8870, 'Finger Lakes', 'Farmington, NY'],
  MNR: [-80.6535, 40.5490, 'Mountaineer', 'Chester, WV'],
  PID: [-80.0970, 42.1270, 'Presque Isle Downs', 'Erie, PA'],
  LRC: [-118.0400, 33.8060, 'Los Alamitos', 'Cypress, CA'],
  ELP: [-106.4417, 31.7600, 'Sunland Park', 'El Paso, TX'],
  BTP: [-84.3120, 39.0970, 'Belterra Park', 'Cincinnati, OH'],
  TDN: [-81.5209, 41.4540, 'Thistledown', 'Cleveland, OH'],
  ALB: [-106.6291, 35.0807, 'Albuquerque Downs', 'Albuquerque, NM'],
  FMT: [-77.4605, 38.3052, 'Fredericksburg', 'Fredericksburg, VA'],
  GRP: [-80.1260, 26.8450, 'Gulfstream West', 'FL'],
  WO:  [-79.6077, 43.7160, 'Woodbine', 'Toronto, ON'],
  SRP: [-108.2010, 36.7257, 'Sunray Park', 'Farmington, NM'],
  ASD: [-104.7540, 39.6450, 'Arapahoe Park', 'Aurora, CO'],
  ARP: [-104.7540, 39.6450, 'Arapahoe Park', 'Aurora, CO'],
  FER: [-75.8569, 39.7016, 'Fair Hill', 'Fair Hill, MD'],
  HST: [-123.0400, 49.2860, 'Hastings Park', 'Vancouver, BC'],
  EMD: [-122.2460, 47.2670, 'Emerald Downs', 'Auburn, WA'],
  ZIA: [-103.1335, 32.7344, 'Zia Park', 'Hobbs, NM'],
  FP:  [-89.9714, 38.6892, 'Fairmount Park', 'Collinsville, IL'],
  FE:  [-95.9700, 36.1500, 'Fair Meadows', 'Tulsa, OK'],
  KD:  [-86.5700, 36.7200, 'Kentucky Downs', 'Franklin, KY'],
  BAQ: [-69.3200, 10.0700, 'La Rinconada', 'Caracas, VZ'],
  CTD: [-72.0900, 41.3500, 'CT Downs', 'CT'],
  CTM: [-77.8697, 39.2883, 'Charles Town', 'WV'],
  FNO: [-119.7726, 36.7378, 'Fresno', 'Fresno, CA'],
  GIL: [-89.8000, 39.0000, 'Fairmount', 'IL'],
  HCN: [-95.8600, 41.2600, 'Horseshoe', 'Council Bluffs, IA'],
  LEG: [-106.5989, 31.8257, 'Legends', 'NM'],
  PLN: [-100.7500, 40.7000, 'Platte', 'NE'],
  SWF: [-74.3000, 41.4500, 'Finger Lakes', 'NY'],
  FH:  [-75.8569, 39.7016, 'Fair Hill', 'MD'],
  LA:  [-118.0400, 33.8060, 'Los Alamitos', 'CA'],
  FAR: [-96.7898, 46.8772, 'Fargo', 'Fargo, ND'],
  WYO: [-104.8020, 41.1400, 'Wyoming Downs', 'Evanston, WY'],
  TIM: [-76.6084, 39.4307, 'Timonium', 'Timonium, MD'],
};

const GOLD = '#C59757';
const GREEN = '#52B788';
const BLUE = '#5B8DEF';

function esc(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function JourneyMapInner({ races, horseName }) {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const popupRef = useRef(null);

  const { locations, routeCoords, totalRaces, winCount } = useMemo(() => {
    const sorted = [...(races || [])].sort((a, b) => a.date.localeCompare(b.date));
    const locMap = {};
    const route = [];

    sorted.forEach((r, i) => {
      const code = r.track?.trim();
      if (!code) return;
      const coords = TRACK_COORDS[code];
      if (!coords) return;
      const key = `${coords[0].toFixed(4)},${coords[1].toFixed(4)}`;
      route.push([coords[0], coords[1]]);
      if (!locMap[key]) {
        locMap[key] = {
          lng: coords[0], lat: coords[1], name: coords[2], city: coords[3],
          races: [], hasWin: false, isFirst: false, isLast: false,
        };
      }
      locMap[key].races.push({
        idx: i + 1, date: r.date, position: r.position,
        fieldSize: r.fieldSize, earnings: r.earnings, hasGPS: r.hasGPS,
      });
      if (r.position === 1) locMap[key].hasWin = true;
    });

    const locArr = Object.values(locMap);
    if (route.length > 0) {
      // Mark first & last locations
      const firstKey = `${route[0][0].toFixed(4)},${route[0][1].toFixed(4)}`;
      const lastKey = `${route[route.length - 1][0].toFixed(4)},${route[route.length - 1][1].toFixed(4)}`;
      locArr.forEach(loc => {
        const k = `${loc.lng.toFixed(4)},${loc.lat.toFixed(4)}`;
        if (k === firstKey) loc.isFirst = true;
        if (k === lastKey) loc.isLast = true;
      });
    }

    return {
      locations: locArr,
      routeCoords: route,
      totalRaces: sorted.filter(r => TRACK_COORDS[r.track?.trim()]).length,
      winCount: sorted.filter(r => r.position === 1 && TRACK_COORDS[r.track?.trim()]).length,
    };
  }, [races, horseName]);

  useEffect(() => {
    if (!mapContainer.current || locations.length === 0) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-95, 38],
      zoom: 3.5,
      attributionControl: false,
    });
    mapRef.current = map;

    map.on('load', () => {
      // ── Route line ──
      if (routeCoords.length >= 2) {
        map.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', geometry: { type: 'LineString', coordinates: routeCoords } },
        });
        map.addLayer({
          id: 'route-glow', type: 'line', source: 'route',
          paint: { 'line-color': GOLD, 'line-width': 8, 'line-opacity': 0.1, 'line-blur': 12 },
        });
        map.addLayer({
          id: 'route-line', type: 'line', source: 'route',
          paint: { 'line-color': GOLD, 'line-width': 2, 'line-opacity': 0.45, 'line-dasharray': [3, 2] },
        });
      }

      // ── Build GeoJSON features for all locations ──
      const features = locations.map(loc => {
        const type = loc.isFirst ? 'first' : loc.isLast ? 'last' : loc.hasWin ? 'win' : 'other';
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [loc.lng, loc.lat] },
          properties: {
            type,
            name: loc.name,
            city: loc.city,
            raceCount: loc.races.length,
            label: loc.isFirst ? 'START' : loc.isLast ? 'LATEST' : '',
            racesJson: JSON.stringify(loc.races),
          },
        };
      });

      map.addSource('stops', { type: 'geojson', data: { type: 'FeatureCollection', features } });

      // Outer glow circle
      map.addLayer({
        id: 'stops-glow', type: 'circle', source: 'stops',
        paint: {
          'circle-radius': ['match', ['get', 'type'], 'first', 16, 'last', 16, 'win', 14, 10],
          'circle-color': ['match', ['get', 'type'], 'first', GREEN, 'last', BLUE, 'win', GOLD, 'transparent'],
          'circle-opacity': 0.12,
          'circle-blur': 1,
        },
      });

      // Main circle
      map.addLayer({
        id: 'stops-circle', type: 'circle', source: 'stops',
        paint: {
          'circle-radius': ['match', ['get', 'type'], 'first', 8, 'last', 8, 'win', 7, 5],
          'circle-color': ['match', ['get', 'type'], 'first', GREEN, 'last', BLUE, 'win', GOLD, '#2A3626'],
          'circle-stroke-width': 2,
          'circle-stroke-color': ['match', ['get', 'type'], 'first', GREEN, 'last', BLUE, 'win', GOLD, 'rgba(197,151,87,0.3)'],
        },
      });

      // Race count label (for locations with 2+ races)
      map.addLayer({
        id: 'stops-count', type: 'symbol', source: 'stops',
        filter: ['>', ['get', 'raceCount'], 1],
        layout: {
          'text-field': ['get', 'raceCount'],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0.8, -0.8],
          'text-allow-overlap': true,
        },
        paint: { 'text-color': GOLD, 'text-halo-color': '#0D110A', 'text-halo-width': 1.5 },
      });

      // Start / Latest labels
      map.addLayer({
        id: 'stops-label', type: 'symbol', source: 'stops',
        filter: ['!=', ['get', 'label'], ''],
        layout: {
          'text-field': ['get', 'label'],
          'text-font': ['DIN Pro Bold', 'Arial Unicode MS Bold'],
          'text-size': 11,
          'text-offset': [0, -1.6],
          'text-allow-overlap': true,
          'text-letter-spacing': 0.15,
        },
        paint: {
          'text-color': ['match', ['get', 'type'], 'first', GREEN, 'last', BLUE, '#8A847E'],
          'text-halo-color': '#0D110A',
          'text-halo-width': 2,
        },
      });

      // Track name labels
      map.addLayer({
        id: 'stops-name', type: 'symbol', source: 'stops',
        layout: {
          'text-field': ['get', 'name'],
          'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-allow-overlap': false,
          'text-optional': true,
        },
        paint: { 'text-color': '#8A847E', 'text-halo-color': '#0D110A', 'text-halo-width': 1.5 },
      });

      // ── Click handler for popups ──
      map.on('click', 'stops-circle', (e) => {
        if (!e.features?.length) return;
        const f = e.features[0];
        const coords = f.geometry.coordinates.slice();
        const props = f.properties;
        const raceList = JSON.parse(props.racesJson);

        const rows = raceList.map(r => {
          const isWin = r.position === 1;
          const fin = r.position
            ? `<span style="color:${isWin ? GOLD : '#D6D1CC'};font-weight:600;font-size:14px">${esc(r.position)}</span><span style="color:#5A5550;font-size:14px">/${esc(r.fieldSize || '?')}</span>`
            : '<span style="color:#5A5550;font-size:14px">–</span>';
          return `<div style="display:flex;gap:14px;align-items:center;padding:6px 0;border-bottom:1px solid rgba(197,151,87,0.05)">
            <span style="font-family:monospace;font-size:12px;color:#5A5550;min-width:27px">#${esc(r.idx)}</span>
            <span style="min-width:41px">${fin}</span>
            ${r.earnings ? `<span style="font-family:monospace;font-size:12px;color:${GOLD}">$${esc(r.earnings.toLocaleString())}</span>` : ''}
            <span style="font-family:monospace;font-size:11px;color:#5A5550;margin-left:auto">${esc(r.date?.slice(5))}${r.hasGPS ? ' <span style="color:#52B788">GPS</span>' : ''}</span>
          </div>`;
        }).join('');

        if (popupRef.current) popupRef.current.remove();
        popupRef.current = new mapboxgl.Popup({ offset: 16, closeButton: true, maxWidth: '294px', className: 'journey-popup' })
          .setLngLat(coords)
          .setHTML(`<div style="font-family:Inter,system-ui,sans-serif">
            <div style="font-size:17px;font-weight:700;color:#D6D1CC;margin-bottom:3px">${esc(props.name)}</div>
            <div style="font-size:14px;color:#8A847E;margin-bottom:9px">${esc(props.city)}</div>
            ${rows}
          </div>`)
          .addTo(map);
      });

      // Cursor
      map.on('mouseenter', 'stops-circle', () => { map.getCanvas().style.cursor = 'pointer'; });
      map.on('mouseleave', 'stops-circle', () => { map.getCanvas().style.cursor = ''; });

      // Fit bounds
      if (locations.length >= 2) {
        const bounds = new mapboxgl.LngLatBounds();
        locations.forEach(l => bounds.extend([l.lng, l.lat]));
        map.fitBounds(bounds, { padding: 70, maxZoom: 9, duration: 800 });
      } else {
        map.flyTo({ center: [locations[0].lng, locations[0].lat], zoom: 7, duration: 800 });
      }
    });

    return () => {
      if (popupRef.current) { popupRef.current.remove(); popupRef.current = null; }
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, [horseName, locations, routeCoords]);

  if (locations.length === 0) return null;

  return (
    <div className="card-flat" style={{ overflow: 'hidden', marginBottom: 28 }}>
      <div style={{ padding: '28px 36px', borderBottom: '1px solid rgba(197,151,87,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 18 }}>
        <div>
          <div className="label" style={{ fontSize: 15, color: '#C59757', marginBottom: 12 }}>Journey</div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 30, fontWeight: 500, color: '#D6D1CC' }}>
            {horseName}&rsquo;s Racing Trail
          </h3>
        </div>
        <div style={{ display: 'flex', gap: 32 }}>
          {[
            { value: locations.length, label: locations.length === 1 ? 'Track' : 'Tracks' },
            { value: totalRaces, label: totalRaces === 1 ? 'Race' : 'Races' },
            { value: winCount, label: winCount === 1 ? 'Win' : 'Wins' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, color: '#C59757' }}>{s.value}</div>
              <div style={{ fontSize: 15, color: '#5A5550', fontWeight: 500, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div ref={mapContainer} style={{ height: 460, width: '100%' }} />

      <div style={{ padding: '22px 36px', borderTop: '1px solid rgba(197,151,87,0.06)', display: 'flex', gap: 30, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { color: GREEN, label: 'First Race' },
          { color: BLUE, label: 'Latest Race' },
          { color: GOLD, label: 'Win' },
          { color: '#2A3626', border: 'rgba(197,151,87,0.3)', label: 'Other Starts' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 16, color: '#8A847E' }}>
            <div style={{ width: 15, height: 15, borderRadius: '50%', background: l.color, border: `2px solid ${l.border || l.color}` }} />
            {l.label}
          </div>
        ))}
        <div style={{ fontSize: 15, color: '#5A5550', marginLeft: 'auto', fontStyle: 'italic' }}>
          Click a pin for race details
        </div>
      </div>

      <style>{`
        .journey-popup .mapboxgl-popup-content {
          padding: 16px 20px !important;
          background: #141A10 !important;
          border: 1px solid rgba(197,151,87,0.2) !important;
          border-radius: 6px !important;
          padding: 14px 18px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.6) !important;
        }
        .journey-popup .mapboxgl-popup-tip {
          border-top-color: #141A10 !important;
          border-bottom-color: #141A10 !important;
        }
        .journey-popup .mapboxgl-popup-close-button {
          color: #5A5550 !important;
          font-size: 18px !important;
          padding: 4px 8px !important;
        }
      `}</style>
    </div>
  );
}

const JourneyMap = memo(JourneyMapInner, (prev, next) => prev.horseName === next.horseName);
export default JourneyMap;
