import { useTickets } from '@/contexts/TicketContext';
import { getClimateContext } from '@/utils/scoringEngine';
import { KPICard } from '@/components/dashboard/KPICard';
import { HotspotMap } from '@/components/map/HotspotMap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, CloudRain, Thermometer, Wind } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DRRPage() {
  const { tickets, districtStats } = useTickets();
  const climate = getClimateContext();
  const today = climate[0];

  const highRiskTickets = tickets.filter(t => t.disasterRiskScore > 0.3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">DRR & Forecast</h1>
        <p className="text-muted-foreground">Disaster Risk Reduction with early warning and predictive layers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard title="High Risk Tickets" value={highRiskTickets.length} icon={AlertTriangle} variant="critical" />
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><CloudRain className="w-4 h-4" />Rain Index</CardTitle></CardHeader><CardContent><Progress value={today.rainForecastIndex * 100} className="h-3" /><p className="text-xs text-muted-foreground mt-1">{(today.rainForecastIndex * 100).toFixed(0)}% forecast</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Thermometer className="w-4 h-4" />Heat Index</CardTitle></CardHeader><CardContent><Progress value={today.heatIndex * 100} className="h-3" /><p className="text-xs text-muted-foreground mt-1">{(today.heatIndex * 100).toFixed(0)}%</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wind className="w-4 h-4" />PM2.5 Index</CardTitle></CardHeader><CardContent><Progress value={today.pm25Index * 100} className="h-3" /><p className="text-xs text-muted-foreground mt-1">{(today.pm25Index * 100).toFixed(0)}%</p></CardContent></Card>
      </div>

      <HotspotMap height="500px" />
    </div>
  );
}
