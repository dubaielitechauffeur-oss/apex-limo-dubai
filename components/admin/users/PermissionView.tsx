import { Check, Minus } from "lucide-react";

export interface CatalogEntry {
  permission: string;
  resource: string;
}

/**
 * Read-only display of the 53-permission catalog grouped by resource, with
 * a checkmark for whichever subset `granted` contains. Used to show what a
 * role currently grants (Users & Roles detail) — this phase only *displays*
 * permissions; it never lets anyone hand-pick individual permissions
 * outside a role (RBAC.md/Phase 5 scope: no per-user permission overrides).
 */
export function PermissionView({ catalog, granted }: { catalog: CatalogEntry[]; granted: string[] }) {
  const grantedSet = new Set(granted);
  const byResource = new Map<string, string[]>();
  for (const entry of catalog) {
    const list = byResource.get(entry.resource) ?? [];
    list.push(entry.permission);
    byResource.set(entry.resource, list);
  }
  const resources = [...byResource.keys()].sort();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource) => (
        <div key={resource} className="rounded-lg border border-gray-200 p-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">{resource}</h4>
          <ul className="mt-2 space-y-1">
            {byResource.get(resource)!.map((permission) => {
              const action = permission.split(":")[1] ?? permission;
              const isGranted = grantedSet.has(permission);
              return (
                <li
                  key={permission}
                  className={`flex items-center gap-1.5 text-sm capitalize ${isGranted ? "text-gray-900" : "text-gray-400"}`}
                >
                  {isGranted ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 shrink-0 text-gray-300" aria-hidden="true" />
                  )}
                  <span className={isGranted ? "" : "text-gray-400 line-through decoration-gray-300"}>{action}</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
