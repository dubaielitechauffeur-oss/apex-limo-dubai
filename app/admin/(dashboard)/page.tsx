import type { Metadata } from "next";
import { Car, CalendarCheck, MessageSquareQuote, FileText, Briefcase, MapPin, Users } from "lucide-react";
import { requireUser } from "@/lib/auth/session";
import { getDashboardStats } from "@/lib/admin/dashboard";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { DashboardCard } from "@/components/admin/ui/DashboardCard";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export const metadata: Metadata = { title: "Dashboard — Admin" };

const STAT_ICONS: Record<string, typeof Car> = {
  vehicles: Car,
  bookings: CalendarCheck,
  quotes: MessageSquareQuote,
  blogs: FileText,
  services: Briefcase,
  locations: MapPin,
  users: Users,
};

export default async function AdminDashboardPage() {
  const user = await requireUser();
  const stats = (await getDashboardStats()).filter((stat) => stat.visible);

  return (
    <div>
      <PageHeader title={`Welcome, ${user.name ?? "Admin"}`} subtitle="Here's what's happening across Apex Limo & Chauffeur Dubai." />

      {stats.length === 0 ? (
        <EmptyState title="Nothing to show yet" description="Your role doesn't have visibility into any dashboard metrics." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stats.map((stat) => {
            const IconComponent = STAT_ICONS[stat.id] ?? Car;
            return <DashboardCard key={stat.id} label={stat.label} value={stat.value} icon={IconComponent} href={stat.href} />;
          })}
        </div>
      )}
    </div>
  );
}
