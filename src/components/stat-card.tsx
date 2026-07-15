import React from 'react';
import type { StatItem } from '@/data/const';

interface StatCardProps {
  stats: StatItem[];
}

export const StatCard: React.FC<StatCardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 hover:border-white/25 hover:-translate-y-1 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] transition-all duration-300 group relative overflow-hidden"
        >
          {/* Subtle glow on hover */}
          <div className="absolute -inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div
              className={`w-10 h-10 rounded-xl bg-${stat.iconColor?.split('-')[0]}-500/10 ${
                stat.iconColor || 'text-primary'
              } flex items-center justify-center group-hover:scale-105 transition-transform shrink-0`}
            >
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCard;
