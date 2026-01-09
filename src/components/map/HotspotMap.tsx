import { useEffect, useRef, useMemo, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTickets } from '@/contexts/TicketContext';
import { MapLayer, ProcessedTicket } from '@/types/ticket';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Layers, Target, AlertTriangle, CloudRain, Leaf, Shield } from 'lucide-react';

// Fix Leaflet default marker icon issue
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface HotspotMapProps {
  onDistrictClick?: (district: string) => void;
  className?: string;
  height?: string;
}

const LAYER_OPTIONS: { id: MapLayer; label: string; icon: typeof Target }[] = [
  { id: 'priority', label: 'Priority Hotspots', icon: Target },
  { id: 'disaster_risk', label: 'Disaster Risk', icon: AlertTriangle },
  { id: 'predictive', label: 'Predictive (7-14 days)', icon: CloudRain },
  { id: 'environmental', label: 'Environmental', icon: Leaf },
  { id: 'resilience', label: 'Resilience', icon: Shield },
];

// Risk level colors
const getRiskColor = (score: number): string => {
  if (score >= 75) return '#ef4444'; // Critical - red
  if (score >= 50) return '#f97316'; // High - orange
  if (score >= 25) return '#eab308'; // Medium - yellow
  return '#22c55e'; // Low - green
};

export function HotspotMap({ onDistrictClick, className, height = '500px' }: HotspotMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  
  const { filteredTickets, districtStats } = useTickets();
  const [activeLayer, setActiveLayer] = useState<MapLayer>('priority');

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Bangkok center coordinates
    const bangkokCenter: [number, number] = [13.7563, 100.5018];

    mapInstanceRef.current = L.map(mapRef.current, {
      center: bangkokCenter,
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    // Add dark/light tile layer based on theme
    const isDark = document.documentElement.classList.contains('dark');
    L.tileLayer(
      isDark 
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }
    ).addTo(mapInstanceRef.current);

    markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data or layer changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    // Clear existing markers
    markersLayerRef.current.clearLayers();

    if (activeLayer === 'priority') {
      // Show ticket markers weighted by priority
      const ticketsToShow = filteredTickets.slice(0, 500); // Limit for performance
      
      ticketsToShow.forEach((ticket) => {
        const color = getRiskColor(ticket.priorityScore);
        const radius = 5 + (ticket.priorityScore / 20);

        const circle = L.circleMarker([ticket.coords[0], ticket.coords[1]], {
          radius,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.5,
        });

        circle.bindPopup(`
          <div class="p-2">
            <div class="font-bold">${ticket.ticket_id}</div>
            <div class="text-sm">${ticket.type.join(', ')}</div>
            <div class="text-sm text-muted-foreground">${ticket.district}</div>
            <div class="mt-1">
              <span class="font-medium">Priority:</span> ${ticket.priorityScore.toFixed(1)}
            </div>
            <div>
              <span class="font-medium">Risk:</span> ${ticket.riskLevel}
            </div>
          </div>
        `);

        circle.on('click', () => {
          if (onDistrictClick) {
            onDistrictClick(ticket.district);
          }
        });

        markersLayerRef.current?.addLayer(circle);
      });
    } else if (activeLayer === 'resilience') {
      // Show district circles sized by resilience
      districtStats.forEach((stat) => {
        // Mock district center coordinates
        const districtCenters: Record<string, [number, number]> = {
          'Watthana': [13.7380, 100.5614],
          'Chatuchak': [13.8036, 100.5536],
          'Bang Rak': [13.7254, 100.5178],
          'Khlong Toei': [13.7214, 100.5612],
          'Phaya Thai': [13.7649, 100.5344],
          'Din Daeng': [13.7700, 100.5500],
          'Huai Khwang': [13.7800, 100.5800],
          'Ratchathewi': [13.7550, 100.5300],
          'Pathum Wan': [13.7400, 100.5350],
          'Bang Kapi': [13.7650, 100.6100],
          'Lat Phrao': [13.8000, 100.5900],
          'Suan Luang': [13.7200, 100.6300],
          'Prawet': [13.7100, 100.6600],
          'Bang Na': [13.6700, 100.6200],
          'Yan Nawa': [13.6900, 100.5400],
        };

        const coords = districtCenters[stat.district];
        if (!coords) return;

        const color = stat.resilienceScore >= 70 ? '#22c55e' : 
                     stat.resilienceScore >= 50 ? '#eab308' : '#ef4444';

        const circle = L.circle(coords, {
          radius: 800,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.3,
        });

        circle.bindPopup(`
          <div class="p-2">
            <div class="font-bold">${stat.district}</div>
            <div class="mt-1">
              <span class="font-medium">Resilience Score:</span> ${stat.resilienceScore.toFixed(0)}/100
            </div>
            <div>
              <span class="font-medium">Total Tickets:</span> ${stat.totalTickets}
            </div>
            <div>
              <span class="font-medium">Critical:</span> ${stat.criticalCount}
            </div>
          </div>
        `);

        circle.on('click', () => {
          if (onDistrictClick) {
            onDistrictClick(stat.district);
          }
        });

        markersLayerRef.current?.addLayer(circle);
      });
    } else if (activeLayer === 'disaster_risk') {
      // Show high disaster risk tickets
      const highRiskTickets = filteredTickets.filter(t => t.disasterRiskScore > 0.3);
      
      highRiskTickets.forEach((ticket) => {
        const intensity = ticket.disasterRiskScore;
        const color = `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`;

        const circle = L.circleMarker([ticket.coords[0], ticket.coords[1]], {
          radius: 8 + intensity * 10,
          fillColor: color,
          color: '#ef4444',
          weight: 2,
          opacity: 0.9,
          fillOpacity: 0.5,
        });

        circle.bindPopup(`
          <div class="p-2">
            <div class="font-bold text-red-500">Disaster Risk Alert</div>
            <div class="text-sm">${ticket.ticket_id}</div>
            <div class="text-sm">${ticket.type.join(', ')}</div>
            <div class="mt-1">
              <span class="font-medium">Disaster Risk:</span> ${(ticket.disasterRiskScore * 100).toFixed(0)}%
            </div>
            <div class="text-xs mt-1">${ticket.scoreBreakdown.boosts.disasterRisk.reason}</div>
          </div>
        `);

        markersLayerRef.current?.addLayer(circle);
      });
    } else if (activeLayer === 'predictive') {
      // Show predictive risk by district
      districtStats.forEach((stat) => {
        const districtCenters: Record<string, [number, number]> = {
          'Watthana': [13.7380, 100.5614],
          'Chatuchak': [13.8036, 100.5536],
          'Bang Rak': [13.7254, 100.5178],
          'Khlong Toei': [13.7214, 100.5612],
          'Phaya Thai': [13.7649, 100.5344],
          'Din Daeng': [13.7700, 100.5500],
          'Huai Khwang': [13.7800, 100.5800],
          'Ratchathewi': [13.7550, 100.5300],
          'Pathum Wan': [13.7400, 100.5350],
          'Bang Kapi': [13.7650, 100.6100],
          'Lat Phrao': [13.8000, 100.5900],
          'Suan Luang': [13.7200, 100.6300],
          'Prawet': [13.7100, 100.6600],
          'Bang Na': [13.6700, 100.6200],
          'Yan Nawa': [13.6900, 100.5400],
        };

        const coords = districtCenters[stat.district];
        if (!coords) return;

        const riskLevel = stat.predictedRisk7Days;
        const color = getRiskColor(riskLevel);

        const circle = L.circle(coords, {
          radius: 600 + riskLevel * 5,
          fillColor: color,
          color: color,
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.25,
        });

        circle.bindPopup(`
          <div class="p-2">
            <div class="font-bold">${stat.district}</div>
            <div class="text-sm text-muted-foreground">7-14 Day Forecast</div>
            <div class="mt-1">
              <span class="font-medium">7-Day Risk:</span> ${stat.predictedRisk7Days.toFixed(0)}%
            </div>
            <div>
              <span class="font-medium">14-Day Risk:</span> ${stat.predictedRisk14Days.toFixed(0)}%
            </div>
          </div>
        `);

        markersLayerRef.current?.addLayer(circle);
      });
    } else if (activeLayer === 'environmental') {
      // Show environmental impact hotspots
      const envTickets = filteredTickets.filter(t => t.environmentalImpactTags.length > 0);
      
      envTickets.slice(0, 400).forEach((ticket) => {
        const impactCount = ticket.environmentalImpactTags.length;
        const colors: Record<string, string> = {
          'Water Pollution': '#3b82f6',
          'Air Pollution': '#64748b',
          'Waste and Hazardous Materials': '#f59e0b',
          'Noise Pollution': '#8b5cf6',
          'Green Space Degradation': '#22c55e',
        };
        
        const primaryImpact = ticket.environmentalImpactTags[0];
        const color = colors[primaryImpact] || '#888';

        const circle = L.circleMarker([ticket.coords[0], ticket.coords[1]], {
          radius: 4 + impactCount * 2,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.5,
        });

        circle.bindPopup(`
          <div class="p-2">
            <div class="font-bold">${ticket.ticket_id}</div>
            <div class="text-sm">Environmental Impacts:</div>
            <ul class="text-xs mt-1">
              ${ticket.environmentalImpactTags.map(tag => `<li>- ${tag}</li>`).join('')}
            </ul>
          </div>
        `);

        markersLayerRef.current?.addLayer(circle);
      });
    }
  }, [filteredTickets, districtStats, activeLayer, onDistrictClick]);

  return (
    <div className={cn('map-container', className)}>
      {/* Layer controls */}
      <div className="absolute top-4 right-4 z-[1000] bg-card/95 backdrop-blur rounded-lg border border-border p-2 space-y-1">
        <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
          <Layers className="w-3.5 h-3.5" />
          Layers
        </div>
        {LAYER_OPTIONS.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            variant={activeLayer === id ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'w-full justify-start gap-2 text-xs',
              activeLayer === id && 'bg-primary text-primary-foreground'
            )}
            onClick={() => setActiveLayer(id)}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Button>
        ))}
      </div>

      {/* Map container */}
      <div ref={mapRef} style={{ height, width: '100%' }} />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-card/95 backdrop-blur rounded-lg border border-border p-3">
        <div className="text-xs font-medium mb-2">Risk Level</div>
        <div className="space-y-1">
          {[
            { label: 'Critical', color: '#ef4444' },
            { label: 'High', color: '#f97316' },
            { label: 'Medium', color: '#eab308' },
            { label: 'Low', color: '#22c55e' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
