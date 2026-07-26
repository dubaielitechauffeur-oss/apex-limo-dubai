/**
 * Route scaffolding only — this is `/admin`, the future dashboard home
 * (lead/vehicle/post counts + quick links). Real content, auth guarding,
 * and the Fleet/Blog/Leads/Settings modules land in later phases of the
 * Admin Panel build-out.
 */
export default function AdminDashboardPage() {
  return (
    <div>
      <p className="label-eyebrow text-[10px] text-gold">Apex Admin</p>
      <h1 className="mt-2 font-display text-3xl text-heading">Dashboard</h1>
      <p className="mt-3 max-w-xl text-sm text-smoke">
        The Admin Panel is under construction. This route is scaffolding for
        the upcoming Fleet, Blog, and Lead management modules.
      </p>
    </div>
  );
}
