"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import IngestForm from "@/components/ingest-form";
import type { DashboardSnapshot, Site360, SpendTower } from "@/lib/telecom/types";

type Props = {
  snapshot: DashboardSnapshot;
  view?: DashboardView;
};

type DashboardView =
  | "executive"
  | "inputs"
  | "classification"
  | "inventory"
  | "billing"
  | "benchmark"
  | "renewals"
  | "review"
  | "ingestion"
  | "admin";

type ThemeMode = "dark" | "light";

const navItems: Array<{ href: string; label: string; view: DashboardView }> = [
  { href: "/", label: "Dashboard", view: "executive" },
  { href: "/inputs", label: "Inputs", view: "inputs" },
  { href: "/classification", label: "Network Optimization", view: "classification" },
  { href: "/billing", label: "Billing Errors", view: "billing" },
  { href: "/benchmark", label: "Market Price Mismatch", view: "benchmark" },
];

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(value);
}

function moneyExact(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function integer(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function toneClass(tone: string) {
  switch (tone) {
    case "emerald":
      return "text-slate-900 bg-[#f7e7a1] ring-[#f3cf72]/50";
    case "amber":
      return "text-slate-900 bg-[#f5d980] ring-[#f3cf72]/50";
    case "sky":
      return "text-slate-900 bg-[#f8ecd0] ring-[#f3cf72]/45";
    case "rose":
      return "text-slate-900 bg-[#fff3cf] ring-[#f3cf72]/45";
    default:
      return "text-slate-900 bg-white/90 ring-slate-300/60";
  }
}

function towerDisplayLabel(tower: SpendTower) {
  switch (tower) {
    case "Revenue-driving network":
      return "Core";
    case "SG&A telecom":
      return "Corporate";
    case "Shared":
      return "Shared";
    default:
      return tower;
  }
}

function viewLabel(view: DashboardView) {
  switch (view) {
    case "executive":
      return "Dashboard";
    case "inputs":
      return "Inputs";
    case "classification":
      return "Network Optimization";
    case "inventory":
      return "Network Inventory";
    case "billing":
      return "Billing Errors";
    case "benchmark":
      return "Market Price Mismatch";
    case "renewals":
      return "Renewals";
    case "review":
      return "Review";
    case "ingestion":
      return "Ingestion";
    case "admin":
      return "Admin";
    default:
      return "Dashboard";
  }
}

function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f3cf72] shadow-[0_10px_24px_rgba(243,207,114,0.35)]">
      <div className="grid grid-cols-2 gap-1">
        <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
        <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
      </div>
    </div>
  );
}

function NavIcon({ view, active }: { view: DashboardView; active: boolean }) {
  const stroke = active ? "#111827" : "#64748b";
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (view) {
    case "executive":
      return <svg {...common}><path d="M4 13h6V4H4zM14 20h6v-9h-6zM14 10h6V4h-6zM4 20h6v-3H4z"/></svg>;
    case "inputs":
      return <svg {...common}><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>;
    case "classification":
      return <svg {...common}><path d="M4 7h16"/><path d="M7 12h10"/><path d="M10 17h4"/></svg>;
    case "billing":
      return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>;
    case "benchmark":
      return <svg {...common}><path d="M4 19h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-3"/></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="8"/></svg>;
  }
}

function TopNav({
  activeView,
}: {
  activeView: DashboardView;
}) {
  return (
    <div className="flex h-full flex-col justify-between rounded-[2rem] border border-slate-200/90 bg-white/88 p-6 shadow-[0_28px_80px_rgba(148,163,184,0.2)] backdrop-blur">
      <div>
        <div className="flex items-center gap-3">
          <LogoMark />
          <div>
            <div className="text-lg font-semibold text-slate-900">
              Telecom Beacon
            </div>
            <div className="text-xs uppercase tracking-[0.28em] text-slate-400">
              Command center
            </div>
          </div>
        </div>
        <div className="mt-10 text-xs font-medium uppercase tracking-[0.26em] text-slate-400">Menu</div>
        <nav className="mt-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.view}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                  activeView === item.view
                    ? "border-[#f3cf72] bg-[#f7d77a] text-slate-900 shadow-[0_16px_30px_rgba(243,207,114,0.28)]"
                    : "border-transparent bg-transparent text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <NavIcon view={item.view} active={activeView === item.view} />
                {item.label}
              </Link>
            ))}
          </nav>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex h-full flex-col rounded-[2rem] border border-slate-200/90 bg-white/80 p-6 shadow-[0_24px_60px_rgba(148,163,184,0.18)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function InputsView({ snapshot }: { snapshot: DashboardSnapshot }) {
  return (
    <section className="space-y-5">
      <SectionCard title="Inputs" subtitle="Current sources">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.inputs_summary.counts.map((item) => (
            <div key={item.label} className="rounded-[1.8rem] border border-[#f3cf72]/35 bg-[#fffaf0] p-5 shadow-[0_14px_30px_rgba(243,207,114,0.14)]">
              <div className="text-xs uppercase tracking-[0.28em] text-slate-400">{item.label}</div>
              <div className="mt-3 text-3xl font-semibold text-slate-900">{integer(item.value)}</div>
              <div className="mt-2 text-xs text-slate-500">{item.note}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          <SectionCard title="Upload workspace" subtitle="Contracts, invoices, AP">
            <IngestForm />
          </SectionCard>

          <SectionCard title="Connectors" subtitle="Coming soon">
            <div className="grid gap-3 sm:grid-cols-2">
              {snapshot.inputs_summary.connectors_coming_soon.map((group) => (
                <div key={group.group} className="rounded-[1.8rem] border border-[#f3cf72]/35 bg-[#fffaf0] p-4 shadow-[0_14px_28px_rgba(243,207,114,0.10)]">
                  <div className="text-sm font-medium text-slate-900">{group.group}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">Future integrations</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <span key={item} className="rounded-full border border-[#f3cf72]/35 bg-[#fff3cf] px-3 py-1 text-xs text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </SectionCard>
    </section>
  );
}

function WaterfallChart({
  steps,
  theme,
}: {
  steps: DashboardSnapshot["waterfall_bridge"];
  theme: ThemeMode;
}) {
  type WaterfallDatum = {
    label: string;
    subLabel?: string;
    kind: "start" | "reduction" | "end";
    tone: "emerald" | "amber" | "sky" | "rose" | "slate";
    theme: ThemeMode;
    base: number;
    delta: number;
    displayValue: string;
  };

  const chartData: WaterfallDatum[] = [];
  let runningValue = steps[0]?.value ?? 0;

  steps.forEach((step, index) => {
    if (index === 0) {
      chartData.push({
        label: step.label,
        kind: step.kind,
        tone: step.tone,
        theme,
        base: 0,
        delta: step.value,
        displayValue: moneyExact(step.value),
      });
      return;
    }

    if (index === steps.length - 1) {
      chartData.push({
        label: step.label,
        kind: step.kind,
        tone: step.tone,
        theme,
        base: 0,
        delta: runningValue,
        displayValue: moneyExact(runningValue),
      });
      return;
    }

    const endValue = Math.max(runningValue - step.value, 0);
    chartData.push({
      label: step.label,
      subLabel:
        step.label === "Billing errors"
          ? "One time"
          : step.label === "Network optimization" || step.label === "Market benchmarks"
            ? "Annualized"
            : undefined,
      kind: step.kind,
      tone: step.tone,
      theme,
      base: endValue,
      delta: step.value,
      displayValue: `-${moneyExact(step.value)}`,
    });
    runningValue = endValue;
  });

  return (
    <div className="flex h-full min-h-[640px] flex-col">
      <div
        className="flex-1 overflow-hidden rounded-3xl border"
        style={{
          borderColor: theme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.10)",
          background:
            theme === "light"
              ? "linear-gradient(180deg, rgba(255, 251, 235, 0.96) 0%, rgba(255, 255, 255, 0.96) 100%)"
              : "linear-gradient(180deg, rgba(2, 6, 23, 0.96) 0%, rgba(15, 23, 42, 0.94) 100%)",
        }}
      >
        <div className="flex h-full min-w-0 items-end px-4 pb-4 pt-4">
          <div className="h-[500px] min-w-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 44, right: 24, left: 28, bottom: 92 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke={theme === "light" ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.14)"} strokeDasharray="4 6" />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={<WaterfallAxisTick theme={theme} />}
              height={92}
              tickMargin={18}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme === "light" ? "#475569" : "#cbd5e1", fontSize: 12 }}
              tickFormatter={(value) => moneyExact(Number(value))}
              width={98}
              domain={[0, "dataMax"]}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                background: theme === "light" ? "#ffffff" : "#020617",
                border: theme === "light" ? "1px solid rgba(15,23,42,0.08)" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                color: theme === "light" ? "#0f172a" : "#e2e8f0",
              }}
              formatter={(value: unknown, name, item) => {
                if (name === "delta") return [moneyExact(Number(value)), item?.payload?.kind === "reduction" ? "Savings" : "Amount"];
                return [String(value), String(name)];
              }}
            />
            <Bar dataKey="base" stackId="wf" fill="transparent" isAnimationActive={false} />
            <Bar dataKey="delta" stackId="wf" shape={<WaterfallBarShape />} isAnimationActive={false}>
              <LabelList
                dataKey="displayValue"
                position="top"
                fill={theme === "light" ? "#0f172a" : "#ffffff"}
                style={{ fontWeight: 600, fontSize: 13 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function TowerDonuts({
  rows,
  financials,
  theme,
}: {
  rows: DashboardSnapshot["tower_spend"];
  financials: DashboardSnapshot["portfolio_financials"];
  theme: ThemeMode;
}) {
  const spendByTower = new Map(rows.map((row) => [row.tower, row]));
  const totalSavings = financials.total_opportunity || 0;

  const donuts = [
    {
      tower: "Revenue-driving network" as const,
      amount: spendByTower.get("Revenue-driving network")?.amount ?? 0,
      share: spendByTower.get("Revenue-driving network")?.share ?? 0,
    },
    {
      tower: "Shared" as const,
      amount: spendByTower.get("Shared")?.amount ?? 0,
      share: spendByTower.get("Shared")?.share ?? 0,
    },
    {
      tower: "SG&A telecom" as const,
      amount: spendByTower.get("SG&A telecom")?.amount ?? 0,
      share: spendByTower.get("SG&A telecom")?.share ?? 0,
    },
  ];

  const chartData = donuts.map((donut) => {
    const allocatedSavings = totalSavings * donut.share;
    return {
      name: towerDisplayLabel(donut.tower),
      spendValue: donut.amount,
      savingsValue: allocatedSavings,
    };
  });

  return (
    <div
      className="flex h-full min-h-[640px] flex-col overflow-hidden rounded-[28px] border shadow-[0_20px_60px_rgba(0,0,0,0.34)]"
      style={{
        borderColor: theme === "light" ? "rgba(15, 23, 42, 0.08)" : "rgba(255, 255, 255, 0.10)",
        background:
          theme === "light"
            ? "linear-gradient(180deg, rgba(255, 251, 235, 0.96) 0%, rgba(255, 255, 255, 0.96) 100%)"
            : "linear-gradient(180deg, rgba(2, 6, 23, 0.96) 0%, rgba(15, 23, 42, 0.94) 100%)",
      }}
    >
      <div className="border-b px-5 py-5" style={{ borderColor: theme === "light" ? "rgba(15,23,42,0.06)" : "rgba(255,255,255,0.06)" }}>
        <div className="text-lg font-semibold" style={{ color: theme === "light" ? "#0f172a" : "#f8fafc" }}>Spend mix by category</div>
        <div className="mt-1 text-xs" style={{ color: theme === "light" ? "#64748b" : "#cbd5e1" }}>Spend and savings by category</div>
      </div>

      <div className="flex-1 min-h-0 min-w-0 px-4 py-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 18, right: 12, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="spend-fill" x1="0%" x2="0%" y1="100%" y2="0%">
                <stop offset="0%" stopColor={theme === "light" ? "#f5d980" : "#0f172a"} />
                <stop offset="100%" stopColor={theme === "light" ? "#f3cf72" : "#2563eb"} />
              </linearGradient>
              <linearGradient id="savings-fill" x1="0%" x2="0%" y1="100%" y2="0%">
                <stop offset="0%" stopColor={theme === "light" ? "#d6a629" : "#1d4ed8"} />
                <stop offset="100%" stopColor={theme === "light" ? "#fde68a" : "#7dd3fc"} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={theme === "light" ? "rgba(148,163,184,0.18)" : "rgba(148,163,184,0.12)"} strokeDasharray="3 4" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme === "light" ? "#334155" : "#cbd5e1", fontSize: 12 }}
              interval={0}
            />
            <YAxis
              domain={[0, "dataMax"]}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) => money(Math.round(Number(value)))}
              tick={{ fill: theme === "light" ? "#64748b" : "#94a3b8", fontSize: 12 }}
              width={72}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                background: theme === "light" ? "#ffffff" : "#020617",
                border: theme === "light" ? "1px solid rgba(15,23,42,0.08)" : "1px solid rgba(255,255,255,0.12)",
                borderRadius: 16,
                color: theme === "light" ? "#0f172a" : "#e2e8f0",
              }}
              formatter={(value: unknown, name) => {
                if (name === "spendValue") return [moneyExact(Number(value)), "Spend"];
                if (name === "savingsValue") return [moneyExact(Number(value)), "Annualized savings"];
                return [String(value), String(name)];
              }}
              labelFormatter={(label) => String(label)}
            />
            <Bar dataKey="spendValue" stackId="spend" radius={[0, 0, 12, 12]} maxBarSize={156}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill="url(#spend-fill)" />
              ))}
            </Bar>
            <Bar dataKey="savingsValue" stackId="spend" radius={[12, 12, 0, 0]} maxBarSize={156}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill="url(#savings-fill)" />
              ))}
              <LabelList
                dataKey="savingsValue"
                position="top"
                formatter={(value: unknown) => moneyExact(Number(value))}
                fill={theme === "light" ? "#0f172a" : "#dbeafe"}
                style={{ fontWeight: 700, fontSize: 14 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function BenchmarkRangeBar({
  minimum,
  p25,
  median,
  p75,
  maximum,
  paidAmount,
}: {
  minimum: number;
  p25: number;
  median: number;
  p75: number;
  maximum: number;
  paidAmount: number;
}) {
  const span = Math.max(maximum - minimum, 1);
  const position = (value: number) => ((value - minimum) / span) * 100;
  const safePosition = (value: number) => Math.max(2, Math.min(98, position(value)));

  const tick = (label: string, value: number) => {
    const left = safePosition(value);
    const alignClass = left <= 3 ? "items-start" : left >= 97 ? "items-end" : "items-center";
    const translate = left <= 3 ? "translate-x-0" : left >= 97 ? "-translate-x-full" : "-translate-x-1/2";
    return (
      <div key={label} className={`absolute top-1 flex ${translate} ${alignClass} flex-col`} style={{ left: `${left}%` }}>
        <div className="rounded-full bg-[#f3cf72] px-2 py-0.5 text-[11px] font-semibold text-slate-900 shadow-sm">{label}</div>
        <div className="mt-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700 shadow-sm ring-1 ring-[#ead7a0]">{moneyExact(value)}</div>
      </div>
    );
  };

  const paidPos = safePosition(paidAmount);

  return (
    <div className="relative h-28 rounded-2xl border border-[#f3cf72]/30 bg-[#fffaf0] px-4 pt-3">
      <div className="absolute left-4 right-4 top-12 h-4 rounded-full bg-[#f4ead3]" />
      <div
        className="absolute top-11 h-6 rounded-full bg-gradient-to-r from-[#f8e3a6] via-[#f3cf72] to-[#e0b94a] shadow-[0_0_0_1px_rgba(15,23,42,0.04)]"
        style={{ left: `${safePosition(minimum)}%`, width: `${Math.max(safePosition(maximum) - safePosition(minimum), 4)}%` }}
      />
      <div className="absolute top-2 z-20 h-18 w-[4px] -translate-x-1/2 rounded-full bg-slate-900 shadow-[0_0_0_3px_rgba(255,255,255,0.9)]" style={{ left: `${paidPos}%` }} />
      <div className="absolute -top-3 z-30 -translate-x-1/2 rounded-full border border-[#f3cf72]/70 bg-[#fffdf5] px-3 py-1 text-[11px] font-semibold text-slate-900 shadow-[0_10px_26px_rgba(15,23,42,0.12)]" style={{ left: `${paidPos}%` }}>
        Paid {moneyExact(paidAmount)} · {Math.round(paidPos)}%ile
      </div>
      {tick("Min", minimum)}
      {tick("P25", p25)}
      {tick("Median", median)}
      {tick("P75", p75)}
      {tick("Max", maximum)}
    </div>
  );
}

function WaterfallBarShape(props: {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: { tone?: string; kind?: string; theme?: ThemeMode };
}) {
  const { x, y, width, height, payload } = props;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof width !== "number" ||
    typeof height !== "number" ||
    height <= 0
  ) {
    return null;
  }

  const fillColor =
    payload?.theme === "light"
      ? payload?.kind === "reduction"
        ? "#f3cf72"
        : payload?.tone === "rose"
          ? "#f8d880"
          : "#d9dee8"
      : payload?.tone === "emerald"
        ? "#22d3ee"
        : payload?.tone === "amber"
          ? "#38bdf8"
          : payload?.tone === "sky"
            ? "#60a5fa"
            : payload?.tone === "rose"
              ? "#818cf8"
              : "#94a3b8";

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx={16} fill={fillColor} opacity={payload?.kind === "reduction" ? 0.82 : 1} />
      <rect
        x={x + 2}
        y={y + 2}
        width={Math.max(width - 4, 0)}
        height={Math.max(height - 4, 0)}
        rx={14}
        fill="transparent"
        stroke={payload?.theme === "light" ? "rgba(15,23,42,0.08)" : payload?.kind === "reduction" ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)"}
        strokeWidth="1"
      />
    </g>
  );
}

function WaterfallAxisTick({
  x,
  y,
  payload,
  theme,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string; payload?: { label?: string; subLabel?: string; theme?: ThemeMode } };
  theme?: ThemeMode;
}) {
  const item = payload?.payload;
  const label = item?.label ?? payload?.value;
  if (typeof x !== "number" || typeof y !== "number" || !label) return null;
  const isLight = theme === "light" || item?.theme === "light";
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="middle"
        fill={isLight ? "#020617" : "#cbd5e1"}
        fontSize="13"
        fontWeight="800"
        opacity="1"
        style={{ paintOrder: "stroke", stroke: isLight ? "#ffffff" : "#0f172a", strokeWidth: 0.25 }}
        y={20}
      >
        {label}
      </text>
      {item?.subLabel ? (
        <text
          textAnchor="middle"
          fill={isLight ? "#78350f" : "#a5f3fc"}
          fontSize="11"
          fontWeight="800"
          opacity="1"
          style={{ paintOrder: "stroke", stroke: isLight ? "#ffffff" : "#0f172a", strokeWidth: 0.2 }}
          y={38}
        >
          {item.subLabel}
        </text>
      ) : null}
    </g>
  );
}

function NetworkOptimizationView({ snapshot }: { snapshot: DashboardSnapshot }) {
  const total = snapshot.network_optimization_sites.reduce((sum, site) => sum + site.site_savings, 0);
  const sitesWithSavings = snapshot.network_optimization_sites.filter((site) => site.site_savings > 0).length;
  const servicesWithSavings = snapshot.network_optimization_sites.reduce((sum, site) => sum + site.services.length, 0);
  const totalSpend = snapshot.portfolio_financials.contract_spend;

  return (
    <SectionCard title="Network Optimization" subtitle="Site by site, service by service">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricPill label="Network bucket" value={moneyExact(total)} delta={`${Math.round((total / Math.max(totalSpend, 1)) * 100)}% of spend`} tone="sky" />
        <MetricPill label="Sites with action" value={integer(sitesWithSavings)} delta={`${integer(snapshot.network_optimization_sites.length)} sites modeled`} tone="emerald" />
        <MetricPill label="Services reviewed" value={integer(servicesWithSavings)} delta="Ranked by utilization and role" tone="slate" />
      </div>

      <div className="mt-4 max-h-[980px] space-y-3 overflow-auto pr-1">
        {snapshot.network_optimization_sites.map((site) => (
          <details key={site.site_id} className="group rounded-3xl border border-white/10 bg-slate-950/70 p-4">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-200">{site.site_name}</div>
                  <div className="mt-1 text-sm text-slate-200">{site.archetype} · {site.country} · {site.service_count} services</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-cyan-100">{moneyExact(site.site_savings)}</div>
                  <div className="text-xs text-slate-200">site savings</div>
                </div>
              </div>
            </summary>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-slate-950/90 text-xs uppercase tracking-[0.2em] text-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Network type</th>
                    <th className="px-4 py-3 text-left">Utilization</th>
                    <th className="px-4 py-3 text-left">Recommendation</th>
                    <th className="px-4 py-3 text-right">Savings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/5">
                  {site.services.map((service) => (
                    <tr key={service.service_id} className="align-top">
                      <td className="px-4 py-3 text-white">
                        <div className="font-medium">{service.category}</div>
                        <div className="mt-1 text-xs text-slate-200">{service.status} · {service.primary_or_backup_role} · {service.sla_tier}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">
                        <div>{service.access_type}</div>
                        <div className="mt-1 text-xs text-slate-200">{service.routing_diversity}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-200">{percent(service.utilization)}</td>
                      <td className="px-4 py-3 text-slate-200">{service.recommendation}</td>
                      <td className="px-4 py-3 text-right text-cyan-100">{moneyExact(service.annualized_savings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </SectionCard>
  );
}

function BillingErrorsView({ snapshot }: { snapshot: DashboardSnapshot }) {
  const total = snapshot.billing_invoice_details.reduce((sum, invoice) => sum + invoice.recoverable_amount, 0);
  const invoices = snapshot.billing_invoice_details.length;
  const lines = snapshot.billing_invoice_details.reduce((sum, invoice) => sum + invoice.line_count, 0);

  return (
    <SectionCard title="Billing Errors" subtitle="Invoice by invoice">
      <div className="grid gap-3 md:grid-cols-3">
        <MetricPill label="Billing bucket" value={moneyExact(total)} delta={`${invoices} invoices modeled`} tone="sky" />
        <MetricPill label="Invoices flagged" value={integer(invoices)} delta={`${integer(lines)} lines reviewed`} tone="emerald" />
        <MetricPill label="Recoverable share" value={`${Math.round((total / Math.max(snapshot.portfolio_financials.total_opportunity, 1)) * 100)}%`} delta="Bucket aligned" tone="slate" />
      </div>

      <div className="mt-4 max-h-[980px] space-y-3 overflow-auto pr-1">
        {snapshot.billing_invoice_details.slice(0, 40).map((invoice) => (
          <details key={invoice.invoice_id} className="group rounded-3xl border border-white/10 bg-slate-950/70 p-4" open={invoice.recoverable_amount > total * 0.04}>
            <summary className="cursor-pointer list-none">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-200">{invoice.invoice_id}</div>
                  <div className="mt-1 text-sm text-slate-200">{invoice.site_name} · {invoice.supplier_name} · {invoice.line_count} lines</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-cyan-100">{moneyExact(invoice.recoverable_amount)}</div>
                  <div className="text-xs text-slate-200">recoverable</div>
                </div>
              </div>
            </summary>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl bg-slate-950/80 p-3 text-sm text-slate-200">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-200">Billed</div>
                <div className="mt-1 text-white">{moneyExact(invoice.billed_amount)}</div>
              </div>
              <div className="rounded-2xl bg-slate-950/80 p-3 text-sm text-slate-200">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-200">Expected</div>
                <div className="mt-1 text-white">{moneyExact(invoice.expected_amount)}</div>
              </div>
              <div className="rounded-2xl bg-slate-950/80 p-3 text-sm text-slate-200">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-200">Variance</div>
                <div className="mt-1 text-white">{moneyExact(invoice.variance_amount)}</div>
              </div>
              <div className="rounded-2xl bg-slate-950/80 p-3 text-sm text-slate-200">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-200">Note</div>
                <div className="mt-1 text-white">{invoice.note}</div>
              </div>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-slate-950/90 text-xs uppercase tracking-[0.2em] text-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left">Line</th>
                    <th className="px-4 py-3 text-left">Service</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Expected</th>
                    <th className="px-4 py-3 text-right">Variance</th>
                    <th className="px-4 py-3 text-right">Recoverable</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-white/5">
                  {invoice.lines.map((line) => (
                    <tr key={line.invoice_line_id}>
                      <td className="px-4 py-3 text-slate-200">{line.line_description}</td>
                      <td className="px-4 py-3 text-slate-200">{line.service_id}</td>
                      <td className="px-4 py-3 text-slate-200">
                        <div>{line.payment_status}</div>
                        <div className="mt-1 text-xs text-slate-200">{line.duplicate_charge ? "Duplicate" : "Matched"}</div>
                      </td>
                      <td className="px-4 py-3 text-right text-white">{moneyExact(line.amount)}</td>
                      <td className="px-4 py-3 text-right text-white">{moneyExact(line.expected_amount)}</td>
                      <td className="px-4 py-3 text-right text-white">{moneyExact(line.variance_amount)}</td>
                      <td className="px-4 py-3 text-right text-cyan-100">{moneyExact(line.recoverable_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </SectionCard>
  );
}

function MarketPriceMismatchView({ snapshot }: { snapshot: DashboardSnapshot }) {
  const paidTotal = snapshot.benchmark_service_details.reduce((sum, row) => sum + row.paid_amount, 0);
  const benchmarkMedianTotal = snapshot.benchmark_service_details.reduce((sum, row) => sum + row.median, 0);
  const serviceCount = snapshot.benchmark_service_details.length;
  const categories = new Set(snapshot.benchmark_service_details.map((row) => row.service_type)).size;
  const benchmarkSavingsTotal = snapshot.benchmark_service_details.reduce((sum, row) => sum + row.savings_opportunity, 0);
  const benchmarkAverageMedian = benchmarkMedianTotal / Math.max(serviceCount, 1);

  return (
    <SectionCard title="Market Price Mismatch" subtitle="Paid vs benchmark">
      <div className="grid gap-3 md:grid-cols-4">
        <MetricPill label="Paid annualized" value={moneyExact(paidTotal)} delta={`${serviceCount} services modeled`} tone="sky" />
        <MetricPill label="Benchmark reference total" value={moneyExact(benchmarkMedianTotal)} delta={`${moneyExact(benchmarkAverageMedian)} avg / service · ${categories} service types`} tone="emerald" />
        <MetricPill label="Services reviewed" value={integer(serviceCount)} delta={`${categories} service types`} tone="emerald" />
        <MetricPill label="Benchmark savings" value={moneyExact(benchmarkSavingsTotal)} delta="Paid minus benchmark median" tone="slate" />
      </div>

      <div className="mt-4 max-h-[980px] space-y-3 overflow-auto pr-1">
        {snapshot.benchmark_service_details.slice(0, 60).map((row) => (
          <div key={row.service_id} className="group relative rounded-3xl border border-slate-200 bg-white/85 p-4 shadow-[0_16px_40px_rgba(148,163,184,0.10)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-700">{row.service_type}</div>
                <div className="mt-1 text-sm text-slate-700">{row.site_name} · {row.location}</div>
              </div>
              <button
                type="button"
                className="rounded-full border border-[#f3cf72]/70 bg-[#fff3cf] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a6d06] transition hover:bg-[#f8e3a6]"
                aria-label="Show vendor benchmark comparison"
              >
                Benchmark link
              </button>
            </div>
            <div className="mt-4">
              <BenchmarkRangeBar
                minimum={row.minimum}
                p25={row.p25}
                median={row.median}
                p75={row.p75}
                maximum={row.maximum}
                paidAmount={row.paid_amount}
              />
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-[#fffaf0] p-3 text-slate-700">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Paid annualized</div>
                <div className="mt-1 text-slate-900">{moneyExact(row.paid_amount)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#fffaf0] p-3 text-slate-700">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Benchmark median</div>
                <div className="mt-1 text-slate-900">{moneyExact(row.median)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#fffaf0] p-3 text-slate-700">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Raw gap</div>
                <div className="mt-1 text-slate-900">{moneyExact(row.raw_gap)}</div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-[#fffaf0] p-3 text-slate-700 md:col-span-3">
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Benchmark source</div>
                <div className="mt-1 text-slate-900">{row.benchmark_source}</div>
              </div>
            </div>
            <div className="pointer-events-none absolute right-4 top-14 z-20 hidden w-[360px] rounded-3xl border border-[#f3cf72]/50 bg-[#fffdf5] p-4 shadow-[0_22px_50px_rgba(214,166,41,0.16)] group-hover:block group-focus-within:block">
              <div className="text-xs uppercase tracking-[0.2em] text-[#9a6d06]">Vendor benchmark</div>
              <div className="mt-2 space-y-2">
                {row.vendor_comparison.map((vendor) => (
                  <div
                    key={`${row.service_id}-${vendor.vendor_name}-${vendor.position_label}`}
                    className={`rounded-2xl border px-3 py-2 ${vendor.is_current ? "border-[#f3cf72]/70 bg-[#fff3cf]" : "border-slate-200 bg-white"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{vendor.vendor_name}</div>
                        <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">{vendor.position_label}</div>
                      </div>
                      <div className="text-sm font-semibold text-[#9a6d06]">{moneyExact(vendor.paid_amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 rounded-2xl border border-[#f3cf72]/40 bg-[#fff3cf] px-3 py-2 text-xs text-slate-700">
                Compare the current supplier against peer supplier averages for the same service type and location.
              </div>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}

function MetricPill({ label, value, delta, tone }: DashboardSnapshot["kpis"][number]) {
  return (
    <div className={`rounded-[1.8rem] border ring-1 shadow-[0_10px_30px_rgba(148,163,184,0.12)] ${toneClass(tone)} p-5`}>
      <div className="text-xs font-medium uppercase tracking-[0.2em] text-inherit/70">{label}</div>
      <div className="mt-3 text-[2rem] font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-inherit/80">{delta}</div>
    </div>
  );
}

function SiteDetailPanel({ site }: { site: Site360 }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="text-xs uppercase tracking-[0.2em] text-slate-200">Site detail</div>
        <h3 className="mt-1 text-2xl font-semibold text-white">{site.site_name}</h3>
        <p className="mt-1 text-sm text-slate-200">
          {site.archetype} · {site.country} · criticality {site.criticality} · {site.tower}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl bg-slate-950/70 p-3 text-sm">
          <div className="text-slate-200">Annual spend</div>
          <div className="mt-1 text-white">{moneyExact(site.annual_spend)}</div>
        </div>
        <div className="rounded-2xl bg-slate-950/70 p-3 text-sm">
          <div className="text-slate-200">Annual opportunity</div>
          <div className="mt-1 text-cyan-200">{moneyExact(site.annual_opportunity)}</div>
        </div>
        <div className="rounded-2xl bg-slate-950/70 p-3 text-sm">
          <div className="text-slate-200">Services</div>
          <div className="mt-1 text-white">{integer(site.service_count)}</div>
        </div>
        <div className="rounded-2xl bg-slate-950/70 p-3 text-sm">
          <div className="text-slate-200">Business purpose</div>
          <div className="mt-1 text-white">{towerDisplayLabel(site.tower)}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {site.opportunity_breakdown.map((bucket) => (
          <div key={bucket.bucket} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-white">{bucket.bucket}</div>
              <div className="text-xs text-slate-200">{percent(bucket.share)}</div>
            </div>
            <div className="mt-2 text-sky-100 text-xl font-semibold">{moneyExact(bucket.amount)}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-medium text-white">Service inventory</div>
          <div className="text-xs text-slate-200">
            Showing {integer(site.services.length)} of {integer(site.service_count)} services
          </div>
        </div>
        <div className="mt-3 max-h-[320px] space-y-2 overflow-auto pr-1">
          {site.services.map((service) => (
            <div key={service.service_id} className="rounded-2xl border border-white/10 bg-slate-950/80 p-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-white">{service.category}</div>
                <div className="text-slate-200">{moneyExact(service.monthly_rate)}/mo</div>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-200">
                <span>{service.status}</span>
                <span>Utilization {percent(service.utilization)}</span>
                <span>{service.contract_id}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteNetworkMap({
  sites,
  onSelect,
}: {
  sites: Site360[];
  onSelect: (site: Site360) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const onSelectRef = useRef(onSelect);
  const [loading, setLoading] = useState(true);
  const sortedSites = useMemo(() => [...sites].sort((a, b) => b.annual_spend - a.annual_spend), [sites]);
  const maxSpend = useMemo(() => Math.max(...sortedSites.map((site) => site.annual_spend), 1), [sortedSites]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    let isCancelled = false;
    let mapInstance: import("leaflet").Map | null = null;
    let markerLayer: import("leaflet").LayerGroup | null = null;
    let tileLayer: import("leaflet").TileLayer | null = null;

    async function init() {
      const leafletModule = await import("leaflet");
      const L = (leafletModule as typeof import("leaflet") & { default?: typeof import("leaflet") }).default ?? leafletModule;

      if (isCancelled || !mapRef.current) {
        return;
      }

      mapRef.current.innerHTML = "";
      setLoading(true);

      const map = L.map(mapRef.current, {
        center: [18, 5],
        zoom: 2,
        minZoom: 2,
        maxZoom: 9,
        zoomControl: true,
        worldCopyJump: true,
      });
      mapInstance = map;

      tileLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 9,
        minZoom: 2,
        attribution: "&copy; OpenStreetMap contributors",
      });

      tileLayer.on("load", () => setLoading(false));
      tileLayer.on("tileerror", () => setLoading(false));
      tileLayer.addTo(map);

      const points = sortedSites.map((site) => ({
        site,
        latlng: L.latLng(site.latitude, site.longitude),
        radius: 7 + Math.sqrt(site.annual_spend / maxSpend) * 14,
      }));

      if (points.length > 0) {
        map.fitBounds(L.latLngBounds(points.map((point) => point.latlng)).pad(0.12));
      }

      markerLayer = L.layerGroup().addTo(map);
      const fillForTower = (tower: SpendTower) => {
        if (tower === "Revenue-driving network") return "#38bdf8";
        if (tower === "SG&A telecom") return "#34d399";
        return "#f59e0b";
      };

      for (const point of points) {
        const fill = fillForTower(point.site.tower);
        const marker = L.circleMarker(point.latlng, {
          radius: point.radius,
          color: fill,
          weight: 1.5,
          fillColor: fill,
          fillOpacity: 0.86,
          opacity: 0.98,
        }).addTo(markerLayer);

        marker.bindTooltip(
          `${point.site.site_name}<br />${moneyExact(point.site.annual_spend)} annual spend`,
          { direction: "top", sticky: true, opacity: 0.95 },
        );

        marker.on("click", () => onSelectRef.current(point.site));
      }

      requestAnimationFrame(() => {
        if (!isCancelled) {
          map.invalidateSize();
        }
      });
    }

    init();

    return () => {
      isCancelled = true;
      if (markerLayer) {
        markerLayer.clearLayers();
      }
      if (tileLayer) {
        tileLayer.off();
        if (mapInstance) {
          try {
            mapInstance.removeLayer(tileLayer);
          } catch {}
        }
      }
      if (mapInstance) {
        mapInstance.off();
        try {
          mapInstance.remove();
        } catch {}
      }
    };
  }, [maxSpend, sortedSites]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white">World site map</div>
          <div className="text-xs text-slate-200">Zoom, pan, click markers.</div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-200">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">200 sites</span>
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-sky-100">Leaflet map</span>
          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-cyan-100">Click-drill</span>
        </div>
      </div>

      <div className="relative h-[780px] overflow-hidden rounded-[28px] border border-white/10 bg-slate-950">
        <div ref={mapRef} className="h-full w-full" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-2 text-xs text-slate-200 shadow-2xl backdrop-blur">
          Drag to pan. Zoom with wheel.
        </div>
        {loading ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-950/60 text-sm text-slate-200">
            Loading world map...
          </div>
        ) : null}
      </div>
    </div>
  );
}

function SiteDetailModal({
  site,
  onClose,
}: {
  site?: Site360;
  onClose: () => void;
}) {
  if (!site) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-6 backdrop-blur"
      onClick={(event) => {
        if (event.currentTarget === event.target) {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-5xl rounded-[32px] border border-white/10 bg-slate-950 p-5 pt-14 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-slate-200 transition hover:bg-white/10"
        >
          Close
        </button>
        <div className="mb-4">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-200">Site modal</div>
        </div>
        <SiteDetailPanel site={site} />
      </div>
    </div>
  );
}

export default function TelecomDashboard({ snapshot, view = "executive" }: Props) {
  const [selectedSite, setSelectedSite] = useState(snapshot.sites[0]);
  const [siteModalOpen, setSiteModalOpen] = useState(false);
  const theme: ThemeMode = "light";

  const content = (() => {
    switch (view) {
      case "inputs":
        return <InputsView snapshot={snapshot} />;
      case "classification":
        return <NetworkOptimizationView snapshot={snapshot} />;
      case "inventory":
        return (
          <SectionCard title="Network Inventory Workbench" subtitle={`Top ${integer(snapshot.inventory_exceptions.length)} exception cases`}>
            <div className="grid gap-3 lg:grid-cols-2">
              {snapshot.inventory_exceptions.map((row) => (
                <button key={row.service_id} type="button" onClick={() => { const selected = snapshot.sites.find((site) => site.site_name === row.site_name); if (selected) { setSelectedSite(selected); setSiteModalOpen(true); } }} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-sky-400/40 hover:bg-slate-950">
                  <div className="flex items-center justify-between gap-3"><div className="font-medium text-white">{row.exception_state}</div><div className="text-xs text-slate-200">{money(row.monthly_rate)}/mo</div></div>
                  <div className="mt-2 text-sm text-slate-200">{row.site_name}</div>
                  <div className="mt-2 text-xs text-slate-200">{row.supplier_name} · {row.contract_id}</div>
                </button>
              ))}
            </div>
          </SectionCard>
        );
      case "billing":
        return <BillingErrorsView snapshot={snapshot} />;
      case "benchmark":
        return <MarketPriceMismatchView snapshot={snapshot} />;
      case "renewals":
        return (
          <SectionCard title="Contract and Renewal Cockpit" subtitle="Renewal timing and clause risk">
            <div className="grid gap-3 lg:grid-cols-2">
              {snapshot.renewals.map((renewal) => (
                <div key={renewal.contract_id} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div><div className="font-medium text-white">{renewal.supplier_name}</div><div className="text-xs text-slate-200">{renewal.site_name}</div></div>
                    <div className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-100">{renewal.days_to_renewal} days</div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-950/70 p-3 text-slate-200"><div className="text-xs">Annual spend</div><div className="mt-1 text-white">{money(renewal.annual_spend)}</div></div>
                    <div className="rounded-2xl bg-slate-950/70 p-3 text-slate-200"><div className="text-xs">Clause risk</div><div className="mt-1 text-white">{renewal.clause_risk}</div></div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      case "review":
        return (
          <SectionCard title="Analyst Review and Action Studio" subtitle="State counts and findings">
            <div className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
              <div className="grid gap-3">
                {snapshot.review_kanban.map((state) => (
                  <div key={state.state} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                    <div className="text-sm font-medium text-white">{state.state}</div>
                    <div className="mt-1 text-2xl font-semibold text-sky-200">{integer(state.count)}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {snapshot.findings.map((finding) => (
                  <button key={finding.finding_id} type="button" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 p-4 text-left transition hover:border-sky-400/40 hover:bg-slate-950">
                    <div className="flex flex-wrap items-center justify-between gap-3"><div className="font-medium text-white">{finding.finding_type}</div><div className="text-xs text-slate-200">{finding.review_status}</div></div>
                    <div className="mt-1 text-sm text-slate-200">{finding.site_name} · {finding.supplier_name}</div>
                    <div className="mt-2 text-sm text-sky-200">{money(finding.estimated_annualized_savings)} savings · {money(finding.one_time_recovery)} recovery</div>
                  </button>
                ))}
              </div>
            </div>
          </SectionCard>
        );
      case "ingestion":
        return (
          <SectionCard title="Data Ingestion and Synthetic Data" subtitle="Files, mapping, confidence">
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="text-sm font-medium text-white">Synthetic generation outputs</div>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  {snapshot.ingestion_summary.generated_assets.map((asset) => (<div key={asset} className="rounded-2xl bg-white/5 px-3 py-2 text-slate-200">{asset}</div>))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
                <div className="text-sm font-medium text-white">Ingestion posture</div>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  <div>Files: {snapshot.ingestion_summary.files.join(" · ")}</div>
                  <div>Mapped rows: {integer(snapshot.ingestion_summary.mapped_rows)}</div>
                  <div>Unmapped rows: {integer(snapshot.ingestion_summary.unmapped_rows)}</div>
                  <div>Confidence: {snapshot.ingestion_summary.confidence}%</div>
                </div>
              </div>
            </div>
          </SectionCard>
        );
      case "admin":
        return (
          <SectionCard title="Admin and Configuration" subtitle="Rules, confidence, settings">
            <div className="grid gap-3 lg:grid-cols-3">
              {snapshot.admin_summary.map((row) => (
                <div key={row.setting} className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
                  <div className="text-sm font-medium text-white">{row.setting}</div>
                  <div className="mt-2 text-sm text-slate-200">{row.value}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-200">{row.note}</div>
                </div>
              ))}
            </div>
          </SectionCard>
        );
      case "executive":
      default:
        return (
          <section className="space-y-4">
            <SectionCard title="Executive Command Center" subtitle="Savings, risk">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {snapshot.kpis.map((kpi) => (<MetricPill key={kpi.label} {...kpi} />))}
              </div>
              <div className="mt-5 grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
                <SectionCard title="Savings waterfall" subtitle="Savings bridge">
                  <WaterfallChart steps={snapshot.waterfall_bridge} theme={theme} />
                </SectionCard>
                <SectionCard title="Savings by spend category" subtitle="Annualized split">
                  <TowerDonuts rows={snapshot.tower_spend} financials={snapshot.portfolio_financials} theme={theme} />
                </SectionCard>
              </div>
              <div className="mt-5">
                <SectionCard title="Site Network Map" subtitle="Map, markers, drill-down">
                  <SiteNetworkMap
                    sites={snapshot.sites}
                    onSelect={(site) => {
                      setSelectedSite(site);
                      setSiteModalOpen(true);
                    }}
                  />
                </SectionCard>
              </div>
            </SectionCard>
          </section>
        );
    }
  })();

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.98),_rgba(240,240,235,1)_38%,_rgba(231,233,239,1)_100%)] text-slate-900 transition-colors duration-300"
    >
      <div className="mx-auto min-h-screen max-w-[1800px] px-4 py-6 xl:px-8">
        <div className="grid min-h-[calc(100vh-3rem)] gap-6 xl:grid-cols-[290px_1fr]">
          <aside className="xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)]">
            <TopNav activeView={view} />
          </aside>
          <main className="space-y-6">
            <section className="rounded-[2.2rem] border border-white/50 bg-white/68 px-8 py-7 shadow-[0_24px_60px_rgba(148,163,184,0.14)] backdrop-blur">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-sm font-medium uppercase tracking-[0.24em] text-slate-400">{viewLabel(view)}</div>
                  <div className="mt-5 text-2xl font-semibold text-slate-900">Hi Alex,</div>
                  <div className="text-6xl font-semibold tracking-[-0.04em] text-slate-950">Welcome back</div>
                  <div className="mt-3 max-w-2xl text-sm text-slate-500">
                    Telecom optimization across spend, billing, benchmarks, sites, and service intelligence.
                  </div>
                </div>
                <div className="flex min-w-[320px] items-center justify-between rounded-[2rem] border border-[#f3cf72]/40 bg-[#fff7dd] px-6 py-5 shadow-[0_18px_40px_rgba(243,207,114,0.18)]">
                  <div>
                    <div className="text-sm font-medium text-slate-500">Attention</div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">Savings review window open</div>
                    <div className="mt-1 text-sm text-slate-500">Network, billing, and benchmark actions are ready.</div>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f3cf72] text-2xl text-slate-900 shadow-[0_10px_24px_rgba(243,207,114,0.28)]">
                    !
                  </div>
                </div>
              </div>
            </section>
            <div className="space-y-4">
              {content}
            </div>
          </main>
        </div>
      </div>
      <SiteDetailModal site={siteModalOpen ? selectedSite : undefined} onClose={() => setSiteModalOpen(false)} />
    </div>
  );
}
