import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquareQuote,
  Home,
  Car,
  FolderOpen,
  DollarSign,
  Briefcase,
  MapPin,
  FileText,
  Image as ImageIcon,
  Search,
  Languages,
  Settings,
  Users,
  BarChart3,
  ScrollText,
  Circle,
  type LucideIcon,
} from "lucide-react";

/**
 * `config/admin.ts` stores icons as Lucide icon NAME strings (so that file
 * can stay a plain data module with no React/JSX dependency). This is the
 * one place that maps those names back to real components. Add new entries
 * here whenever a new module is added to `ADMIN_NAV`.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  LayoutDashboard,
  CalendarCheck,
  MessageSquareQuote,
  Home,
  Car,
  FolderOpen,
  DollarSign,
  Briefcase,
  MapPin,
  FileText,
  Image: ImageIcon,
  Search,
  Languages,
  Settings,
  Users,
  BarChart3,
  ScrollText,
};

export function AdminNavIcon({ name, className }: { name: string; className?: string }) {
  const IconComponent = ICON_MAP[name] ?? Circle;
  return <IconComponent className={className} aria-hidden="true" />;
}
