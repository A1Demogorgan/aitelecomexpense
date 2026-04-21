import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/telecom/db";

export const runtime = "nodejs";

export async function GET() {
  const snapshot = await getDashboardSnapshot();
  return NextResponse.json(snapshot);
}

