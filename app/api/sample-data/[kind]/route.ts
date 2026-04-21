import { NextResponse } from "next/server";
import { buildSampleFile, sampleKindFromName, type SampleKind } from "@/lib/telecom/sample-files";

export const runtime = "nodejs";

const allowed: SampleKind[] = ["contracts", "invoices", "ap"];

export async function GET(_: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const normalized = allowed.includes(kind as SampleKind) ? (kind as SampleKind) : sampleKindFromName(kind);

  if (!normalized) {
    return NextResponse.json({ error: "Unknown sample file kind." }, { status: 404 });
  }

  const file = await buildSampleFile(normalized);

  return new NextResponse(file.buffer, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
