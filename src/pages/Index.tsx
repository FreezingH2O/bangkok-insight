import { useTickets } from '@/contexts/TicketContext';
import { KPICard } from '@/components/dashboard/KPICard';
import { TicketsPerDayChart, TopIssueTypesChart, EnvironmentalImpactChart, ResilienceLeaderboardChart } from '@/components/charts/DashboardCharts';
import { AlertTriangle, CheckCircle, Star, RefreshCw, TrendingUp, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Overview() {
  const { kpis, isLoading } = useTickets();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div><h1 className="text-2xl font-bold">Overview</h1><p className="text-muted-foreground">Loading dashboard...</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Bangkok Urban Priority Dashboard</h1>
        <p className="text-muted-foreground">AI-powered decision support for urban problem management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Tickets" value={kpis.totalTickets.toLocaleString()} subtitle={`${kpis.ticketsThisWeek} this week`} icon={TrendingUp} />
        <KPICard title="Critical Issues" value={kpis.criticalCount} subtitle="Requires immediate attention" icon={AlertTriangle} variant="critical" />
        <KPICard title="Resolution Rate" value={`${kpis.resolvedRate.toFixed(1)}%`} subtitle={`Avg ${kpis.avgResponseTime.toFixed(1)} days`} icon={CheckCircle} variant="success" />
        <KPICard title="Avg Satisfaction" value={kpis.avgStar.toFixed(1)} subtitle={`${kpis.reopenRate.toFixed(1)}% reopen rate`} icon={Star} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TicketsPerDayChart />
        <TopIssueTypesChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnvironmentalImpactChart />
        <ResilienceLeaderboardChart />
      </div>
    </div>
  );
}
