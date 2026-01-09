import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  variant?: 'default' | 'critical' | 'success' | 'warning';
  className?: string;
  children?: ReactNode;
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
  children,
}: KPICardProps) {
  const variantStyles = {
    default: 'from-primary/5 to-accent/5',
    critical: 'from-risk-critical/10 to-risk-high/10',
    success: 'from-risk-low/10 to-chart-3/10',
    warning: 'from-risk-medium/10 to-risk-high/10',
  };

  const iconBg = {
    default: 'bg-primary/10 text-primary',
    critical: 'bg-risk-critical/15 text-risk-critical',
    success: 'bg-risk-low/15 text-risk-low',
    warning: 'bg-risk-medium/15 text-risk-medium',
  };

  return (
    <div className={cn('kpi-card group', className)}>
      <div className={cn('kpi-card-gradient bg-gradient-to-br', variantStyles[variant])} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          {Icon && (
            <div className={cn('p-2 rounded-lg transition-transform group-hover:scale-110', iconBg[variant])}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold tracking-tight">{value}</span>
          {trend && (
            <span
              className={cn(
                'text-sm font-medium mb-1',
                trend.positive ? 'text-risk-low' : 'text-risk-critical'
              )}
            >
              {trend.positive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}

        {trend && (
          <p className="text-xs text-muted-foreground mt-2">{trend.label}</p>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
