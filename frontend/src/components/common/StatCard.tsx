import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    positive: boolean;
  };
  progress?: {
    current: number;
    total: number;
    unit?: string;
  };
  onClick?: () => void;
}

export default function StatCard({ title, value, icon: Icon, description, trend, progress, onClick }: StatCardProps) {
  const progressPercentage = progress ? (progress.current / progress.total) * 100 : 0;

  return (
    <div 
      className={`backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-white/60 mb-2">{title}</p>
          <p className="text-white/90 mb-1">{value}</p>
          {description && (
            <p className="text-xs text-white/50">{description}</p>
          )}
          {trend && (
            <div className="mt-2 flex items-center gap-1">
              <span className={`text-xs ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </span>
              <span className="text-xs text-white/50">vs last week</span>
            </div>
          )}
          {progress && (
            <div className="mt-3">
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <p className="text-xs text-white/50 mt-1">
                {progress.current.toFixed(1)} of {progress.total} {progress.unit || 'days'}
              </p>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl flex items-center justify-center border border-white/10">
          <Icon className="w-6 h-6 text-blue-300" />
        </div>
      </div>
    </div>
  );
}
