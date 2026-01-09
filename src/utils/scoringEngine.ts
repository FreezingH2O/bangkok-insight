// AI Scoring Engine for Urban Problem Priority Recommender
// Computes priority scores, risk levels, environmental impact, and recommendations

import { 
  Ticket, 
  ProcessedTicket, 
  EnvironmentalImpact, 
  ScoreBreakdown,
  ClimateContext,
  SensitivePlace,
  DistrictStats 
} from '@/types/ticket';
import { BANGKOK_DISTRICTS, SENSITIVE_PLACES, generateClimateContext } from '@/data/mockData';

// Severity weights by issue type
const SEVERITY_WEIGHTS: Record<string, number> = {
  flooding: 0.9,
  electricity_outage: 0.85,
  sewage: 0.85,
  public_safety: 0.9,
  road_damage: 0.7,
  pothole: 0.65,
  water_leak: 0.6,
  tree_hazard: 0.75,
  air_pollution: 0.8,
  garbage: 0.5,
  illegal_dumping: 0.6,
  drainage: 0.7,
  noise: 0.4,
  construction: 0.45,
  streetlight: 0.55,
  traffic_signal: 0.65,
  sidewalk_damage: 0.5,
  pest_control: 0.55,
  stray_animals: 0.5,
  graffiti: 0.2,
};

// Keywords that increase severity
const SEVERITY_KEYWORDS = {
  high: ['severe', 'emergency', 'dangerous', 'hazard', 'urgent', 'critical', 'blocked', 'collapsed'],
  medium: ['broken', 'damage', 'overflow', 'leak', 'missing', 'falling'],
  amplifiers: ['children', 'elderly', 'school', 'hospital', 'multiple', 'large', 'deep'],
};

// Environmental impact classification rules
const ENV_IMPACT_RULES: Record<EnvironmentalImpact, { types: string[]; keywords: string[] }> = {
  'Water Pollution': {
    types: ['flooding', 'sewage', 'water_leak', 'drainage', 'illegal_dumping'],
    keywords: ['contaminated', 'sewage', 'chemical', 'oil', 'spill', 'runoff'],
  },
  'Air Pollution': {
    types: ['air_pollution', 'garbage', 'illegal_dumping'],
    keywords: ['smoke', 'burning', 'dust', 'fumes', 'odor', 'smell'],
  },
  'Waste and Hazardous Materials': {
    types: ['garbage', 'illegal_dumping', 'sewage'],
    keywords: ['hazardous', 'toxic', 'chemical', 'waste', 'dump', 'garbage', 'trash'],
  },
  'Noise Pollution': {
    types: ['noise', 'construction'],
    keywords: ['loud', 'noise', 'sound', 'music', 'horn', 'machinery'],
  },
  'Green Space Degradation': {
    types: ['tree_hazard', 'illegal_dumping', 'graffiti'],
    keywords: ['tree', 'park', 'garden', 'green', 'vegetation', 'plant'],
  },
};

// Action recommendation templates
const ACTION_TEMPLATES: Record<string, string[]> = {
  flooding: [
    'Deploy emergency drainage pumps and clear blocked drains',
    'Issue flood warning to affected residents and businesses',
    'Coordinate with traffic department for road diversions',
  ],
  drainage: [
    'Schedule immediate drain inspection and cleaning',
    'Clear debris and restore normal water flow',
    'Install temporary drainage covers if missing',
  ],
  garbage: [
    'Increase garbage collection frequency in affected area',
    'Deploy additional waste bins and notify community',
    'Coordinate with pest control if infestation present',
  ],
  electricity_outage: [
    'Dispatch emergency repair crew immediately',
    'Notify affected residents of estimated restoration time',
    'Prioritize restoration for areas with elderly or medical needs',
  ],
  sewage: [
    'Deploy sewage emergency response team',
    'Issue health advisory for affected area',
    'Coordinate disinfection after repair',
  ],
  default: [
    'Assess situation and dispatch appropriate response team',
    'Document issue and update tracking system',
    'Notify relevant department for resolution',
  ],
};

// Climate context (mock data for demo)
let climateContext: ClimateContext[] = generateClimateContext();

export function getClimateContext(): ClimateContext[] {
  return climateContext;
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(coord1: [number, number], coord2: [number, number]): number {
  const R = 6371; // Earth's radius in km
  const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
  const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Find nearest sensitive place
function findNearestSensitivePlace(coords: [number, number]): { place: SensitivePlace | null; distance: number } {
  let nearest: SensitivePlace | null = null;
  let minDistance = Infinity;
  
  for (const place of SENSITIVE_PLACES) {
    const distance = calculateDistance(coords, place.coords);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = place;
    }
  }
  
  return { place: nearest, distance: minDistance };
}

// Calculate severity score (0-1)
function calculateSeverity(ticket: Ticket): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0;
  
  // Base score from issue types
  const typeScores = ticket.type.map(t => SEVERITY_WEIGHTS[t] || 0.5);
  score = Math.max(...typeScores);
  factors.push(`Issue type: ${ticket.type.join(', ')}`);
  
  // Keyword analysis
  const comment = ticket.comment.toLowerCase();
  
  for (const keyword of SEVERITY_KEYWORDS.high) {
    if (comment.includes(keyword)) {
      score = Math.min(1, score + 0.15);
      factors.push(`High severity keyword: "${keyword}"`);
      break;
    }
  }
  
  for (const keyword of SEVERITY_KEYWORDS.medium) {
    if (comment.includes(keyword)) {
      score = Math.min(1, score + 0.08);
      factors.push(`Medium severity keyword: "${keyword}"`);
      break;
    }
  }
  
  for (const keyword of SEVERITY_KEYWORDS.amplifiers) {
    if (comment.includes(keyword)) {
      score = Math.min(1, score * 1.1);
      factors.push(`Amplifier: "${keyword}"`);
    }
  }
  
  // Reopen count increases severity
  if (ticket.count_reopen > 0) {
    score = Math.min(1, score + ticket.count_reopen * 0.05);
    factors.push(`Reopened ${ticket.count_reopen} times`);
  }
  
  return { score: Math.min(1, score), factors };
}

// Calculate urgency score (0-1)
function calculateUrgency(ticket: Ticket): { score: number; factors: string[] } {
  const factors: string[] = [];
  let score = 0.5;
  
  const now = new Date();
  const created = new Date(ticket.timestamp);
  const lastActivity = new Date(ticket.last_activity);
  
  const daysSinceCreated = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
  
  // Older unresolved tickets are more urgent
  if (ticket.state === 'pending' || ticket.state === 'in_progress') {
    if (daysSinceCreated > 14) {
      score += 0.3;
      factors.push(`Pending for ${Math.floor(daysSinceCreated)} days`);
    } else if (daysSinceCreated > 7) {
      score += 0.2;
      factors.push(`Pending for ${Math.floor(daysSinceCreated)} days`);
    } else if (daysSinceCreated > 3) {
      score += 0.1;
      factors.push(`Pending for ${Math.floor(daysSinceCreated)} days`);
    }
  }
  
  // Stale tickets (no recent activity)
  if (daysSinceActivity > 5 && ticket.state !== 'resolved') {
    score += 0.15;
    factors.push(`No activity for ${Math.floor(daysSinceActivity)} days`);
  }
  
  // Low star rating indicates citizen frustration
  if (ticket.star <= 2) {
    score += 0.15;
    factors.push(`Low satisfaction rating: ${ticket.star} stars`);
  }
  
  // High reopen count indicates recurring issues
  if (ticket.count_reopen >= 2) {
    score += 0.2;
    factors.push(`Reopened ${ticket.count_reopen} times`);
  }
  
  return { score: Math.min(1, score), factors };
}

// Calculate location risk score (0-1)
function calculateLocationRisk(ticket: Ticket): { score: number; factors: string[]; nearSensitivePlace: { isNear: boolean; placeType: string; distance: number } } {
  const factors: string[] = [];
  let score = 0.3;
  
  // Check proximity to sensitive places
  const { place, distance } = findNearestSensitivePlace(ticket.coords);
  
  const nearSensitivePlace = {
    isNear: distance < 0.5,
    placeType: place?.type || 'none',
    distance: Math.round(distance * 1000), // Convert to meters
  };
  
  if (distance < 0.2) { // Within 200m
    score += 0.4;
    factors.push(`Very close to ${place?.name} (${Math.round(distance * 1000)}m)`);
  } else if (distance < 0.5) { // Within 500m
    score += 0.25;
    factors.push(`Near ${place?.name} (${Math.round(distance * 1000)}m)`);
  } else if (distance < 1) { // Within 1km
    score += 0.1;
    factors.push(`Within 1km of ${place?.name}`);
  }
  
  // District vulnerability
  const districtData = BANGKOK_DISTRICTS.find(d => d.name === ticket.district);
  if (districtData) {
    const vulnerabilityBoost = districtData.economicVulnerability * 0.2;
    score += vulnerabilityBoost;
    if (districtData.economicVulnerability > 0.5) {
      factors.push(`High vulnerability district`);
    }
  }
  
  return { score: Math.min(1, score), factors, nearSensitivePlace };
}

// Calculate frequency score based on similar issues in area (0-1)
function calculateFrequency(ticket: Ticket, allTickets: Ticket[]): { score: number; factors: string[] } {
  const factors: string[] = [];
  
  // Count similar tickets in same district within last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const similarTickets = allTickets.filter(t => 
    t.district === ticket.district &&
    t.type.some(type => ticket.type.includes(type)) &&
    new Date(t.timestamp) > thirtyDaysAgo &&
    t.ticket_id !== ticket.ticket_id
  );
  
  const count = similarTickets.length;
  let score = 0;
  
  if (count > 20) {
    score = 0.9;
    factors.push(`High frequency: ${count} similar issues in district`);
  } else if (count > 10) {
    score = 0.7;
    factors.push(`Moderate frequency: ${count} similar issues`);
  } else if (count > 5) {
    score = 0.5;
    factors.push(`Some similar issues: ${count} in district`);
  } else if (count > 0) {
    score = 0.3;
    factors.push(`Few similar issues: ${count} in district`);
  } else {
    score = 0.1;
    factors.push(`Isolated incident`);
  }
  
  return { score, factors };
}

// Calculate disaster risk score (0-1)
function calculateDisasterRisk(ticket: Ticket): { score: number; reason: string } {
  const today = climateContext[0];
  let score = 0;
  const reasons: string[] = [];
  
  // Heavy rain + flooding/drainage
  if (today.rainForecastIndex > 0.6 && ticket.type.some(t => ['flooding', 'drainage'].includes(t))) {
    score += 0.4;
    reasons.push('Heavy rain forecast with flood risk');
  }
  
  // High PM2.5 + near school
  const { place } = findNearestSensitivePlace(ticket.coords);
  if (today.pm25Index > 0.7 && place?.type === 'school') {
    score += 0.3;
    reasons.push('High PM2.5 near school');
  }
  
  // Extreme heat + electricity outage
  if (today.heatIndex > 0.7 && ticket.type.includes('electricity_outage')) {
    score += 0.35;
    reasons.push('Heat emergency without power');
  }
  
  return { score: Math.min(1, score), reason: reasons.join('; ') || 'No active warnings' };
}

// Calculate climate boost (0-1)
function calculateClimateBoost(ticket: Ticket): { boost: number; reason: string } {
  const today = climateContext[0];
  let boost = 0;
  const reasons: string[] = [];
  
  // Rain-sensitive issues
  if (today.rainForecastIndex > 0.5) {
    if (ticket.type.some(t => ['flooding', 'drainage', 'road_damage', 'pothole'].includes(t))) {
      boost += today.rainForecastIndex * 0.3;
      reasons.push(`Rain forecast: ${Math.round(today.rainForecastIndex * 100)}%`);
    }
  }
  
  // Heat-sensitive issues
  if (today.heatIndex > 0.6) {
    if (ticket.type.some(t => ['electricity_outage', 'water_leak'].includes(t))) {
      boost += today.heatIndex * 0.2;
      reasons.push(`Heat index: ${Math.round(today.heatIndex * 100)}%`);
    }
  }
  
  // Air quality issues
  if (today.pm25Index > 0.5) {
    if (ticket.type.some(t => ['air_pollution', 'garbage', 'illegal_dumping'].includes(t))) {
      boost += today.pm25Index * 0.2;
      reasons.push(`PM2.5 index: ${Math.round(today.pm25Index * 100)}%`);
    }
  }
  
  return { boost: Math.min(0.5, boost), reason: reasons.join('; ') || 'No climate boost' };
}

// Classify environmental impact
function classifyEnvironmentalImpact(ticket: Ticket): EnvironmentalImpact[] {
  const impacts: EnvironmentalImpact[] = [];
  const comment = ticket.comment.toLowerCase();
  
  for (const [impact, rules] of Object.entries(ENV_IMPACT_RULES)) {
    const hasType = ticket.type.some(t => rules.types.includes(t));
    const hasKeyword = rules.keywords.some(k => comment.includes(k));
    
    if (hasType || hasKeyword) {
      impacts.push(impact as EnvironmentalImpact);
    }
  }
  
  return impacts;
}

// Generate action recommendation
function generateActionRecommendation(ticket: Ticket, riskLevel: string): string {
  const primaryType = ticket.type[0];
  const templates = ACTION_TEMPLATES[primaryType] || ACTION_TEMPLATES.default;
  
  let recommendation = templates[0];
  
  // Add urgency prefix for critical/high risk
  if (riskLevel === 'Critical') {
    recommendation = `URGENT: ${recommendation}. Escalate to emergency response team.`;
  } else if (riskLevel === 'High') {
    recommendation = `Priority: ${recommendation}. Assign senior response team.`;
  }
  
  // Check for special conditions
  const { place, distance } = findNearestSensitivePlace(ticket.coords);
  if (distance < 0.5 && place) {
    if (place.type === 'school') {
      recommendation += ` Notify ${place.name} administration.`;
    } else if (place.type === 'hospital') {
      recommendation += ` Coordinate with hospital emergency services.`;
    }
  }
  
  return recommendation;
}

// Main processing function
export function processTicket(ticket: Ticket, allTickets: Ticket[]): ProcessedTicket {
  const now = new Date();
  const created = new Date(ticket.timestamp);
  const lastActivity = new Date(ticket.last_activity);
  
  // Calculate base scores
  const severity = calculateSeverity(ticket);
  const urgency = calculateUrgency(ticket);
  const locationRisk = calculateLocationRisk(ticket);
  const frequency = calculateFrequency(ticket, allTickets);
  const disasterRisk = calculateDisasterRisk(ticket);
  const climateBoost = calculateClimateBoost(ticket);
  
  // Environmental impact
  const environmentalImpactTags = classifyEnvironmentalImpact(ticket);
  
  // Calculate priority score using the formula
  // Priority = Severity*0.35 + Urgency*0.35 + LocationRisk*0.15 + Frequency*0.15
  let priorityScore = 
    severity.score * 0.35 +
    urgency.score * 0.35 +
    locationRisk.score * 0.15 +
    frequency.score * 0.15;
  
  // Apply boosts
  priorityScore += disasterRisk.score * 0.15;
  priorityScore += climateBoost.boost;
  
  // Normalize to 0-100
  priorityScore = Math.min(100, priorityScore * 100);
  
  // Determine risk level
  let riskLevel: ProcessedTicket['riskLevel'];
  if (priorityScore >= 75) riskLevel = 'Critical';
  else if (priorityScore >= 50) riskLevel = 'High';
  else if (priorityScore >= 25) riskLevel = 'Medium';
  else riskLevel = 'Low';
  
  // Find keyword matches
  const comment = ticket.comment.toLowerCase();
  const keywordMatches = [
    ...SEVERITY_KEYWORDS.high,
    ...SEVERITY_KEYWORDS.medium,
    ...SEVERITY_KEYWORDS.amplifiers,
  ].filter(k => comment.includes(k));
  
  // Build score breakdown
  const scoreBreakdown: ScoreBreakdown = {
    baseComponents: {
      severity: { value: severity.score, weight: 0.35, factors: severity.factors },
      urgency: { value: urgency.score, weight: 0.35, factors: urgency.factors },
      locationRisk: { value: locationRisk.score, weight: 0.15, factors: locationRisk.factors },
      frequency: { value: frequency.score, weight: 0.15, factors: frequency.factors },
    },
    boosts: {
      disasterRisk: { value: disasterRisk.score, reason: disasterRisk.reason },
      climateBoost: { value: climateBoost.boost, reason: climateBoost.reason },
    },
    keywordMatches,
    nearSensitivePlace: locationRisk.nearSensitivePlace,
  };
  
  // Generate action recommendation
  const actionRecommendation = generateActionRecommendation(ticket, riskLevel);
  
  return {
    ...ticket,
    severityScore: severity.score,
    urgencyScore: urgency.score,
    locationRiskScore: locationRisk.score,
    frequencyScore: frequency.score,
    disasterRiskScore: disasterRisk.score,
    climateBoost: climateBoost.boost,
    priorityScore,
    riskLevel,
    environmentalImpactTags,
    actionRecommendation,
    scoreBreakdown,
    daysSinceCreated: Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)),
    daysSinceLastActivity: Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)),
  };
}

// Process all tickets
export function processAllTickets(tickets: Ticket[]): ProcessedTicket[] {
  return tickets.map(ticket => processTicket(ticket, tickets));
}

// Calculate district statistics
export function calculateDistrictStats(tickets: ProcessedTicket[]): DistrictStats[] {
  const districtMap = new Map<string, ProcessedTicket[]>();
  
  // Group tickets by district
  for (const ticket of tickets) {
    const current = districtMap.get(ticket.district) || [];
    current.push(ticket);
    districtMap.set(ticket.district, current);
  }
  
  const stats: DistrictStats[] = [];
  
  for (const [district, districtTickets] of districtMap) {
    const districtData = BANGKOK_DISTRICTS.find(d => d.name === district);
    
    const criticalCount = districtTickets.filter(t => t.riskLevel === 'Critical').length;
    const highCount = districtTickets.filter(t => t.riskLevel === 'High').length;
    const mediumCount = districtTickets.filter(t => t.riskLevel === 'Medium').length;
    const lowCount = districtTickets.filter(t => t.riskLevel === 'Low').length;
    
    const resolvedCount = districtTickets.filter(t => t.state === 'resolved' || t.state === 'closed').length;
    const reopenedCount = districtTickets.filter(t => t.count_reopen > 0).length;
    
    // Calculate average priority
    const avgPriority = districtTickets.reduce((sum, t) => sum + t.priorityScore, 0) / districtTickets.length || 0;
    const avgStar = districtTickets.reduce((sum, t) => sum + t.star, 0) / districtTickets.length || 0;
    
    // Calculate CVI
    const cvi = districtData 
      ? (districtData.populationDensity * 0.3 + 
         districtData.economicVulnerability * 0.4 + 
         (districtData.sensitivePlaces / 20) * 0.3) * 100
      : 50;
    
    // Calculate resilience score (inverse of various risk factors)
    const resilienceScore = Math.max(0, Math.min(100,
      100 - (avgPriority * 0.4) - 
      (criticalCount / districtTickets.length * 100 * 0.3) -
      (reopenedCount / districtTickets.length * 100 * 0.3)
    ));
    
    // Count environmental impacts
    const environmentalImpacts: Record<EnvironmentalImpact, number> = {
      'Water Pollution': 0,
      'Air Pollution': 0,
      'Waste and Hazardous Materials': 0,
      'Noise Pollution': 0,
      'Green Space Degradation': 0,
    };
    
    for (const ticket of districtTickets) {
      for (const impact of ticket.environmentalImpactTags) {
        environmentalImpacts[impact]++;
      }
    }
    
    // Calculate predicted risk (simple trend-based projection)
    const recentTickets = districtTickets.filter(t => t.daysSinceCreated <= 7).length;
    const olderTickets = districtTickets.filter(t => t.daysSinceCreated > 7 && t.daysSinceCreated <= 14).length;
    const trend = olderTickets > 0 ? recentTickets / olderTickets : 1;
    
    const predictedRisk7Days = Math.min(100, avgPriority * trend * climateContext[0].rainForecastIndex);
    const predictedRisk14Days = Math.min(100, avgPriority * trend * 0.8);
    
    stats.push({
      district,
      totalTickets: districtTickets.length,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      avgPriority,
      avgStar,
      reopenRate: districtTickets.length > 0 ? (reopenedCount / districtTickets.length) * 100 : 0,
      resolvedRate: districtTickets.length > 0 ? (resolvedCount / districtTickets.length) * 100 : 0,
      cvi,
      resilienceScore,
      predictedRisk7Days,
      predictedRisk14Days,
      environmentalImpacts,
    });
  }
  
  return stats.sort((a, b) => b.avgPriority - a.avgPriority);
}
