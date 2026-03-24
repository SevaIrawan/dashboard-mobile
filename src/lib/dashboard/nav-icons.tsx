import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  Calendar,
  CalendarRange,
  Circle,
  Download,
  FileText,
  Home,
  LineChart,
  Percent,
  ShoppingCart,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Home,
  Circle,
  TrendingUp,
  FileText,
  Calendar,
  CalendarRange,
  Wallet,
  ShoppingCart,
  Percent,
  Target,
  BadgeCheck,
  Download,
  LineChart,
};

export function getNavIcon(key: string | null | undefined): LucideIcon {
  if (!key) return Circle;
  return iconMap[key] ?? Circle;
}
