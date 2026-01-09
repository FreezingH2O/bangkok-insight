import { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { Ticket, ProcessedTicket, FilterState, DistrictStats, DashboardKPIs, FeedbackEntry } from '@/types/ticket';
import { generateMockTickets } from '@/data/mockData';
import { processAllTickets, calculateDistrictStats } from '@/utils/scoringEngine';

interface TicketContextType {
  tickets: ProcessedTicket[];
  filteredTickets: ProcessedTicket[];
  districtStats: DistrictStats[];
  kpis: DashboardKPIs;
  isLoading: boolean;
  filters: FilterState;
  setFilters: (filters: FilterState | ((prev: FilterState) => FilterState)) => void;
  selectedTicket: ProcessedTicket | null;
  setSelectedTicket: (ticket: ProcessedTicket | null) => void;
  feedback: FeedbackEntry[];
  addFeedback: (entry: FeedbackEntry) => void;
  allTypes: string[];
  allDistricts: string[];
}

const TicketContext = createContext<TicketContextType | null>(null);

const initialFilters: FilterState = {
  district: null,
  types: [],
  states: [],
  riskLevels: [],
  environmentalImpacts: [],
  dateRange: { start: null, end: null },
  searchQuery: '',
};

export function TicketProvider({ children }: { children: ReactNode }) {
  const [rawTickets, setRawTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [selectedTicket, setSelectedTicket] = useState<ProcessedTicket | null>(null);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);

  // Load tickets on mount
  useEffect(() => {
    const loadTickets = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from public/data/tickets.json first
        const response = await fetch('/data/tickets.json');
        if (response.ok) {
          const data = await response.json();
          // If we have real data, use it; otherwise generate mock data
          if (data && data.length > 100) {
            setRawTickets(data);
          } else {
            // Generate 5000 mock tickets for demo
            const mockData = generateMockTickets(5000);
            setRawTickets(mockData);
          }
        } else {
          const mockData = generateMockTickets(5000);
          setRawTickets(mockData);
        }
      } catch {
        // Generate mock data if fetch fails
        const mockData = generateMockTickets(5000);
        setRawTickets(mockData);
      }
      setIsLoading(false);
    };

    loadTickets();

    // Load feedback from localStorage
    const storedFeedback = localStorage.getItem('ticket_feedback');
    if (storedFeedback) {
      setFeedback(JSON.parse(storedFeedback));
    }
  }, []);

  // Process all tickets with AI scoring
  const tickets = useMemo(() => {
    if (rawTickets.length === 0) return [];
    return processAllTickets(rawTickets);
  }, [rawTickets]);

  // Calculate district statistics
  const districtStats = useMemo(() => {
    if (tickets.length === 0) return [];
    return calculateDistrictStats(tickets);
  }, [tickets]);

  // Extract all unique types and districts
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    tickets.forEach(t => t.type.forEach(type => types.add(type)));
    return Array.from(types).sort();
  }, [tickets]);

  const allDistricts = useMemo(() => {
    const districts = new Set<string>();
    tickets.forEach(t => districts.add(t.district));
    return Array.from(districts).sort();
  }, [tickets]);

  // Apply filters to tickets
  const filteredTickets = useMemo(() => {
    let result = [...tickets];

    if (filters.district) {
      result = result.filter(t => t.district === filters.district);
    }

    if (filters.types.length > 0) {
      result = result.filter(t => t.type.some(type => filters.types.includes(type)));
    }

    if (filters.states.length > 0) {
      result = result.filter(t => filters.states.includes(t.state));
    }

    if (filters.riskLevels.length > 0) {
      result = result.filter(t => filters.riskLevels.includes(t.riskLevel));
    }

    if (filters.environmentalImpacts.length > 0) {
      result = result.filter(t => 
        t.environmentalImpactTags.some(tag => filters.environmentalImpacts.includes(tag))
      );
    }

    if (filters.dateRange.start) {
      result = result.filter(t => new Date(t.timestamp) >= filters.dateRange.start!);
    }

    if (filters.dateRange.end) {
      result = result.filter(t => new Date(t.timestamp) <= filters.dateRange.end!);
    }

    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(t => 
        t.comment.toLowerCase().includes(query) ||
        t.ticket_id.toLowerCase().includes(query) ||
        t.address.toLowerCase().includes(query)
      );
    }

    // Sort by priority descending
    return result.sort((a, b) => b.priorityScore - a.priorityScore);
  }, [tickets, filters]);

  // Calculate KPIs
  const kpis = useMemo((): DashboardKPIs => {
    if (tickets.length === 0) {
      return {
        totalTickets: 0,
        criticalCount: 0,
        resolvedRate: 0,
        avgStar: 0,
        reopenRate: 0,
        avgResponseTime: 0,
        ticketsToday: 0,
        ticketsThisWeek: 0,
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const criticalCount = tickets.filter(t => t.riskLevel === 'Critical').length;
    const resolvedCount = tickets.filter(t => t.state === 'resolved' || t.state === 'closed').length;
    const reopenedCount = tickets.filter(t => t.count_reopen > 0).length;
    const ticketsToday = tickets.filter(t => new Date(t.timestamp) >= today).length;
    const ticketsThisWeek = tickets.filter(t => new Date(t.timestamp) >= weekAgo).length;

    const avgStar = tickets.reduce((sum, t) => sum + t.star, 0) / tickets.length;
    const avgResponseTime = tickets
      .filter(t => t.state === 'resolved')
      .reduce((sum, t) => {
        const created = new Date(t.timestamp);
        const resolved = new Date(t.last_activity);
        return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
      }, 0) / resolvedCount || 0;

    return {
      totalTickets: tickets.length,
      criticalCount,
      resolvedRate: (resolvedCount / tickets.length) * 100,
      avgStar,
      reopenRate: (reopenedCount / tickets.length) * 100,
      avgResponseTime,
      ticketsToday,
      ticketsThisWeek,
    };
  }, [tickets]);

  // Add feedback
  const addFeedback = useCallback((entry: FeedbackEntry) => {
    setFeedback(prev => {
      const updated = [...prev, entry];
      localStorage.setItem('ticket_feedback', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <TicketContext.Provider
      value={{
        tickets,
        filteredTickets,
        districtStats,
        kpis,
        isLoading,
        filters,
        setFilters,
        selectedTicket,
        setSelectedTicket,
        feedback,
        addFeedback,
        allTypes,
        allDistricts,
      }}
    >
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}
