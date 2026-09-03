import { LoadingState } from "@/components/admin/ui/LoadingState";

/**
 * Route-level loading UI for every admin dashboard screen. All of these are
 * dynamic (server-rendered per request against the database), so without a
 * `loading.tsx` a navigation left the previous screen frozen on-screen with
 * no feedback until the new one finished — which reads as an unresponsive
 * click. Rendering inside AdminShell means the sidebar and header stay put
 * and only the content area shows the pending state.
 */
export default function AdminDashboardLoading() {
  return <LoadingState />;
}
