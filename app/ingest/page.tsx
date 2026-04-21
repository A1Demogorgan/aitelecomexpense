import IngestForm from "@/components/ingest-form";

export const runtime = "nodejs";

export default function IngestPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(30,41,59,0.9),_rgba(2,6,23,1)_48%)] px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-6">
          <div className="text-xs uppercase tracking-[0.3em] text-sky-300">Data ingestion</div>
          <h1 className="mt-2 text-3xl font-semibold text-white">Upload contracts, invoices, and AP exports</h1>
          <p className="mt-2 max-w-4xl text-sm text-slate-400">
            Download the sample contract and invoice PDFs, plus the AP workbook, edit them if needed, and upload them back to populate the local DuckDB database.
          </p>
        </div>

        <IngestForm />
      </div>
    </main>
  );
}
