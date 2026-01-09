import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useTickets } from '@/contexts/TicketContext';
import { ProcessedTicket } from '@/types/ticket';
import { RiskBadge } from '@/components/dashboard/RiskBadge';
import { EnvironmentalBadgeList } from '@/components/dashboard/EnvironmentalBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, ChevronRight, Clock, Star, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface PriorityQueueTableProps {
  onTicketSelect: (ticket: ProcessedTicket) => void;
}

export function PriorityQueueTable({ onTicketSelect }: PriorityQueueTableProps) {
  const { filteredTickets, filters, setFilters, allDistricts } = useTickets();
  
  const [searchValue, setSearchValue] = useState('');
  const [displayCount, setDisplayCount] = useState(50);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchQuery: searchValue }));
    }, 300);
    return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
  }, [searchValue, setFilters]);

  const clearFilters = useCallback(() => {
    setFilters({ district: null, types: [], states: [], riskLevels: [], environmentalImpacts: [], dateRange: { start: null, end: null }, searchQuery: '' });
    setSearchValue('');
  }, [setFilters]);

  const hasActiveFilters = filters.district || filters.types.length > 0 || filters.states.length > 0 || filters.riskLevels.length > 0 || filters.searchQuery;
  const displayedTickets = useMemo(() => filteredTickets.slice(0, displayCount), [filteredTickets, displayCount]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={searchValue} onChange={(e) => setSearchValue(e.target.value)} className="pl-9" />
        </div>
        <Select value={filters.district || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, district: value === 'all' ? null : value }))}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {allDistricts.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filters.riskLevels[0] || 'all'} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevels: value === 'all' ? [] : [value] }))}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Risk Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && <Button variant="ghost" size="sm" onClick={clearFilters}><X className="w-3.5 h-3.5 mr-1" />Clear</Button>}
        <div className="ml-auto text-sm text-muted-foreground">{filteredTickets.length.toLocaleString()} tickets</div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs font-medium text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">ID</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-center">Priority</th>
                <th className="px-4 py-3 text-center">Risk</th>
                <th className="px-4 py-3 text-left">Created</th>
                <th className="px-4 py-3 text-center">Rating</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {displayedTickets.map((ticket) => (
                <tr key={ticket.ticket_id} className="border-t border-border hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => onTicketSelect(ticket)}>
                  <td className="px-4 py-3 font-mono text-xs">{ticket.ticket_id}</td>
                  <td className="px-4 py-3"><div className="flex gap-1 flex-wrap">{ticket.type.slice(0,2).map(t => <Badge key={t} variant="secondary" className="text-[10px]">{t.replace(/_/g,' ')}</Badge>)}</div></td>
                  <td className="px-4 py-3 text-xs">{ticket.district}</td>
                  <td className="px-4 py-3 text-center font-bold text-lg">{ticket.priorityScore.toFixed(0)}</td>
                  <td className="px-4 py-3 text-center"><RiskBadge level={ticket.riskLevel} size="sm" showDot /></td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{format(new Date(ticket.timestamp), 'MMM dd')}</td>
                  <td className="px-4 py-3 text-center"><span className="flex items-center justify-center gap-1"><Star className="w-3 h-3 text-risk-medium" />{ticket.star}</span></td>
                  <td className="px-4 py-3"><ChevronRight className="w-4 h-4 text-muted-foreground" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {displayCount < filteredTickets.length && (
          <div className="p-4 text-center border-t border-border">
            <Button variant="outline" onClick={() => setDisplayCount(prev => prev + 50)}>Load more ({filteredTickets.length - displayCount} remaining)</Button>
          </div>
        )}
      </div>
    </div>
  );
}
