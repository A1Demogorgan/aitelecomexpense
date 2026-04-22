export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-6">
      <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-slate-200 bg-white px-10 py-10 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-slate-200 border-t-[#f3cf72]" />
        <div className="text-sm font-medium uppercase tracking-[0.28em] text-slate-500">
          Preparing your data
        </div>
      </div>
    </div>
  );
}
