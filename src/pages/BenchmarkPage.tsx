import { useTickets } from '@/contexts/TicketContext';
import { ResilienceLeaderboardChart } from '@/components/charts/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function BenchmarkPage() {
  const { districtStats } = useTickets();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">District Benchmark</h1>
        <p className="text-muted-foreground">City Resilience Scores and district comparison</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ResilienceLeaderboardChart />
        <Card>
          <CardHeader><CardTitle className="text-sm">Resilience Breakdown</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {districtStats.slice(0, 8).map((stat) => (
              <div key={stat.district} className="space-y-2">
                <div className="flex justify-between text-sm"><span>{stat.district}</span><span className="font-bold">{stat.resilienceScore.toFixed(0)}/100</span></div>
                <Progress value={stat.resilienceScore} className="h-2" />
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>CVI: {stat.cvi.toFixed(0)}</span>
                  <span>Resolved: {stat.resolvedRate.toFixed(0)}%</span>
                  <span>Tickets: {stat.totalTickets}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
