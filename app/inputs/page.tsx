import TelecomDashboard from "@/components/telecom-dashboard";
import { getDashboardSnapshot } from "@/lib/telecom/db";

export const runtime = "nodejs";

export default async function InputsPage() {
  const snapshot = await getDashboardSnapshot();

  return <TelecomDashboard snapshot={snapshot} view="inputs" />;
}
