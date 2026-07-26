/**
 * Route scaffolding only — real Supabase Auth wiring (sign-in Server Action,
 * session cookies, middleware guard) lands in a later phase of the Admin
 * Panel build-out. This placeholder exists so `/admin/login` resolves and
 * the route-group layout split can be verified before auth is wired up.
 */
export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-sm border border-gold/20 bg-charcoal p-8 text-center">
      <p className="label-eyebrow text-[10px] text-gold">Apex Admin</p>
      <h1 className="mt-2 font-display text-2xl text-heading">Sign in</h1>
      <p className="mt-3 text-sm text-smoke">
        Admin authentication is not yet wired up. This page is routing
        scaffolding for the upcoming Admin Panel build-out.
      </p>
    </div>
  );
}
