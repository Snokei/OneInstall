import { HardDrive, ArrowUpCircle, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface StatItem {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string | number;
}

export const DEFAULT_STATS: StatItem[] = [
  { icon: HardDrive, iconColor: 'text-emerald-500', label: 'Total Installed', value: 0 },
  { icon: ArrowUpCircle, iconColor: 'text-cyan-500', label: 'Updates Available', value: 0 },
  { icon: ShieldCheck, iconColor: 'text-primary', label: 'Package Status', value: 'Active' },
];