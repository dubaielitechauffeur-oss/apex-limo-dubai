import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface AdminTopBarProps {
  name: string;
  email: string;
}

export default function AdminTopBar({ name, email }: AdminTopBarProps) {
  return (
    <header className="border-b border-gold/15 bg-charcoal">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link href="/admin" className="font-logo text-lg italic tracking-wide text-gold">
          APEX ADMIN
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-smoke">
            {name} <span className="text-smoke/60">({email})</span>
          </span>
          <Link href="/admin/change-password" className="text-gold-pale transition-colors hover:text-gold">
            Change Password
          </Link>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
