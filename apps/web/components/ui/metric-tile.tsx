import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricTileProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  subValue?: string;
  variant?: 'default' | 'critical' | 'success' | 'warning';
  className?: string;
}

export function MetricTile({
  label,
  value,
  unit,
  trend,
  trendLabel,
  subValue,
  variant = 'default',
  className,
}: MetricTileProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <div
      className={cn(
        'bg-[#111318] border border-[#1e2028] rounded-lg p-4 flex flex-col gap-2',
        variant === 'critical' && 'border-red-500/30 bg-red-500/5',
        variant === 'success' && 'border-green-500/20',
        variant === 'warning' && 'border-amber-500/20',
        className
      )}
    >
      <div className="text-xs font-medium text-[#9BA7B8] tracking-widest uppercase">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            'text-2xl font-semibold font-mono',
            variant === 'critical' ? 'text-red-400' : 'text-[#f1f5f9]'
          )}
        >
          {value}
        </span>
        {unit && <span className="text-sm text-[#9BA7B8]">{unit}</span>}
      </div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <span
            className={cn(
              'flex items-center gap-0.5 text-xs font-medium',
              isPositive
                ? 'text-green-400'
                : isNegative
                ? 'text-red-400'
                : 'text-[#9BA7B8]'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : isNegative ? (
              <TrendingDown className="w-3 h-3" />
            ) : (
              <Minus className="w-3 h-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
        {trendLabel && (
          <span className="text-xs text-[#9BA7B8]">{trendLabel}</span>
        )}
        {subValue && <span className="text-xs text-[#9BA7B8]">{subValue}</span>}
      </div>
    </div>
  );
}
