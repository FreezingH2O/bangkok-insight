import { useTickets } from '@/contexts/TicketContext';
import { EnvironmentalImpactChart } from '@/components/charts/DashboardCharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnvironmentalBadge } from '@/components/dashboard/EnvironmentalBadge';
import { EnvironmentalImpact } from '@/types/ticket';

export default function SustainabilityPage() {
  const { districtStats } = useTickets();

  const envTypes: EnvironmentalImpact[] = ['Water Pollution', 'Air Pollution', 'Waste and Hazardous Materials', 'Noise Pollution', 'Green Space Degradation'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Sustainability & Policy Insights</h1>
        <p className="text-muted-foreground">Environmental trends and long-term patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EnvironmentalImpactChart />
        <Card>
          <CardHeader><CardTitle className="text-sm">Impact by District</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {districtStats.slice(0, 6).map((stat) => (
              <div key={stat.district} className="space-y-1">
                <div className="font-medium text-sm">{stat.district}</div>
                <div className="flex flex-wrap gap-1">
                  {envTypes.filter(e => stat.environmentalImpacts[e] > 0).map(e => (
                    <EnvironmentalBadge key={e} impact={e} size="sm" />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
