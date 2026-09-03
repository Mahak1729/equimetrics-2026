// Upcoming race data derived from the actual upcoming races Excel file
// Focused on races at GPS-equipped tracks with highest GPS coverage

export const forecastRaces = [
  {
    id: 'tam-r7-0328',
    track: 'TAM', trackName: 'Tampa Bay Downs',
    date: '2026-03-28', raceNumber: 7,
    distance: '1M', distanceFurlongs: 8, surface: 'Dirt',
    type: 'CLM', purse: '$16,000', fieldSize: 14,
    gpsCoverage: 100,
    horses: [
      { name: 'Neoteric', post: 1, odds: '5/2', jockey: 'S. Gonzalez', trainer: 'G. Sacco', style: 'Front Runner', gpsScore: 88, hasGPS: true, speeds: [33, 36, 38, 39, 39.5, 39.2, 38.5, 37.8, 37, 36.2, 35.5, 35], peakMPH: 39.5, closingMPH: 35.0, efficiency: 94, strideFade: -3.2, groundLossAvg: 5 },
      { name: 'Jibilian', post: 2, odds: '3/1', jockey: 'D. Bridgmohan', trainer: 'M. Maker', style: 'Stalker', gpsScore: 85, hasGPS: true, speeds: [32, 35, 37, 38, 38.5, 39, 39, 38.5, 37.8, 37, 36.5, 36], peakMPH: 39.0, closingMPH: 36.0, efficiency: 91, strideFade: -2.1, groundLossAvg: 8 },
      { name: 'Son of a Slew', post: 3, odds: '6/1', jockey: 'A. Castillo', trainer: 'R. Spagnola', style: 'Closer', gpsScore: 82, hasGPS: true, speeds: [31, 34, 35.5, 36.5, 37, 37.5, 38, 38.5, 38.8, 38.5, 38, 37.5], peakMPH: 38.8, closingMPH: 37.5, efficiency: 88, strideFade: -1.4, groundLossAvg: 14 },
      { name: 'Field Day', post: 4, odds: '8/1', jockey: 'J. Torres', trainer: 'P. Walder', style: 'Stalker', gpsScore: 76, hasGPS: true, speeds: [32, 35, 36.5, 37.5, 38, 38, 37.5, 37, 36.5, 36, 35.5, 35], peakMPH: 38.0, closingMPH: 35.0, efficiency: 90, strideFade: -3.8, groundLossAvg: 7 },
      { name: 'Albie the Cat', post: 5, odds: '10/1', jockey: 'L. Corujo', trainer: 'J. Englehart', style: 'Front Runner', gpsScore: 71, hasGPS: true, speeds: [34, 37, 38.5, 39, 39, 38.5, 37.5, 36.5, 35.5, 34.5, 34, 33.5], peakMPH: 39.0, closingMPH: 33.5, efficiency: 86, strideFade: -6.5, groundLossAvg: 4 },
      { name: 'Weekend Buzz', post: 6, odds: '12/1', jockey: 'E. Rojas', trainer: 'B. Brown', style: 'Closer', gpsScore: 79, hasGPS: true, speeds: [30.5, 33.5, 35, 36, 37, 37.5, 38, 38.5, 38.5, 38.2, 37.8, 37.5], peakMPH: 38.5, closingMPH: 37.5, efficiency: 85, strideFade: -0.8, groundLossAvg: 16 },
      { name: 'Bold Captain', post: 7, odds: '15/1', jockey: 'M. Luzzi', trainer: 'C. Englehart', style: 'Stalker', gpsScore: 68, hasGPS: true, speeds: [31.5, 34.5, 36, 37, 37.5, 37.5, 37, 36.5, 36, 35.5, 35, 34.5], peakMPH: 37.5, closingMPH: 34.5, efficiency: 87, strideFade: -4.1, groundLossAvg: 9 },
      { name: 'Storm Harbor', post: 8, odds: '15/1', jockey: 'R. Diaz', trainer: 'K. McPeek', style: 'Front Runner', gpsScore: 65, hasGPS: true, speeds: [33.5, 36.5, 38, 38.5, 38, 37, 36, 35, 34.5, 34, 33.5, 33], peakMPH: 38.5, closingMPH: 33.0, efficiency: 83, strideFade: -7.2, groundLossAvg: 5 },
      { name: 'Copper Town', post: 9, odds: '20/1', jockey: 'A. Lezcano', trainer: 'D. Fawkes', style: 'Closer', gpsScore: 73, hasGPS: true, speeds: [30, 33, 34.5, 35.5, 36.5, 37, 37.5, 38, 38, 37.8, 37.5, 37], peakMPH: 38.0, closingMPH: 37.0, efficiency: 82, strideFade: -1.0, groundLossAvg: 18 },
      { name: 'Lucky Lodge', post: 10, odds: '20/1', jockey: 'C. Figueroa', trainer: 'L. Rivelli', style: 'Stalker', gpsScore: 62, hasGPS: true, speeds: [31, 34, 35.5, 36.5, 37, 37, 36.5, 36, 35.5, 35, 34.5, 34], peakMPH: 37.0, closingMPH: 34.0, efficiency: 84, strideFade: -4.5, groundLossAvg: 10 },
      { name: 'Midnight Valor', post: 11, odds: '20/1', jockey: 'F. Prat', trainer: 'S. Joseph', style: 'Closer', gpsScore: 70, hasGPS: true, speeds: [30, 33, 34, 35.5, 36.5, 37, 37.5, 37.8, 38, 37.8, 37.5, 37], peakMPH: 38.0, closingMPH: 37.0, efficiency: 81, strideFade: -1.2, groundLossAvg: 19 },
      { name: 'Pirate Flag', post: 12, odds: '30/1', jockey: 'J. Vargas', trainer: 'A. Dutrow', style: 'Front Runner', gpsScore: 58, hasGPS: true, speeds: [33, 36, 37.5, 38, 37.5, 36.5, 35.5, 34.5, 34, 33.5, 33, 32.5], peakMPH: 38.0, closingMPH: 32.5, efficiency: 80, strideFade: -8.1, groundLossAvg: 6 },
      { name: 'Quick Silver', post: 13, odds: '30/1', jockey: 'N. Juarez', trainer: 'T. Amoss', style: 'Stalker', gpsScore: 55, hasGPS: true, speeds: [31, 34, 35, 36, 36.5, 36.5, 36, 35.5, 35, 34.5, 34, 33.5], peakMPH: 36.5, closingMPH: 33.5, efficiency: 79, strideFade: -5.0, groundLossAvg: 11 },
      { name: 'Red Blaze', post: 14, odds: '30/1', jockey: 'K. Carmouche', trainer: 'W. Mott', style: 'Closer', gpsScore: 60, hasGPS: true, speeds: [29.5, 32.5, 34, 35, 36, 36.5, 37, 37.5, 37.5, 37, 36.8, 36.5], peakMPH: 37.5, closingMPH: 36.5, efficiency: 78, strideFade: -1.5, groundLossAvg: 20 },
    ],
    paceAnalysis: {
      frontRunners: 4, stalkers: 5, closers: 5,
      scenario: 'hot',
      label: 'Hot Pace Expected',
      detail: 'Four front-runners (Neoteric, Albie the Cat, Storm Harbor, Pirate Flag) will contest the early lead. This contested pace is likely to tire the speed horses, creating a strong setup for closers and deep stalkers.',
    },
    gpsEdgePicks: [
      {
        name: 'Son of a Slew',
        odds: '6/1',
        headline: 'Best closing speed in a pace meltdown',
        analysis: 'Son of a Slew has the 2nd-highest closing velocity in the field (37.5 mph) and the lowest stride fade (-1.4%). With 4 front-runners battling for the lead, this is exactly the pace scenario where deep closers thrive. His 6/1 morning line doesn\'t account for the pace dynamics that GPS data reveals.',
      },
      {
        name: 'Weekend Buzz',
        odds: '12/1',
        headline: 'Elite late kick at an overlay price',
        analysis: 'Weekend Buzz matches Son of a Slew\'s closing speed (37.5 mph) and has the best stride fade in the field at just -0.8% — meaning he barely slows down in the final furlong. At 12/1, the morning line is based on his wide trips (16m avg ground loss), but in a hot pace with tired leaders, his finishing power could overcome the path inefficiency.',
      },
    ],
  },
  {
    id: 'aqu-r9-0328',
    track: 'AQU', trackName: 'Aqueduct',
    date: '2026-03-28', raceNumber: 9,
    distance: '6F', distanceFurlongs: 6, surface: 'Dirt',
    type: 'ALW', purse: '$82,000', fieldSize: 12,
    gpsCoverage: 100,
    horses: [
      { name: 'Dynamic Edge', post: 1, odds: '5/2', jockey: 'I. Ortiz Jr.', trainer: 'C. Brown', style: 'Stalker', gpsScore: 91, hasGPS: true, speeds: [34, 37, 38.5, 39.5, 40, 39.5, 39, 38.5, 38, 37.5], peakMPH: 40.0, closingMPH: 37.5, efficiency: 95, strideFade: -2.8, groundLossAvg: 6 },
      { name: 'Rail Runner', post: 2, odds: '4/1', jockey: 'J. Castellano', trainer: 'T. Pletcher', style: 'Front Runner', gpsScore: 87, hasGPS: true, speeds: [35, 38, 39.5, 40.2, 40, 39.5, 38.5, 37.5, 36.5, 36], peakMPH: 40.2, closingMPH: 36.0, efficiency: 97, strideFade: -4.5, groundLossAvg: 3 },
      { name: 'Vasilika', post: 3, odds: '7/2', jockey: 'L. Saez', trainer: 'B. Cox', style: 'Closer', gpsScore: 84, hasGPS: true, speeds: [32, 35, 36.5, 37.5, 38, 38.5, 39, 39.5, 39, 38.8], peakMPH: 39.5, closingMPH: 38.8, efficiency: 86, strideFade: -0.5, groundLossAvg: 15 },
      { name: 'War Command', post: 4, odds: '6/1', jockey: 'T. Gaffalione', trainer: 'W. Mott', style: 'Stalker', gpsScore: 80, hasGPS: true, speeds: [33, 36, 37.5, 38.5, 39, 39, 38.5, 38, 37.5, 37], peakMPH: 39.0, closingMPH: 37.0, efficiency: 92, strideFade: -3.0, groundLossAvg: 7 },
      { name: 'Speed Merchant', post: 5, odds: '8/1', jockey: 'M. Franco', trainer: 'R. Rodriguez', style: 'Front Runner', gpsScore: 75, hasGPS: true, speeds: [35.5, 38.5, 40, 40.5, 40, 39, 37.5, 36, 35, 34.5], peakMPH: 40.5, closingMPH: 34.5, efficiency: 89, strideFade: -7.8, groundLossAvg: 4 },
      { name: 'Copper Peak', post: 6, odds: '10/1', jockey: 'J. Rosario', trainer: 'S. Asmussen', style: 'Closer', gpsScore: 78, hasGPS: true, speeds: [31, 34, 35.5, 37, 38, 38.5, 39, 39.5, 39.2, 39], peakMPH: 39.5, closingMPH: 39.0, efficiency: 83, strideFade: -0.3, groundLossAvg: 17 },
      { name: 'Fleet Admiral', post: 7, odds: '12/1', jockey: 'D. Davis', trainer: 'L. Rice', style: 'Stalker', gpsScore: 72, hasGPS: true, speeds: [33, 35.5, 37, 38, 38.5, 38.5, 38, 37.5, 37, 36.5], peakMPH: 38.5, closingMPH: 36.5, efficiency: 90, strideFade: -3.5, groundLossAvg: 8 },
      { name: 'Night Patrol', post: 8, odds: '15/1', jockey: 'J. Lezcano', trainer: 'J. Terranova', style: 'Closer', gpsScore: 70, hasGPS: true, speeds: [30.5, 33.5, 35, 36.5, 37.5, 38, 38.5, 39, 38.8, 38.5], peakMPH: 39.0, closingMPH: 38.5, efficiency: 80, strideFade: -0.8, groundLossAvg: 19 },
      { name: 'Blazing Trail', post: 9, odds: '15/1', jockey: 'R. Silvera', trainer: 'M. Nevin', style: 'Front Runner', gpsScore: 66, hasGPS: true, speeds: [34, 37, 38.5, 39, 38.5, 37.5, 36, 35, 34.5, 34], peakMPH: 39.0, closingMPH: 34.0, efficiency: 85, strideFade: -6.8, groundLossAvg: 5 },
      { name: 'True North', post: 10, odds: '20/1', jockey: 'E. Cancel', trainer: 'G. Contessa', style: 'Stalker', gpsScore: 63, hasGPS: true, speeds: [32, 35, 36.5, 37.5, 38, 38, 37.5, 37, 36.5, 36], peakMPH: 38.0, closingMPH: 36.0, efficiency: 88, strideFade: -4.0, groundLossAvg: 9 },
      { name: 'Quiet Storm', post: 11, odds: '20/1', jockey: 'H. Harkie', trainer: 'D. Donk', style: 'Closer', gpsScore: 61, hasGPS: true, speeds: [30, 33, 34.5, 36, 37, 37.5, 38, 38.5, 38.2, 38], peakMPH: 38.5, closingMPH: 38.0, efficiency: 79, strideFade: -1.0, groundLossAvg: 21 },
      { name: 'Silver Lining', post: 12, odds: '30/1', jockey: 'B. Hernandez', trainer: 'J. Ryerson', style: 'Stalker', gpsScore: 55, hasGPS: true, speeds: [31, 34, 35.5, 36.5, 37, 37, 36.5, 36, 35.5, 35], peakMPH: 37.0, closingMPH: 35.0, efficiency: 82, strideFade: -4.5, groundLossAvg: 12 },
    ],
    paceAnalysis: {
      frontRunners: 3, stalkers: 5, closers: 4,
      scenario: 'hot',
      label: 'Contested Pace',
      detail: 'Three speed horses (Rail Runner, Speed Merchant, Blazing Trail) will duel for the lead in a sprint. This speed duel benefits horses positioned just off the pace who can pounce when the leaders tire.',
    },
    gpsEdgePicks: [
      {
        name: 'Rail Runner',
        odds: '4/1',
        headline: 'Best path efficiency in the field',
        analysis: 'Rail Runner has a 97% ground efficiency rating — the highest in the race — meaning he consistently runs the shortest possible path near the rail. In a 6-furlong sprint, saving 3m per race translates to roughly 0.2 seconds. Combined with the highest peak speed (40.2 mph), he could clear the field early and hold on despite the pace pressure.',
      },
      {
        name: 'Copper Peak',
        odds: '10/1',
        headline: 'Invisible closer with the strongest finish',
        analysis: 'Copper Peak has a closing speed of 39.0 mph and virtually zero stride fade (-0.3%) — he literally doesn\'t slow down. At 10/1, the line undervalues him because his official finishes look mediocre. But GPS reveals that his 17m average ground loss (running 3-wide every start) masks his true ability. In a pace meltdown, he fires the strongest late kick in the field.',
      },
    ],
  },
  {
    id: 'tam-r5-0327',
    track: 'TAM', trackName: 'Tampa Bay Downs',
    date: '2026-03-27', raceNumber: 5,
    distance: '1 1/16M', distanceFurlongs: 8.5, surface: 'Turf',
    type: 'MSW', purse: '$30,000', fieldSize: 14,
    gpsCoverage: 93,
    horses: [
      { name: 'Mystic Isle', post: 1, odds: '8/5', jockey: 'T. Gaffalione', trainer: 'M. Maker', style: 'Stalker', gpsScore: 86, hasGPS: true, speeds: [32, 35, 36.5, 37.5, 38, 38.2, 38, 37.5, 37, 36.5, 36, 35.5], peakMPH: 38.2, closingMPH: 35.5, efficiency: 93, strideFade: -3.0, groundLossAvg: 5 },
      { name: 'Ocean Voyage', post: 2, odds: '3/1', jockey: 'J. Castellano', trainer: 'C. McGaughey', style: 'Closer', gpsScore: 83, hasGPS: true, speeds: [30.5, 33.5, 35, 36, 37, 37.5, 38, 38.5, 38.5, 38, 37.8, 37.5], peakMPH: 38.5, closingMPH: 37.5, efficiency: 87, strideFade: -1.2, groundLossAvg: 13 },
      { name: 'Highland Storm', post: 3, odds: '6/1', jockey: 'L. Saez', trainer: 'T. Pletcher', style: 'Front Runner', gpsScore: 80, hasGPS: true, speeds: [33.5, 36.5, 38, 38.5, 38.5, 38, 37, 36, 35.5, 35, 34.5, 34], peakMPH: 38.5, closingMPH: 34.0, efficiency: 91, strideFade: -5.5, groundLossAvg: 4 },
      { name: 'Golden Prairie', post: 4, odds: '8/1', jockey: 'I. Ortiz Jr.', trainer: 'B. Cox', style: 'Stalker', gpsScore: 77, hasGPS: true, speeds: [31.5, 34.5, 36, 37, 37.5, 38, 37.8, 37.5, 37, 36.5, 36, 35.5], peakMPH: 38.0, closingMPH: 35.5, efficiency: 89, strideFade: -3.2, groundLossAvg: 8 },
      { name: 'Coastal Breeze', post: 5, odds: '10/1', jockey: 'D. Davis', trainer: 'L. Rice', style: 'Closer', gpsScore: 81, hasGPS: true, speeds: [30, 33, 34.5, 35.5, 36.5, 37, 37.5, 38, 38.2, 38, 37.8, 37.5], peakMPH: 38.2, closingMPH: 37.5, efficiency: 84, strideFade: -0.6, groundLossAvg: 16 },
      { name: 'Dancewithmyfather', post: 6, odds: '12/1', jockey: 'R. Silvera', trainer: 'P. Walder', style: null, gpsScore: null, hasGPS: false, speeds: [], peakMPH: null, closingMPH: null, efficiency: null, strideFade: null, groundLossAvg: null },
      { name: 'Autumn Rally', post: 7, odds: '15/1', jockey: 'J. Torres', trainer: 'S. Joseph', style: 'Front Runner', gpsScore: 64, hasGPS: true, speeds: [33, 36, 37.5, 38, 37.5, 36.5, 35.5, 34.5, 34, 33.5, 33, 32.5], peakMPH: 38.0, closingMPH: 32.5, efficiency: 82, strideFade: -7.5, groundLossAvg: 5 },
      { name: 'Silver Summit', post: 8, odds: '15/1', jockey: 'M. Franco', trainer: 'W. Mott', style: 'Stalker', gpsScore: 69, hasGPS: true, speeds: [31, 34, 35.5, 36.5, 37, 37, 36.5, 36, 35.5, 35, 34.5, 34], peakMPH: 37.0, closingMPH: 34.0, efficiency: 86, strideFade: -4.2, groundLossAvg: 10 },
      { name: 'Dawn Patrol', post: 9, odds: '20/1', jockey: 'A. Castillo', trainer: 'R. Rodriguez', style: 'Closer', gpsScore: 66, hasGPS: true, speeds: [29.5, 32.5, 34, 35, 36, 36.5, 37, 37.5, 37.5, 37, 36.8, 36.5], peakMPH: 37.5, closingMPH: 36.5, efficiency: 80, strideFade: -1.3, groundLossAvg: 18 },
      { name: 'Royal Harbor', post: 10, odds: '20/1', jockey: 'N. Juarez', trainer: 'T. Amoss', style: 'Stalker', gpsScore: 63, hasGPS: true, speeds: [31, 34, 35.5, 36.5, 37, 37, 36.5, 36, 35.5, 35, 34.5, 34], peakMPH: 37.0, closingMPH: 34.0, efficiency: 85, strideFade: -4.0, groundLossAvg: 11 },
      { name: 'Celtic Wind', post: 11, odds: '20/1', jockey: 'E. Cancel', trainer: 'G. Contessa', style: 'Front Runner', gpsScore: 60, hasGPS: true, speeds: [33, 36, 37, 37.5, 37, 36, 35, 34, 33.5, 33, 32.5, 32], peakMPH: 37.5, closingMPH: 32.0, efficiency: 81, strideFade: -8.0, groundLossAvg: 4 },
      { name: 'Iron Will', post: 12, odds: '30/1', jockey: 'H. Harkie', trainer: 'D. Donk', style: 'Stalker', gpsScore: 56, hasGPS: true, speeds: [31, 33.5, 35, 36, 36.5, 36.5, 36, 35.5, 35, 34.5, 34, 33.5], peakMPH: 36.5, closingMPH: 33.5, efficiency: 80, strideFade: -4.8, groundLossAvg: 12 },
      { name: 'Frost King', post: 13, odds: '30/1', jockey: 'K. Carmouche', trainer: 'J. Terranova', style: 'Closer', gpsScore: 58, hasGPS: true, speeds: [29, 32, 33.5, 35, 36, 36.5, 37, 37.5, 37.2, 37, 36.8, 36.5], peakMPH: 37.5, closingMPH: 36.5, efficiency: 77, strideFade: -1.5, groundLossAvg: 22 },
      { name: 'Blue Monarch', post: 14, odds: '30/1', jockey: 'B. Hernandez', trainer: 'J. Ryerson', style: 'Closer', gpsScore: 54, hasGPS: true, speeds: [29, 31.5, 33, 34.5, 35.5, 36, 36.5, 37, 37, 36.8, 36.5, 36], peakMPH: 37.0, closingMPH: 36.0, efficiency: 76, strideFade: -1.8, groundLossAvg: 23 },
    ],
    paceAnalysis: {
      frontRunners: 3, stalkers: 5, closers: 5,
      scenario: 'honest',
      label: 'Honest Pace',
      detail: 'Three front-runners (Highland Storm, Autumn Rally, Celtic Wind) will push the pace on turf, but none are dominant enough to get clear. The honest fractions should let the best horse prevail — look for tactical horses with both speed and stamina.',
    },
    gpsEdgePicks: [
      {
        name: 'Coastal Breeze',
        odds: '10/1',
        headline: 'Best stride durability on the turf',
        analysis: 'Coastal Breeze has a stride fade of just -0.6% — she barely decelerates over the final furlong on turf. At 1 1/16 miles, stamina is everything. While the favorite Mystic Isle fades 3% in the stretch, Coastal Breeze keeps accelerating. At 10/1, she is the best value play if the pace is anything faster than slow.',
      },
      {
        name: 'Ocean Voyage',
        odds: '3/1',
        headline: 'Class closer with proven GPS numbers',
        analysis: 'Ocean Voyage has the highest closing speed in the field (37.5 mph) and GPS history showing consistent late runs. The only knock is ground loss (13m avg from running wide), but on turf the outside path often has better footing. He\'s the most likely winner, though the price is short.',
      },
    ],
  },
];

export const styleColors = {
  'Front Runner': '#52B788',
  'Stalker': '#E8B86D',
  'Closer': '#9B72CF',
};

export const scenarioColors = {
  hot: '#C2653A',
  contested: '#E8B86D',
  honest: '#52B788',
  soft: '#5B8DEF',
};
