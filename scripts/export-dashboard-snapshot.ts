import fs from "node:fs";
import path from "node:path";
import { getDashboardSnapshot } from "../lib/telecom/db";

async function main() {
  const snapshot = await getDashboardSnapshot();
  const output = path.join(process.cwd(), "lib", "telecom", "dashboard-snapshot.json");
  fs.writeFileSync(output, JSON.stringify(snapshot, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
