import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTickets } from '@/contexts/TicketContext';
import { format, subDays, startOfDay } from 'date-fns';

const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-6))',
];

const RISK_COLORS = {
  Critical: 'hsl(var(--risk-critical))',
  High: 'hsl(var(--risk-high))',
  Medium: 'hsl(var(--risk-medium))',
  Low: 'hsl(var(--risk-low))',
};

export function TicketsPerDayChart() {
  const { tickets } = useTickets();

  const data = useMemo(() => {
    const days = 30;
    const counts: Record<string, number> = {};
    
    // Initialize all days with 0
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'MMM dd');
      counts[date] = 0;
    }

    // Count tickets per day
    tickets.forEach(ticket => {
      const ticketDate = startOfDay(new Date(ticket.timestamp));
      const thirtyDaysAgo = subDays(new Date(), days);
      
      if (ticketDate >= thirtyDaysAgo) {
        const dateKey = format(ticketDate, 'MMM dd');
        if (dateKey in counts) {
          counts[dateKey]++;
        }
      }
    });

    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [tickets]);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold mb-4">Tickets per Day (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopIssueTypesChart() {
  const { tickets } = useTickets();

  const data = useMemo(() => {
    const typeCounts: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      ticket.type.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
    });

    return Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([type, count]) => ({
        type: type.replace(/_/g, ' '),
        count,
      }));
  }, [tickets]);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold mb-4">Top Issue Types</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis 
            type="category" 
            dataKey="type" 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Bar 
            dataKey="count" 
            fill="hsl(var(--accent))"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnvironmentalImpactChart() {
  const { tickets } = useTickets();

  const data = useMemo(() => {
    const impactCounts: Record<string, number> = {};
    
    tickets.forEach(ticket => {
      ticket.environmentalImpactTags.forEach(impact => {
        impactCounts[impact] = (impactCounts[impact] || 0) + 1;
      });
    });

    return Object.entries(impactCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([impact, count], index) => ({
        name: impact,
        value: count,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }));
  }, [tickets]);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold mb-4">Environmental Impact Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => <span className="text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ResilienceLeaderboardChart() {
  const { districtStats } = useTickets();

  const data = useMemo(() => {
    return districtStats
      .sort((a, b) => b.resilienceScore - a.resilienceScore)
      .slice(0, 10)
      .map(stat => ({
        district: stat.district,
        score: Math.round(stat.resilienceScore),
      }));
  }, [districtStats]);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold mb-4">District Resilience Scores</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            type="category" 
            dataKey="district" 
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={90}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
            formatter={(value: number) => [`${value}/100`, 'Resilience Score']}
          />
          <Bar 
            dataKey="score"
            radius={[0, 4, 4, 0]}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.score >= 70 ? 'hsl(var(--risk-low))' : entry.score >= 50 ? 'hsl(var(--risk-medium))' : 'hsl(var(--risk-high))'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskDistributionChart() {
  const { tickets } = useTickets();

  const data = useMemo(() => {
    const counts = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };

    tickets.forEach(ticket => {
      counts[ticket.riskLevel]++;
    });

    return Object.entries(counts).map(([level, count]) => ({
      name: level,
      value: count,
      color: RISK_COLORS[level as keyof typeof RISK_COLORS],
    }));
  }, [tickets]);

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold mb-4">Risk Level Distribution</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: 'var(--radius)',
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => <span className="text-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
