"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, KeyRound } from "lucide-react";
import LogoutButton from "@/components/admin/LogoutButton";

export function UserMenu({ name, email, roleName }: { name: string; email: string; roleName: string }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 text-sm hover:bg-gray-100"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
          {initial}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-[10rem] truncate font-medium text-gray-900">{name}</span>
          <span className="block truncate text-xs capitalize text-gray-500">{roleName.replace(/_/g, " ")}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-2 w-56 rounded-md border border-gray-200 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-medium text-gray-900">{name}</p>
            <p className="truncate text-xs text-gray-500">{email}</p>
          </div>
          <Link
            href="/admin/change-password"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <KeyRound className="h-4 w-4 text-gray-400" aria-hidden="true" />
            Change password
          </Link>
          <div className="border-t border-gray-100 px-3 py-2">
            <LogoutButton className="flex w-full items-center gap-2 text-sm text-gray-700 hover:text-gray-900" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
