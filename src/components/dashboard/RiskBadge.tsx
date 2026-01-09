import { cn } from '@/lib/utils';

type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export function RiskBadge({ level, size = 'md', showDot = false, className }: RiskBadgeProps) {
  const levelStyles: Record<RiskLevel, string> = {
    Low: 'risk-low',
    Medium: 'risk-medium',
    High: 'risk-high',
    Critical: 'risk-critical',
  };

  return (
    <span className={cn(
      'risk-badge',
      levelStyles[level],
      size === 'sm' && 'text-[10px] px-2 py-0.5',
      className
    )}>
      {showDot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full mr-1.5',
          level === 'Critical' && 'bg-risk-critical animate-pulse',
          level === 'High' && 'bg-risk-high',
          level === 'Medium' && 'bg-risk-medium',
          level === 'Low' && 'bg-risk-low',
        )} />
      )}
      {level}
    </span>
  );
}
