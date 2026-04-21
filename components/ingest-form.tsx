"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type UploadResult = {
  ok: boolean;
  uploaded?: Array<{ kind: string; count: number }>;
  totals?: {
    annualized_savings: string;
    one_time_recovery: string;
  };
  error?: string;
};

function SampleLink({ kind, label }: { kind: "contracts" | "invoices" | "ap"; label: string }) {
  return (
    <a
      className="inline-flex items-center rounded-full border border-[#f3cf72]/40 bg-[#fff3cf] px-4 py-2 text-sm text-slate-900 transition hover:bg-[#f8e3a6]"
      href={`/api/sample-data/${kind}`}
    >
      Download {label}
    </a>
  );
}

export default function IngestForm() {
  const router = useRouter();
  const [contracts, setContracts] = useState<File | null>(null);
  const [invoices, setInvoices] = useState<File | null>(null);
  const [ap, setAp] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    if (contracts) formData.set("contracts", contracts);
    if (invoices) formData.set("invoices", invoices);
    if (ap) formData.set("ap", ap);

    const response = await fetch("/api/ingest", {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json()) as UploadResult;
    setResult(payload);
    setLoading(false);
    if (payload.ok) {
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <SampleLink kind="contracts" label="contracts PDF" />
        <SampleLink kind="invoices" label="invoices PDF" />
        <SampleLink kind="ap" label="AP export workbook" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-3xl border border-[#f3cf72]/35 bg-[#fffaf0] p-5 shadow-[0_18px_34px_rgba(243,207,114,0.12)]">
        <div className="grid gap-4 lg:grid-cols-3">
          <label className="block space-y-2 text-sm text-slate-700">
            <span>Contracts PDF</span>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(event) => setContracts(event.target.files?.[0] ?? null)}
              className="block w-full rounded-2xl border border-[#e7d7a8] bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-[#f3cf72] file:px-3 file:py-1 file:text-slate-900"
            />
          </label>
          <label className="block space-y-2 text-sm text-slate-700">
            <span>Invoices PDF</span>
            <input
              type="file"
              accept=".pdf,.xlsx,.xls"
              onChange={(event) => setInvoices(event.target.files?.[0] ?? null)}
              className="block w-full rounded-2xl border border-[#e7d7a8] bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-[#f3cf72] file:px-3 file:py-1 file:text-slate-900"
            />
          </label>
          <label className="block space-y-2 text-sm text-slate-700">
            <span>AP export workbook</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(event) => setAp(event.target.files?.[0] ?? null)}
              className="block w-full rounded-2xl border border-[#e7d7a8] bg-white px-3 py-2 text-sm text-slate-900 file:mr-3 file:rounded-full file:border-0 file:bg-[#f3cf72] file:px-3 file:py-1 file:text-slate-900"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-[#f3cf72] px-5 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-[#f5d980] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload and populate DuckDB"}
          </button>
          <div className="text-sm text-slate-600">
            Uploading a file replaces the matching DuckDB table inside the local demo database.
          </div>
        </div>

        {result ? (
          <div className={`rounded-2xl border p-4 text-sm ${result.ok ? "border-[#f3cf72]/35 bg-[#fff3cf] text-slate-900" : "border-rose-500/20 bg-rose-50 text-rose-900"}`}>
            {result.ok ? (
              <div className="space-y-2">
                <div className="font-medium">Upload complete</div>
                <div>
                  {result.uploaded?.map((item) => `${item.kind}: ${item.count}`).join(" · ")}
                </div>
                <div>
                  Savings: {result.totals?.annualized_savings} · Recovery: {result.totals?.one_time_recovery}
                </div>
              </div>
            ) : (
              <div>{result.error}</div>
            )}
          </div>
        ) : null}
      </form>
    </div>
  );
}
