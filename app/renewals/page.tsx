import TelecomDashboard from "@/components/telecom-dashboard";
import { getDashboardSnapshot } from "@/lib/telecom/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default async function RenewalsPage() {
  const snapshot = await getDashboardSnapshot();

  return <TelecomDashboard snapshot={snapshot} view="renewals" />;
}
