export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f6fb] px-6">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white px-7 py-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3cf72] shadow-[0_12px_28px_rgba(243,207,114,0.35)]">
            <div className="grid grid-cols-2 gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
              <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
            </div>
          </div>
          <div>
            <div className="text-sm font-medium uppercase tracking-[0.3em] text-slate-400">
              Loading
            </div>
            <div className="mt-1 text-xl font-semibold text-slate-900">
              Telecom Beacon
            </div>
            <div className="mt-1 text-sm text-slate-500">
              Preparing your telecom workspace
            </div>
          </div>
        </div>

        <div className="space-y-3 rounded-[1.5rem] border border-slate-100 bg-slate-50/80 p-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="loading-bar h-full w-2/3 rounded-full bg-[#f3cf72]" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="h-12 rounded-2xl bg-white/90 ring-1 ring-slate-200/80 animate-pulse" />
            <div className="h-12 rounded-2xl bg-white/90 ring-1 ring-slate-200/80 animate-pulse [animation-delay:150ms]" />
            <div className="h-12 rounded-2xl bg-white/90 ring-1 ring-slate-200/80 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
          <span>Preparing data</span>
          <span>One moment</span>
        </div>
      </div>
    </div>
  );
}
