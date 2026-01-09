// Type definitions for Urban Problem Priority Recommender

export interface Ticket {
  ticket_id: string;
  type: string[];
  organization: string;
  comment: string;
  photo: string | null;
  photo_after: string | null;
  coords: [number, number];
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  timestamp: string;
  state: 'pending' | 'in_progress' | 'resolved' | 'closed';
  star: number;
  count_reopen: number;
  last_activity: string;
}

export interface ProcessedTicket extends Ticket {
  // AI-computed scores
  severityScore: number;
  urgencyScore: number;
  locationRiskScore: number;
  frequencyScore: number;
  disasterRiskScore: number;
  climateBoost: number;
  priorityScore: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Environmental impact tags
  environmentalImpactTags: EnvironmentalImpact[];
  
  // AI recommendation
  actionRecommendation: string;
  
  // Explainability
  scoreBreakdown: ScoreBreakdown;
  
  // Computed fields
  daysSinceCreated: number;
  daysSinceLastActivity: number;
}

export type EnvironmentalImpact = 
  | 'Water Pollution'
  | 'Air Pollution'
  | 'Waste and Hazardous Materials'
  | 'Noise Pollution'
  | 'Green Space Degradation';

export interface ScoreBreakdown {
  baseComponents: {
    severity: { value: number; weight: number; factors: string[] };
    urgency: { value: number; weight: number; factors: string[] };
    locationRisk: { value: number; weight: number; factors: string[] };
    frequency: { value: number; weight: number; factors: string[] };
  };
  boosts: {
    disasterRisk: { value: number; reason: string };
    climateBoost: { value: number; reason: string };
  };
  keywordMatches: string[];
  nearSensitivePlace: { isNear: boolean; placeType: string; distance: number };
}

export interface DistrictStats {
  district: string;
  totalTickets: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  avgPriority: number;
  avgStar: number;
  reopenRate: number;
  resolvedRate: number;
  cvi: number; // Community Vulnerability Index
  resilienceScore: number; // City Resilience Score (0-100)
  predictedRisk7Days: number;
  predictedRisk14Days: number;
  environmentalImpacts: Record<EnvironmentalImpact, number>;
}

export interface ClimateContext {
  date: string;
  rainForecastIndex: number; // 0-1
  pm25Index: number; // 0-1
  heatIndex: number; // 0-1
}

export interface SensitivePlace {
  name: string;
  type: 'school' | 'hospital' | 'nursing_home' | 'temple' | 'park';
  coords: [number, number];
  district: string;
}

export interface FilterState {
  district: string | null;
  types: string[];
  states: string[];
  riskLevels: string[];
  environmentalImpacts: string[];
  dateRange: { start: Date | null; end: Date | null };
  searchQuery: string;
}

export interface DashboardKPIs {
  totalTickets: number;
  criticalCount: number;
  resolvedRate: number;
  avgStar: number;
  reopenRate: number;
  avgResponseTime: number;
  ticketsToday: number;
  ticketsThisWeek: number;
}

export type MapLayer = 
  | 'priority'
  | 'disaster_risk'
  | 'predictive'
  | 'environmental'
  | 'resilience';

export interface FeedbackEntry {
  ticketId: string;
  type: 'correct' | 'wrong' | 'note';
  note?: string;
  timestamp: string;
}
