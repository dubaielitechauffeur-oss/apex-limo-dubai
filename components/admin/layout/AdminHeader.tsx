import { Menu } from "lucide-react";
import { UserMenu } from "./UserMenu";

export function AdminHeader({
  onMenuClick,
  name,
  email,
  roleName,
}: {
  onMenuClick: () => void;
  name: string;
  email: string;
  roleName: string;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:pl-4">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="flex h-9 w-9 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 lg:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>
      <div className="flex-1" />
      <UserMenu name={name} email={email} roleName={roleName} />
    </header>
  );
}
