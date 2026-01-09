// Mock data generation for Bangkok Urban Problem Priority Recommender

import { Ticket, ClimateContext, SensitivePlace } from '@/types/ticket';

// Bangkok districts with mock CVI factors
export const BANGKOK_DISTRICTS = [
  { name: 'Watthana', populationDensity: 0.8, economicVulnerability: 0.3, sensitivePlaces: 12 },
  { name: 'Chatuchak', populationDensity: 0.7, economicVulnerability: 0.4, sensitivePlaces: 15 },
  { name: 'Bang Rak', populationDensity: 0.9, economicVulnerability: 0.35, sensitivePlaces: 8 },
  { name: 'Khlong Toei', populationDensity: 0.85, economicVulnerability: 0.7, sensitivePlaces: 10 },
  { name: 'Phaya Thai', populationDensity: 0.75, economicVulnerability: 0.4, sensitivePlaces: 18 },
  { name: 'Din Daeng', populationDensity: 0.8, economicVulnerability: 0.55, sensitivePlaces: 9 },
  { name: 'Huai Khwang', populationDensity: 0.7, economicVulnerability: 0.45, sensitivePlaces: 11 },
  { name: 'Ratchathewi', populationDensity: 0.85, economicVulnerability: 0.4, sensitivePlaces: 14 },
  { name: 'Pathum Wan', populationDensity: 0.6, economicVulnerability: 0.25, sensitivePlaces: 20 },
  { name: 'Bang Kapi', populationDensity: 0.75, economicVulnerability: 0.5, sensitivePlaces: 16 },
  { name: 'Lat Phrao', populationDensity: 0.65, economicVulnerability: 0.45, sensitivePlaces: 13 },
  { name: 'Suan Luang', populationDensity: 0.55, economicVulnerability: 0.5, sensitivePlaces: 8 },
  { name: 'Prawet', populationDensity: 0.5, economicVulnerability: 0.6, sensitivePlaces: 7 },
  { name: 'Bang Na', populationDensity: 0.6, economicVulnerability: 0.55, sensitivePlaces: 9 },
  { name: 'Yan Nawa', populationDensity: 0.7, economicVulnerability: 0.5, sensitivePlaces: 6 },
];

export const ISSUE_TYPES = [
  'flooding',
  'drainage',
  'garbage',
  'illegal_dumping',
  'electricity_outage',
  'road_damage',
  'pothole',
  'noise',
  'construction',
  'water_leak',
  'sewage',
  'streetlight',
  'traffic_signal',
  'sidewalk_damage',
  'tree_hazard',
  'air_pollution',
  'pest_control',
  'stray_animals',
  'public_safety',
  'graffiti',
];

export const SUBDISTRICTS: Record<string, string[]> = {
  'Watthana': ['Khlong Toei Nuea', 'Khlong Tan Nuea', 'Phra Khanong Nuea'],
  'Chatuchak': ['Chatuchak', 'Lat Yao', 'Sena Nikhom', 'Chan Kasem', 'Chomphon'],
  'Bang Rak': ['Silom', 'Suriyawong', 'Bang Rak', 'Si Phraya', 'Maha Phruettharam'],
  'Khlong Toei': ['Khlong Toei', 'Khlong Tan', 'Phra Khanong'],
  'Phaya Thai': ['Phaya Thai', 'Sam Sen Nai'],
  'Din Daeng': ['Din Daeng', 'Ratchadaphisek'],
  'Huai Khwang': ['Huai Khwang', 'Bang Kapi'],
  'Ratchathewi': ['Ratchathewi', 'Thanon Phaya Thai', 'Thanon Phetchaburi', 'Makkasan'],
  'Pathum Wan': ['Rong Mueang', 'Lumphini', 'Pathum Wan', 'Wang Mai'],
  'Bang Kapi': ['Khlong Chan', 'Hua Mak', 'Bang Kapi'],
  'Lat Phrao': ['Lat Phrao', 'Chom Phon'],
  'Suan Luang': ['Suan Luang', 'On Nut'],
  'Prawet': ['Prawet', 'Nong Bon', 'Dok Mai'],
  'Bang Na': ['Bang Na', 'Bang Na Nuea', 'Bang Na Tai'],
  'Yan Nawa': ['Chong Nonsi', 'Bang Phong Phang', 'Yan Nawa'],
};

export const ORGANIZATIONS = [
  'Bangkok Metropolitan Administration',
  'District Office Chatuchak',
  'District Office Watthana',
  'District Office Bang Rak',
  'District Office Khlong Toei',
  'District Office Phaya Thai',
  'Metropolitan Electricity Authority',
  'Metropolitan Waterworks Authority',
  'Department of Drainage and Sewerage',
  'Traffic and Transportation Department',
  'Public Health Department',
  'Environment Department',
];

// Mock sensitive places in Bangkok
export const SENSITIVE_PLACES: SensitivePlace[] = [
  { name: 'Sukhumvit International School', type: 'school', coords: [13.7380, 100.5614], district: 'Watthana' },
  { name: 'Bumrungrad Hospital', type: 'hospital', coords: [13.7478, 100.5506], district: 'Watthana' },
  { name: 'Chulalongkorn Hospital', type: 'hospital', coords: [13.7308, 100.5345], district: 'Pathum Wan' },
  { name: 'Triam Udom Suksa School', type: 'school', coords: [13.7341, 100.5284], district: 'Pathum Wan' },
  { name: 'Chatuchak Nursing Home', type: 'nursing_home', coords: [13.8156, 100.5536], district: 'Chatuchak' },
  { name: 'Wat Pathum Wanaram', type: 'temple', coords: [13.7461, 100.5398], district: 'Pathum Wan' },
  { name: 'Lumpini Park', type: 'park', coords: [13.7319, 100.5412], district: 'Pathum Wan' },
  { name: 'Bangkok Christian Hospital', type: 'hospital', coords: [13.7254, 100.5178], district: 'Bang Rak' },
  { name: 'Assumption School', type: 'school', coords: [13.7236, 100.5198], district: 'Bang Rak' },
  { name: 'Queen Sirikit Park', type: 'park', coords: [13.7214, 100.5612], district: 'Khlong Toei' },
];

// Generate mock climate context for next 14 days
export function generateClimateContext(): ClimateContext[] {
  const contexts: ClimateContext[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    
    contexts.push({
      date: date.toISOString().split('T')[0],
      rainForecastIndex: Math.random() * 0.8 + (i < 3 ? 0.2 : 0), // Higher rain in next 3 days
      pm25Index: Math.random() * 0.6 + 0.2,
      heatIndex: Math.random() * 0.5 + 0.3,
    });
  }
  
  return contexts;
}

// Generate a large dataset of mock tickets
export function generateMockTickets(count: number = 5000): Ticket[] {
  const tickets: Ticket[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const district = BANGKOK_DISTRICTS[Math.floor(Math.random() * BANGKOK_DISTRICTS.length)];
    const subdistricts = SUBDISTRICTS[district.name] || ['Unknown'];
    const subdistrict = subdistricts[Math.floor(Math.random() * subdistricts.length)];
    
    // Generate 1-3 types per ticket
    const typeCount = Math.floor(Math.random() * 3) + 1;
    const types: string[] = [];
    for (let t = 0; t < typeCount; t++) {
      const type = ISSUE_TYPES[Math.floor(Math.random() * ISSUE_TYPES.length)];
      if (!types.includes(type)) types.push(type);
    }
    
    // Random coords within Bangkok bounds
    const lat = 13.65 + Math.random() * 0.25;
    const lon = 100.45 + Math.random() * 0.2;
    
    // Random timestamp within last 60 days
    const daysAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
    
    // Last activity 0-7 days after creation
    const activityDelay = Math.min(daysAgo, Math.floor(Math.random() * 7));
    const lastActivity = new Date(timestamp);
    lastActivity.setDate(lastActivity.getDate() + activityDelay);
    
    // State distribution: 40% pending, 30% in_progress, 25% resolved, 5% closed
    const stateRand = Math.random();
    let state: Ticket['state'];
    if (stateRand < 0.4) state = 'pending';
    else if (stateRand < 0.7) state = 'in_progress';
    else if (stateRand < 0.95) state = 'resolved';
    else state = 'closed';
    
    // Generate realistic comment based on types
    const comment = generateComment(types);
    
    tickets.push({
      ticket_id: `TKT-${String(i + 1).padStart(5, '0')}`,
      type: types,
      organization: ORGANIZATIONS[Math.floor(Math.random() * ORGANIZATIONS.length)],
      comment,
      photo: Math.random() > 0.4 ? `https://picsum.photos/seed/${i}/400/300` : null,
      photo_after: state === 'resolved' && Math.random() > 0.5 ? `https://picsum.photos/seed/${i + 10000}/400/300` : null,
      coords: [lat, lon],
      address: `${Math.floor(Math.random() * 500) + 1} ${district.name} Road`,
      subdistrict,
      district: district.name,
      province: 'Bangkok',
      timestamp: timestamp.toISOString(),
      state,
      star: Math.floor(Math.random() * 5) + 1,
      count_reopen: Math.random() > 0.8 ? Math.floor(Math.random() * 4) + 1 : 0,
      last_activity: lastActivity.toISOString(),
    });
  }
  
  return tickets;
}

function generateComment(types: string[]): string {
  const templates: Record<string, string[]> = {
    flooding: [
      'Severe flooding after heavy rain. Water level reaching {depth}cm.',
      'Street completely flooded. Vehicles cannot pass through.',
      'Flood water entering nearby shops and homes.',
    ],
    drainage: [
      'Drainage system blocked with debris.',
      'Storm drain overflowing onto the street.',
      'Drainage cover missing, creating hazard.',
    ],
    garbage: [
      'Large pile of garbage not collected for days.',
      'Garbage bins overflowing, attracting pests.',
      'Uncollected waste causing odor problems.',
    ],
    illegal_dumping: [
      'Illegal dumping of construction waste.',
      'Someone dumped furniture and appliances illegally.',
      'Hazardous materials dumped near residential area.',
    ],
    electricity_outage: [
      'Power outage affecting multiple buildings.',
      'Electricity cut off suddenly. No prior notice.',
      'Intermittent power failures causing equipment damage.',
    ],
    road_damage: [
      'Road surface badly damaged after recent construction.',
      'Large cracks in the road getting worse.',
      'Road subsidence creating dangerous conditions.',
    ],
    pothole: [
      'Large pothole causing traffic hazards.',
      'Multiple potholes on this stretch of road.',
      'Deep pothole filled with water, hard to see.',
    ],
    noise: [
      'Excessive noise from nearby establishment.',
      'Construction noise starting early morning.',
      'Loud music playing late at night.',
    ],
    construction: [
      'Construction site not following safety regulations.',
      'Construction debris falling onto sidewalk.',
      'Construction blocking pedestrian pathway.',
    ],
    water_leak: [
      'Water main leaking, wasting water.',
      'Underground pipe burst flooding street.',
      'Water meter leaking continuously.',
    ],
    sewage: [
      'Sewage overflow onto public road.',
      'Strong sewage smell from drain.',
      'Sewage backing up into building.',
    ],
    streetlight: [
      'Streetlight not working, area very dark.',
      'Multiple streetlights broken on this street.',
      'Streetlight flickering, may fall soon.',
    ],
    traffic_signal: [
      'Traffic light not functioning properly.',
      'Green light too short, causing congestion.',
      'Pedestrian signal not working.',
    ],
    sidewalk_damage: [
      'Sidewalk tiles broken and uneven.',
      'Tree roots pushing up sidewalk.',
      'Sidewalk flooded after rain.',
    ],
    tree_hazard: [
      'Dead tree branches about to fall.',
      'Large tree leaning dangerously.',
      'Tree roots damaging nearby structures.',
    ],
    air_pollution: [
      'Heavy smoke from nearby factory.',
      'Burning smell in the area.',
      'Dust from construction affecting air quality.',
    ],
    pest_control: [
      'Rat infestation in the area.',
      'Mosquito breeding ground needs treatment.',
      'Cockroach problem in public space.',
    ],
    stray_animals: [
      'Aggressive stray dogs in the area.',
      'Stray cats causing nuisance.',
      'Pack of stray dogs blocking pathway.',
    ],
    public_safety: [
      'Unsafe area needs better lighting.',
      'Criminal activity reported in this location.',
      'Abandoned building attracting suspicious activity.',
    ],
    graffiti: [
      'Vandalism on public property.',
      'Offensive graffiti on wall.',
      'Gang-related markings appearing.',
    ],
  };
  
  const type = types[0];
  const typeTemplates = templates[type] || ['Issue reported in this area.'];
  const template = typeTemplates[Math.floor(Math.random() * typeTemplates.length)];
  
  // Replace placeholders
  return template.replace('{depth}', String(Math.floor(Math.random() * 40) + 10));
}
