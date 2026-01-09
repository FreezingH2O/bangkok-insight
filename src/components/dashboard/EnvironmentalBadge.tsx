import { cn } from '@/lib/utils';
import { EnvironmentalImpact } from '@/types/ticket';
import { Droplets, Wind, Trash2, Volume2, Trees } from 'lucide-react';

interface EnvironmentalBadgeProps {
  impact: EnvironmentalImpact;
  size?: 'sm' | 'md';
  className?: string;
}

const impactConfig: Record<EnvironmentalImpact, { icon: typeof Droplets; className: string }> = {
  'Water Pollution': { icon: Droplets, className: 'env-water' },
  'Air Pollution': { icon: Wind, className: 'env-air' },
  'Waste and Hazardous Materials': { icon: Trash2, className: 'env-waste' },
  'Noise Pollution': { icon: Volume2, className: 'env-noise' },
  'Green Space Degradation': { icon: Trees, className: 'env-green' },
};

export function EnvironmentalBadge({ impact, size = 'md', className }: EnvironmentalBadgeProps) {
  const config = impactConfig[impact];
  const Icon = config.icon;

  return (
    <span className={cn(
      'env-badge inline-flex items-center gap-1',
      config.className,
      size === 'sm' && 'text-[10px] px-1.5 py-0.5',
      className
    )}>
      <Icon className={cn('flex-shrink-0', size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5')} />
      <span className="truncate">{impact}</span>
    </span>
  );
}

interface EnvironmentalBadgeListProps {
  impacts: EnvironmentalImpact[];
  max?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export function EnvironmentalBadgeList({ impacts, max = 3, size = 'md', className }: EnvironmentalBadgeListProps) {
  const displayed = impacts.slice(0, max);
  const remaining = impacts.length - max;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {displayed.map((impact) => (
        <EnvironmentalBadge key={impact} impact={impact} size={size} />
      ))}
      {remaining > 0 && (
        <span className={cn(
          'env-badge bg-muted text-muted-foreground',
          size === 'sm' && 'text-[10px] px-1.5 py-0.5'
        )}>
          +{remaining}
        </span>
      )}
    </div>
  );
}
