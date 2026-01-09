import { useState } from 'react';
import { HotspotMap } from '@/components/map/HotspotMap';
import { useTickets } from '@/contexts/TicketContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function MapPage() {
  const { setFilters, districtStats } = useTickets();

  const handleDistrictClick = (district: string) => {
    setFilters(prev => ({ ...prev, district }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Map & Hotspots</h1>
        <p className="text-muted-foreground">Spatial analysis with multiple risk layers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <HotspotMap onDistrictClick={handleDistrictClick} height="600px" className="relative" />
        </div>
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Top Risk Districts</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {districtStats.slice(0, 8).map((stat) => (
                <div key={stat.district} className="flex items-center justify-between text-sm cursor-pointer hover:bg-muted/50 p-2 rounded" onClick={() => handleDistrictClick(stat.district)}>
                  <span className="truncate">{stat.district}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={stat.criticalCount > 0 ? 'destructive' : 'secondary'} className="text-[10px]">{stat.criticalCount} crit</Badge>
                    <span className="font-mono text-xs">{stat.avgPriority.toFixed(0)}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
