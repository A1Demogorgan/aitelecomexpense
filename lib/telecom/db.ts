import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import type {
  DashboardSnapshot,
  BenchmarkServiceDetail,
  BillingInvoiceDetail,
  FindingCard,
  Hotspot,
  NetworkOptimizationSite,
  Site360,
  SpendTower,
  TowerSpend,
  WaterfallBridgeStep,
} from "./types";
import { buildSeedDataset } from "./seed";

const DB_VERSION = 8;
const DB_DIR = process.env.TELECOM_DB_DIR ?? path.join(os.tmpdir(), "aitelecomexpense");
const DB_FILE = path.join(DB_DIR, "telecom-optimization.duckdb");
const SNAPSHOT_FILE = path.join(DB_DIR, "dashboard-snapshot.json");

type DatabaseHandle = {
  db: DuckDbDatabase;
  conn: DuckDbConnection;
};

let initPromise: Promise<DatabaseHandle> | null = null;

type DuckDbDatabase = {
  connect(): DuckDbConnection;
  close(cb?: (error?: Error | null) => void): void;
};

type DuckDbConnection = {
  run(sql: string, ...params: unknown[]): void;
  all(sql: string, ...params: unknown[]): void;
  prepare(sql: string): {
    run(...params: unknown[]): void;
    finalize(cb?: (error?: Error | null) => void): void;
  };
  close(cb?: (error?: Error | null) => void): void;
};

async function loadDuckDb(): Promise<{ Database: new (file: string) => DuckDbDatabase }> {
  const mod = await import("duckdb");
  return mod as unknown as { Database: new (file: string) => DuckDbDatabase };
}

async function openDb() {
  const duckdb = await loadDuckDb();
  fs.mkdirSync(DB_DIR, { recursive: true });
  return new duckdb.Database(DB_FILE);
}

function run(conn: DuckDbConnection, sql: string, params: unknown[] = []) {
  return new Promise<void>((resolve, reject) => {
    conn.run(sql, ...params, (error: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

function all<T = Record<string, unknown>>(conn: DuckDbConnection, sql: string, params: unknown[] = []) {
  return new Promise<T[]>((resolve, reject) => {
    conn.all(sql, ...params, (error: unknown, rows: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(rows as T[]);
    });
  });
}

async function first<T = Record<string, unknown>>(conn: DuckDbConnection, sql: string, params: unknown[] = []) {
  const rows = await all<T>(conn, sql, params);
  return rows[0];
}

function towerDisplayLabel(tower: string) {
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

function benchmarkServiceTypeForCategory(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("broadband")) return "Broadband";
  if (normalized.includes("sd-wan")) return "SD-WAN";
  if (normalized.includes("wan")) return "WAN";
  if (normalized.includes("dedicated internet") || normalized === "dia") return "DIA";
  if (normalized.includes("ethernet")) return "Ethernet";
  if (normalized.includes("wavelength")) return "Wavelength";
  if (normalized.includes("voice")) return "Fixed voice";
  if (normalized.includes("mobile")) return "Mobility";
  if (normalized.includes("collaboration")) return "Contact center";
  if (normalized.includes("colocation") || normalized.includes("colo")) return "Colocation";
  if (normalized.includes("interconnect") || normalized.includes("cross-connect")) return "Interconnect";
  if (normalized.includes("transport") || normalized.includes("fiber") || normalized.includes("backhaul")) return "Media-network transport";
  return "DIA";
}

function networkRecommendation(utilization: number, status: string, role: string) {
  if (status !== "Active") return "Remove or recover";
  if (role === "Backup" && utilization < 0.35) return "Retire backup";
  if (utilization < 0.2) return "Disconnect or downsize";
  if (utilization < 0.35) return "Right-size or reprice";
  if (utilization < 0.55) return "Renegotiate rate";
  return "Monitor";
}

function billingVarianceReason(duplicateCharge: boolean, paymentStatus: string, lineDescription: string) {
  if (duplicateCharge || paymentStatus === "Duplicate review") return "Duplicate charge";
  if (lineDescription.includes("Temporary")) return "Post-disconnect billing";
  return "Contract variance";
}

function prepareRun(conn: DuckDbConnection, sql: string) {
  const stmt = conn.prepare(sql);
  return {
    run: (...params: unknown[]) =>
      new Promise<void>((resolve, reject) => {
        stmt.run(...params, (error: unknown) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
    finalize: () =>
      new Promise<void>((resolve, reject) => {
        stmt.finalize((error: unknown) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
  };
}

function hashSeed(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed: string) {
  let state = hashSeed(seed) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const vendorUniverse = [
  "AT&T Business",
  "Verizon Business",
  "Lumen",
  "Comcast Business",
  "BT Global",
  "Orange Business",
  "Telstra",
  "Telefonica",
  "Zayo",
  "Equinix",
];

async function ensureSeeded(handle: DatabaseHandle) {
  try {
    const meta = await first<{ value: number }>(handle.conn, "SELECT CAST(value AS INTEGER) AS value FROM app_meta WHERE key = 'schema_version'");
    if (meta?.value === DB_VERSION) {
      return;
    }
  } catch {
    // If the DB is uninitialized or has an old schema, rebuild it from scratch.
  }

  if (fs.existsSync(DB_FILE)) {
    fs.unlinkSync(DB_FILE);
  }

  const freshDb = await openDb();
  const freshConn = freshDb.connect();
  handle.db = freshDb;
  handle.conn = freshConn;

  const seed = buildSeedDataset();
  await run(freshConn, "BEGIN TRANSACTION");

  await run(
    freshConn,
    `
      CREATE TABLE app_meta (key VARCHAR, value VARCHAR);
      CREATE TABLE sites (
        site_id VARCHAR,
        site_name VARCHAR,
        archetype VARCHAR,
        region VARCHAR,
        country VARCHAR,
        metro VARCHAR,
        site_type VARCHAR,
        criticality INTEGER,
        business_owner VARCHAR,
        revenue_sensitive BOOLEAN,
        resilience_required BOOLEAN,
        tower VARCHAR,
        primary_network_role VARCHAR,
        backup_network_role VARCHAR,
        cost_center VARCHAR,
        currency VARCHAR,
        site_index INTEGER,
        latitude DOUBLE,
        longitude DOUBLE
      );
      CREATE TABLE suppliers (
        supplier_id VARCHAR,
        supplier_name VARCHAR,
        account_hierarchy VARCHAR,
        currency VARCHAR,
        invoice_channel VARCHAR
      );
      CREATE TABLE contracts (
        contract_id VARCHAR,
        supplier_id VARCHAR,
        supplier_name VARCHAR,
        archetype VARCHAR,
        country_scope VARCHAR,
        start_date DATE,
        end_date DATE,
        rate_card VARCHAR,
        discount_schedule VARCHAR,
        escalation_clause VARCHAR,
        renewal_terms VARCHAR,
        auto_renew VARCHAR,
        termination_terms VARCHAR,
        clause_risk VARCHAR,
        tower VARCHAR,
        annual_spend_target DOUBLE,
        sites_covered VARCHAR
      );
      CREATE TABLE services (
        service_id VARCHAR,
        site_id VARCHAR,
        site_name VARCHAR,
        supplier_id VARCHAR,
        supplier_name VARCHAR,
        contract_id VARCHAR,
        archetype VARCHAR,
        category VARCHAR,
        access_type VARCHAR,
        bandwidth_or_size VARCHAR,
        status VARCHAR,
        install_date DATE,
        disconnect_date DATE,
        primary_or_backup_role VARCHAR,
        sla_tier VARCHAR,
        routing_diversity VARCHAR,
        revenue_sensitive BOOLEAN,
        tower VARCHAR,
        monthly_rate DOUBLE,
        utilization DOUBLE,
        committed_actual_ratio DOUBLE,
        reason_code VARCHAR
      );
      CREATE TABLE invoice_lines (
        invoice_id VARCHAR,
        invoice_line_id VARCHAR,
        bill_period DATE,
        line_description VARCHAR,
        amount DOUBLE,
        charge_type VARCHAR,
        billed_quantity DOUBLE,
        service_id VARCHAR,
        site_id VARCHAR,
        supplier_id VARCHAR,
        payment_status VARCHAR,
        source_file VARCHAR,
        source_sheet VARCHAR,
        source_reference VARCHAR,
        duplicate_charge BOOLEAN
      );
      CREATE TABLE ap_records (
        voucher_number VARCHAR,
        paid_amount DOUBLE,
        payment_date DATE,
        cost_center VARCHAR,
        duplicate_check_key VARCHAR,
        gl_mapping VARCHAR,
        project_mapping VARCHAR,
        invoice_id VARCHAR,
        site_id VARCHAR,
        supplier_id VARCHAR
      );
      CREATE TABLE usage_records (
        service_id VARCHAR,
        period VARCHAR,
        utilization DOUBLE,
        ports INTEGER,
        minutes INTEGER,
        seats INTEGER,
        sessions INTEGER,
        committed_vs_actual DOUBLE
      );
      CREATE TABLE benchmark_observations (
        benchmark_id VARCHAR,
        service_type VARCHAR,
        location VARCHAR,
        region VARCHAR,
        bandwidth VARCHAR,
        term VARCHAR,
        managed_flag VARCHAR,
        minimum DOUBLE,
        p25 DOUBLE,
        median DOUBLE,
        p75 DOUBLE,
        maximum DOUBLE,
        sample_size INTEGER,
        source_date DATE,
        confidence DOUBLE,
        currency VARCHAR,
        normalized_usd_median DOUBLE
      );
      CREATE TABLE findings (
        finding_id VARCHAR,
        finding_type VARCHAR,
        impact_type VARCHAR,
        estimated_annualized_savings DOUBLE,
        one_time_recovery DOUBLE,
        confidence DOUBLE,
        risk_rating VARCHAR,
        recommended_next_step VARCHAR,
        review_status VARCHAR,
        supplier_name VARCHAR,
        site_name VARCHAR,
        site_id VARCHAR,
        tower VARCHAR,
        source_file VARCHAR,
        source_reference VARCHAR,
        contract_clause VARCHAR,
        invoice_line VARCHAR,
        ap_record VARCHAR,
        usage_record VARCHAR,
        benchmark_source VARCHAR,
        reviewer_history VARCHAR,
        created_at DATE,
        reviewed_at DATE
      );
      CREATE TABLE review_events (
        finding_id VARCHAR,
        event_at DATE,
        actor VARCHAR,
        action VARCHAR,
        note VARCHAR
      );
    `,
  );

  await run(freshConn, "INSERT INTO app_meta VALUES ('schema_version', ?)", [String(DB_VERSION)]);

  const insertSites = prepareRun(
    freshConn,
    "INSERT INTO sites VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertSuppliers = prepareRun(freshConn, "INSERT INTO suppliers VALUES (?, ?, ?, ?, ?)");
  const insertContracts = prepareRun(
    freshConn,
    "INSERT INTO contracts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertServices = prepareRun(
    freshConn,
    "INSERT INTO services VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertInvoices = prepareRun(
    freshConn,
    "INSERT INTO invoice_lines VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertAp = prepareRun(
    freshConn,
    "INSERT INTO ap_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertUsage = prepareRun(
    freshConn,
    "INSERT INTO usage_records VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertBenchmarks = prepareRun(
    freshConn,
    "INSERT INTO benchmark_observations VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertFindings = prepareRun(
    freshConn,
    "INSERT INTO findings VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  const insertEvents = prepareRun(
    freshConn,
    "INSERT INTO review_events VALUES (?, ?, ?, ?, ?)",
  );

  for (const site of seed.sites) {
    await insertSites.run(
      site.site_id,
      site.site_name,
      site.archetype,
      site.region,
      site.country,
      site.metro,
      site.site_type,
      site.criticality,
      site.business_owner,
      site.revenue_sensitive,
      site.resilience_required,
      site.tower,
      site.primary_network_role,
      site.backup_network_role,
      site.cost_center,
      site.currency,
      site.site_index,
      site.latitude,
      site.longitude,
    );
  }
  for (const supplier of seed.supplierRows) {
    await insertSuppliers.run(
      supplier.supplier_id,
      supplier.supplier_name,
      supplier.account_hierarchy,
      supplier.currency,
      supplier.invoice_channel,
    );
  }
  for (const contract of seed.contracts) {
    await insertContracts.run(
      contract.contract_id,
      contract.supplier_id,
      contract.supplier_name,
      contract.archetype,
      contract.country_scope,
      contract.start_date,
      contract.end_date,
      contract.rate_card,
      contract.discount_schedule,
      contract.escalation_clause,
      contract.renewal_terms,
      contract.auto_renew,
      contract.termination_terms,
      contract.clause_risk,
      contract.tower,
      contract.annual_spend_target,
      JSON.stringify(contract.sites_covered),
    );
  }
  for (const service of seed.services) {
    await insertServices.run(
      service.service_id,
      service.site_id,
      service.site_name,
      service.supplier_id,
      service.supplier_name,
      service.contract_id,
      service.archetype,
      service.category,
      service.access_type,
      service.bandwidth_or_size,
      service.status,
      service.install_date,
      service.disconnect_date,
      service.primary_or_backup_role,
      service.sla_tier,
      service.routing_diversity,
      service.revenue_sensitive,
      service.tower,
      service.monthly_rate,
      service.utilization,
      service.committed_actual_ratio,
      service.reason_code,
    );
  }
  for (const invoice of seed.invoiceLines) {
    await insertInvoices.run(
      invoice.invoice_id,
      invoice.invoice_line_id,
      invoice.bill_period,
      invoice.line_description,
      invoice.amount,
      invoice.charge_type,
      invoice.billed_quantity,
      invoice.service_id,
      invoice.site_id,
      invoice.supplier_id,
      invoice.payment_status,
      invoice.source_file,
      invoice.source_sheet,
      invoice.source_reference,
      invoice.duplicate_charge,
    );
  }
  for (const ap of seed.apRows) {
    await insertAp.run(
      ap.voucher_number,
      ap.paid_amount,
      ap.payment_date,
      ap.cost_center,
      ap.duplicate_check_key,
      ap.gl_mapping,
      ap.project_mapping,
      ap.invoice_id,
      ap.site_id,
      ap.supplier_id,
    );
  }
  for (const usage of seed.usageRows) {
    await insertUsage.run(
      usage.service_id,
      usage.period,
      usage.utilization,
      usage.ports,
      usage.minutes,
      usage.seats,
      usage.sessions,
      usage.committed_vs_actual,
    );
  }
  for (const benchmark of seed.benchmarkRows) {
    await insertBenchmarks.run(
      benchmark.benchmark_id,
      benchmark.service_type,
      benchmark.location,
      benchmark.region,
      benchmark.bandwidth,
      benchmark.term,
      benchmark.managed_flag,
      benchmark.minimum,
      benchmark.p25,
      benchmark.median,
      benchmark.p75,
      benchmark.maximum,
      benchmark.sample_size,
      benchmark.source_date,
      benchmark.confidence,
      benchmark.currency,
      benchmark.normalized_usd_median,
    );
  }
  for (const finding of seed.findings) {
    await insertFindings.run(
      finding.finding_id,
      finding.finding_type,
      finding.impact_type,
      finding.estimated_annualized_savings,
      finding.one_time_recovery,
      finding.confidence,
      finding.risk_rating,
      finding.recommended_next_step,
      finding.review_status,
      finding.supplier_name,
      finding.site_name,
      finding.site_id,
      finding.tower,
      finding.source_file,
      finding.source_reference,
      finding.contract_clause,
      finding.invoice_line,
      finding.ap_record,
      finding.usage_record,
      finding.benchmark_source,
      finding.reviewer_history,
      finding.created_at,
      finding.reviewed_at,
    );
  }
  for (const event of seed.reviewEvents) {
    await insertEvents.run(event.finding_id, event.event_at, event.actor, event.action, event.note);
  }

  await insertSites.finalize();
  await insertSuppliers.finalize();
  await insertContracts.finalize();
  await insertServices.finalize();
  await insertInvoices.finalize();
  await insertAp.finalize();
  await insertUsage.finalize();
  await insertBenchmarks.finalize();
  await insertFindings.finalize();
  await insertEvents.finalize();

  await run(freshConn, "COMMIT");
}

async function getHandle() {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await openDb();
      const conn = db.connect();
      const handle = { db, conn };
      await ensureSeeded(handle);
      return handle;
    })();
  }
  return initPromise;
}

export function resetDatabaseCache() {
  initPromise = null;
}

function readSnapshotCache() {
  try {
    if (!fs.existsSync(SNAPSHOT_FILE)) return null;
    const raw = fs.readFileSync(SNAPSHOT_FILE, "utf8");
    return JSON.parse(raw) as DashboardSnapshot;
  } catch {
    return null;
  }
}

export function writeSnapshotCache(snapshot: DashboardSnapshot) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot));
}

function readEmbeddedSnapshot() {
  try {
    const embeddedPath = path.join(process.cwd(), "lib", "telecom", "dashboard-snapshot.json");
    if (!fs.existsSync(embeddedPath)) return null;
    const raw = fs.readFileSync(embeddedPath, "utf8");
    return JSON.parse(raw) as DashboardSnapshot;
  } catch {
    return null;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(amount);
}

function formatCurrencyExact(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildNarrative(metrics: {
  contractSpend: number;
  invoiceSpend: number;
  apSpend: number;
  totalSavings: number;
  totalRecovery: number;
  totalOpportunity: number;
  opportunityRate: number;
  revenueSavings: number;
  sgAndASavings: number;
  sharedSavings: number;
  highRiskCount: number;
}) {
  const split = [
    `${towerDisplayLabel("Revenue-driving network")} accounts for ${Math.round((metrics.revenueSavings / metrics.totalSavings) * 100)}% of addressable savings`,
    `${towerDisplayLabel("SG&A telecom")} contributes ${Math.round((metrics.sgAndASavings / metrics.totalSavings) * 100)}%`,
    `${towerDisplayLabel("Shared")} services contribute ${Math.round((metrics.sharedSavings / metrics.totalSavings) * 100)}%`,
  ];
  return `The seeded media-and-telecom portfolio shows ${formatCurrency(metrics.contractSpend)} in annualized contract spend, ${formatCurrency(metrics.invoiceSpend)} in invoice spend, and ${formatCurrency(metrics.apSpend)} in AP spend. Total opportunity is ${formatCurrency(metrics.totalOpportunity)} (${Math.round(metrics.opportunityRate * 100)}% of spend), made up of ${formatCurrency(metrics.totalSavings)} in annualized savings and ${formatCurrency(metrics.totalRecovery)} in one-time recovery. ${split.join("; ")}. ${metrics.highRiskCount} high-risk findings require analyst review.`;
}

export async function getDatabaseDashboardSnapshot(): Promise<DashboardSnapshot> {
  const { conn } = await getHandle();

  const metricsRows = await all<{
    contract_spend: number;
    invoice_spend: number;
    ap_spend: number;
    total_savings: number;
    total_recovery: number;
    revenue_savings: number;
    sg_and_a_savings: number;
    shared_savings: number;
    high_risk_count: number;
    total_services: number;
    total_sites: number;
    total_contracts: number;
    total_invoices: number;
    total_ap_records: number;
    total_service_types: number;
    active_findings: number;
  }>(
    conn,
    `
      SELECT
        COALESCE((SELECT SUM(annual_spend_target) FROM contracts), 0) AS contract_spend,
        COALESCE((SELECT SUM(amount) FROM invoice_lines), 0) AS invoice_spend,
        COALESCE((SELECT SUM(paid_amount) FROM ap_records), 0) AS ap_spend,
        COALESCE(SUM(estimated_annualized_savings), 0) AS total_savings,
        COALESCE(SUM(one_time_recovery), 0) AS total_recovery,
        COALESCE(SUM(CASE WHEN impact_type = 'Billing recovery' THEN estimated_annualized_savings ELSE 0 END), 0) AS billing_annualized_savings,
        COALESCE(SUM(CASE WHEN impact_type = 'Billing recovery' THEN one_time_recovery ELSE 0 END), 0) AS billing_one_time_recovery,
        COALESCE(SUM(CASE WHEN tower = 'Revenue-driving network' THEN estimated_annualized_savings ELSE 0 END), 0) AS revenue_savings,
        COALESCE(SUM(CASE WHEN tower = 'SG&A telecom' THEN estimated_annualized_savings ELSE 0 END), 0) AS sg_and_a_savings,
        COALESCE(SUM(CASE WHEN tower = 'Shared' THEN estimated_annualized_savings ELSE 0 END), 0) AS shared_savings,
        COUNT(*) FILTER (WHERE risk_rating = 'High') AS high_risk_count,
        (SELECT COUNT(*) FROM services) AS total_services,
        (SELECT COUNT(*) FROM sites) AS total_sites,
        (SELECT COUNT(*) FROM contracts) AS total_contracts,
        (SELECT COUNT(*) FROM (SELECT DISTINCT invoice_id FROM invoice_lines)) AS total_invoices,
        (SELECT COUNT(*) FROM ap_records) AS total_ap_records,
        (SELECT COUNT(DISTINCT category) FROM services) AS total_service_types,
        COUNT(*) FILTER (WHERE review_status IN ('New', 'Under review')) AS active_findings
      FROM findings;
    `,
  );

  const metrics = metricsRows[0];
  const contractSpend = Number(metrics?.contract_spend ?? 0);
  const invoiceSpend = Number(metrics?.invoice_spend ?? 0);
  const apSpend = Number(metrics?.ap_spend ?? 0);
  const totalServices = Number(metrics?.total_services ?? 0);
  const totalContracts = Number(metrics?.total_contracts ?? 0);
  const totalInvoices = Number(metrics?.total_invoices ?? 0);
  const totalApRecords = Number(metrics?.total_ap_records ?? 0);
  const totalServiceTypes = Number(metrics?.total_service_types ?? 0);
  const totalSites = Number(metrics?.total_sites ?? 0);
  const sgAndASavings = Number(metrics?.sg_and_a_savings ?? 0);
  const sharedSavings = Number(metrics?.shared_savings ?? 0);
  const highRiskCount = Number(metrics?.high_risk_count ?? 0);

  let bucketRows = await all<{
    bucket: string;
    amount: number;
  }>(
    conn,
    `
      SELECT bucket, SUM(amount) AS amount
      FROM (
        SELECT
          CASE
            WHEN impact_type = 'Network optimization' THEN 'Network optimization'
            WHEN impact_type = 'Billing recovery' THEN 'Billing errors'
            ELSE 'Market benchmarks'
          END AS bucket,
          estimated_annualized_savings + one_time_recovery AS amount
      FROM findings
      ) grouped
      GROUP BY bucket
      ORDER BY amount DESC;
    `,
  );
  const bucketOrder = ["Network optimization", "Billing errors", "Market benchmarks"];
  let bucketMap = new Map(bucketRows.map((row) => [String(row.bucket), Number(row.amount)]));
  let opportunityTotal = bucketRows.reduce((sum, row) => sum + Number(row.amount), 0) || 1;
  let opportunityBreakdown = bucketOrder.map((bucket) => {
    const amount = bucketMap.get(bucket) ?? 0;
    return {
      bucket,
      amount,
      share: amount / opportunityTotal,
    };
  });

  const towerRows = await all<{ tower: SpendTower; raw_amount: number }>(
    conn,
    `
      SELECT tower, SUM(monthly_rate * 12) AS raw_amount
      FROM services
      GROUP BY tower
      ORDER BY raw_amount DESC;
    `,
  );

  const rawTowerSpend = towerRows.reduce((sum, row) => sum + Number(row.raw_amount), 0) || 1;
  const towerSpendScale = contractSpend / rawTowerSpend;

  const hotspotsRows = await all<Hotspot>(
    conn,
    `
      SELECT
        country AS label,
        region,
        country,
        SUM(estimated_annualized_savings) AS savings,
        ROUND(AVG(confidence) * 100) AS risk
      FROM findings
      JOIN sites ON sites.site_id = findings.site_id
      GROUP BY country, region
      ORDER BY savings DESC
      LIMIT 12;
    `,
  );

  const topSuppliers = await all<{ supplier_name: string; savings: number }>(
    conn,
    `
      SELECT supplier_name, SUM(estimated_annualized_savings) AS savings
      FROM findings
      GROUP BY supplier_name
      ORDER BY savings DESC
      LIMIT 6;
    `,
  );

  const benchmarkRows = await all(
    conn,
    `
      SELECT
        service_type AS category,
        location,
        currency,
        ROUND(median, 0) AS client_rate,
        ROUND(p25, 0) AS p25,
        ROUND(median, 0) AS median,
        ROUND(p75, 0) AS p75,
        ROUND(confidence * 100) AS confidence,
        sample_size
      FROM benchmark_observations
      ORDER BY confidence DESC, sample_size DESC
      LIMIT 8;
    `,
  );

  const renewalsRaw = await all<{
    contract_id: string;
    supplier_name: string;
    archetype: string;
    end_date: string;
    clause_risk: string;
    annual_spend_target: number;
    sites_covered: string;
  }>(
    conn,
    `
      SELECT contract_id, supplier_name, archetype, end_date, clause_risk, annual_spend_target, sites_covered
      FROM contracts
      ORDER BY end_date ASC, clause_risk DESC
      LIMIT 8;
    `,
  );

  const renewals = renewalsRaw.map((row) => ({
    contract_id: row.contract_id,
    supplier_name: row.supplier_name,
    site_name: row.archetype,
    days_to_renewal: Math.max(0, Math.round((new Date(row.end_date).getTime() - Date.now()) / 86400000)),
    risk_score: row.clause_risk === "High" ? 92 : row.clause_risk === "Moderate" ? 64 : 38,
    clause_risk: row.clause_risk,
    annual_spend: Number(row.annual_spend_target),
  }));

  const findingsRows = await all<FindingCard>(
    conn,
    `
      SELECT *
      FROM findings
      ORDER BY
        CASE review_status WHEN 'New' THEN 0 WHEN 'Under review' THEN 1 WHEN 'Blocked' THEN 2 ELSE 3 END,
        estimated_annualized_savings DESC
      LIMIT 10;
    `,
  );

  const classificationRows = await all<{
    service_id: string;
    site_name: string;
    service_category: string;
    tower: SpendTower;
    confidence: number;
    reason_code: string;
    annualized_spend: number;
  }>(
    conn,
    `
      SELECT
        service_id,
        site_name,
        category AS service_category,
        tower,
        ROUND(CASE
          WHEN reason_code = 'CORE_NETWORK' THEN 95
          WHEN reason_code = 'RESILIENCE' THEN 88
          WHEN reason_code = 'COLLABORATION' THEN 79
          ELSE 86
        END, 0) AS confidence,
        reason_code,
        ROUND(monthly_rate * 12, 0) AS annualized_spend
      FROM services
      ORDER BY annualized_spend DESC
      LIMIT 50;
    `,
  );

  const inventoryExceptions = await all<{
    service_id: string;
    site_name: string;
    exception_state: string;
    supplier_name: string;
    monthly_rate: number;
    contract_id: string;
  }>(
    conn,
    `
      SELECT
        service_id,
        site_name,
        CASE
          WHEN status = 'Pending disconnect' THEN 'Pending disconnect still billing'
          WHEN status = 'Inactive' THEN 'In inventory but not billed'
          WHEN utilization < 0.2 AND primary_or_backup_role = 'Backup' THEN 'Unused backup circuit'
          ELSE 'Billed but not in inventory'
        END AS exception_state,
        supplier_name,
        monthly_rate,
        contract_id
      FROM services
      WHERE status <> 'Active' OR utilization < 0.22 OR monthly_rate > 4000
      ORDER BY monthly_rate DESC
      LIMIT 50;
    `,
  );

  const billingAnomalies = await all<{
    anomaly_type: string;
    count: number;
    recoverable_amount: number;
  }>(
    conn,
    `
      SELECT
        CASE
          WHEN duplicate_charge THEN 'Duplicate charge'
          WHEN payment_status = 'Duplicate review' THEN 'Potential duplicate payment'
          WHEN line_description LIKE '%Temporary%' THEN 'Post-disconnect billing'
          ELSE 'Invoice mismatch'
        END AS anomaly_type,
        COUNT(*) AS count,
        SUM(amount) AS recoverable_amount
      FROM invoice_lines
      GROUP BY 1
      ORDER BY recoverable_amount DESC;
    `,
  );

  const reviewKanban = await all<{
    state: string;
    count: number;
  }>(
    conn,
    `
      SELECT review_status AS state, COUNT(*) AS count
      FROM findings
      GROUP BY review_status
      ORDER BY CASE review_status WHEN 'New' THEN 0 WHEN 'Under review' THEN 1 WHEN 'Blocked' THEN 2 ELSE 3 END;
    `,
  );

  const ingestionSummary = {
    files: [
      "inventory_master.xlsx",
      "invoice_packet.pdf",
      "contract_summaries.pdf",
      "ap_export.csv",
    ],
    mapped_rows: totalServices + totalContracts + 4200,
    unmapped_rows: 38,
    confidence: 93,
    generated_assets: [
      "normalized_inventory.csv",
      "benchmark_dataset.csv",
      "client_review_packet.pdf",
    ],
  };

  const adminSummary = [
    {
      setting: "Classification priority",
      value: "Explicit tags > site type > GL mapping > contract family > supplier pattern > human override",
      note: "Revenue-sensitive paths remain advisory-only.",
    },
    {
      setting: "Benchmark confidence floor",
      value: "68%",
      note: "Percentile bands are surfaced instead of a single point estimate.",
    },
    {
      setting: "Review workflow",
      value: "New → Under review → Approved / Blocked → Exported",
      note: "All reviewer actions are auditable.",
    },
  ];

  const sitesDetailedRaw = await all<{
    site_id: string;
    site_name: string;
    archetype: Site360["archetype"];
    region: string;
    country: string;
    criticality: number;
    revenue_sensitive: boolean;
    tower: SpendTower;
    primary_network_role: string;
    backup_network_role: string | null;
    annual_spend: number;
    service_count: number;
    latitude: number;
    longitude: number;
  }>(
    conn,
    `
      WITH site_spend AS (
        SELECT site_id, SUM(monthly_rate * 12) AS raw_annual_spend
        FROM services
        GROUP BY site_id
      ),
      site_service_counts AS (
        SELECT site_id, COUNT(*) AS service_count
        FROM services
        GROUP BY site_id
      )
      SELECT
        s.site_id,
        s.site_name,
        s.archetype,
        s.region,
        s.country,
        s.criticality,
        s.revenue_sensitive,
        s.tower,
        s.primary_network_role,
        s.backup_network_role,
        s.latitude,
        s.longitude,
        COALESCE(site_spend.raw_annual_spend, 0) AS annual_spend,
        COALESCE(site_service_counts.service_count, 0) AS service_count
      FROM sites s
      LEFT JOIN site_spend USING (site_id)
      LEFT JOIN site_service_counts USING (site_id)
      ORDER BY annual_spend DESC
      ;
    `,
  );

  const allServiceRows = await all<{
    site_id: string;
    site_name: string;
    service_id: string;
    supplier_name: string;
    category: string;
    access_type: string;
    status: string;
    monthly_rate: number;
    utilization: number;
    contract_id: string;
    primary_or_backup_role: string;
    sla_tier: string;
    routing_diversity: string;
    tower: SpendTower;
  }>(
    conn,
    `
      SELECT
        svc.site_id,
        s.site_name,
        svc.service_id,
        sup.supplier_name,
        svc.category,
        svc.access_type,
        svc.status,
        svc.monthly_rate,
        svc.utilization,
        svc.contract_id,
        svc.primary_or_backup_role,
        svc.sla_tier,
        svc.routing_diversity,
        svc.tower
      FROM services svc
      JOIN sites s ON s.site_id = svc.site_id
      JOIN suppliers sup ON sup.supplier_id = svc.supplier_id
      ORDER BY svc.site_id, svc.monthly_rate DESC;
    `,
  );

  const servicesBySite = new Map<string, Site360["services"]>();
  for (const service of allServiceRows) {
    const list = servicesBySite.get(service.site_id) ?? [];
    if (list.length < 20) {
      list.push({
        service_id: service.service_id,
        category: service.category,
        access_type: service.access_type,
        status: service.status,
        monthly_rate: Number(service.monthly_rate),
        utilization: Number(service.utilization),
        contract_id: service.contract_id,
        primary_or_backup_role: service.primary_or_backup_role,
        sla_tier: service.sla_tier,
        routing_diversity: service.routing_diversity,
        tower: service.tower as SpendTower,
      });
      servicesBySite.set(service.site_id, list);
    }
  }

  const contractSpendRows = await all<{
    contract_id: string;
    annual_spend_target: number;
  }>(
    conn,
    `
      SELECT contract_id, annual_spend_target
      FROM contracts;
    `,
  );
  const contractSpendById = new Map(contractSpendRows.map((row) => [row.contract_id, Number(row.annual_spend_target)]));
  const servicesByContract = new Map<string, typeof allServiceRows>();
  for (const service of allServiceRows) {
    const list = servicesByContract.get(service.contract_id) ?? [];
    list.push(service);
    servicesByContract.set(service.contract_id, list);
  }
  const annualAllocationByServiceId = new Map<string, number>();
  for (const [contractId, contractServices] of servicesByContract.entries()) {
    const sortedServices = [...contractServices].sort((a, b) => a.service_id.localeCompare(b.service_id));
    const annualSpend = Math.round(contractSpendById.get(contractId) ?? 0);
    const serviceBase = Math.floor(annualSpend / Math.max(sortedServices.length, 1));
    const serviceRemainder = annualSpend % Math.max(sortedServices.length, 1);
    sortedServices.forEach((service, index) => {
      annualAllocationByServiceId.set(service.service_id, serviceBase + (index < serviceRemainder ? 1 : 0));
    });
  }

  const sitesDetailed: Site360[] = sitesDetailedRaw.map((site) => ({
    ...site,
    annual_spend: Math.round(Number(site.annual_spend) * towerSpendScale),
    service_count: Number(site.service_count),
    annual_opportunity: 0,
    opportunity_breakdown: [],
    latitude: Number(site.latitude),
    longitude: Number(site.longitude),
    services: servicesBySite.get(site.site_id) ?? [],
  }));

  const normalizedTowerAmounts = towerRows.map((row) => Math.round(Number(row.raw_amount) * towerSpendScale));
  const towerRemainder = contractSpend - normalizedTowerAmounts.reduce((sum, amount) => sum + amount, 0);
  if (normalizedTowerAmounts.length > 0) {
    normalizedTowerAmounts[normalizedTowerAmounts.length - 1] += towerRemainder;
  }
  const towerSpend: TowerSpend[] = towerRows.map((row, index) => {
    const amount = normalizedTowerAmounts[index] ?? 0;
    return {
      tower: row.tower,
      amount,
      share: amount / Math.max(contractSpend, 1),
    };
  });

  const hotspots: Hotspot[] = hotspotsRows.map((row) => ({
    ...row,
    risk: Number(row.risk),
  }));

  const siteById = new Map(sitesDetailed.map((site) => [site.site_id, site]));
  const serviceRowsBySite = new Map<
    string,
    Array<{
      service_id: string;
      site_id: string;
      site_name: string;
      category: string;
      access_type: string;
      status: string;
      monthly_rate: number;
      utilization: number;
      contract_id: string;
      primary_or_backup_role: string;
      sla_tier: string;
      routing_diversity: string;
      tower: SpendTower;
    }>
  >();
  for (const row of allServiceRows) {
    const list = serviceRowsBySite.get(row.site_id) ?? [];
    list.push({
      service_id: row.service_id,
      site_id: row.site_id,
      site_name: row.site_name,
      category: row.category,
      access_type: row.access_type,
      status: row.status,
      monthly_rate: Number(row.monthly_rate),
      utilization: Number(row.utilization),
      contract_id: row.contract_id,
      primary_or_backup_role: row.primary_or_backup_role,
      sla_tier: row.sla_tier,
      routing_diversity: row.routing_diversity,
      tower: row.tower,
    });
    serviceRowsBySite.set(row.site_id, list);
  }

  const networkBucketTotal = bucketMap.get("Network optimization") ?? 0;
  const networkServiceCandidates = allServiceRows
    .map((row) => {
      const annualSpend = Math.round(Number(row.monthly_rate) * 12);
      const utilization = Number(row.utilization);
      let rawOpportunity = 0;
      if (row.status !== "Active") {
        rawOpportunity = annualSpend * 0.38;
      } else if (utilization < 0.2) {
        rawOpportunity = annualSpend * 0.3;
      } else if (utilization < 0.35) {
        rawOpportunity = annualSpend * 0.2;
      } else if (utilization < 0.55) {
        rawOpportunity = annualSpend * 0.12;
      }
      if (row.primary_or_backup_role === "Backup" && utilization < 0.4) {
        rawOpportunity += annualSpend * 0.07;
      }
      return {
        service_id: row.service_id,
        site_id: row.site_id,
        site_name: row.site_name,
        archetype: siteById.get(row.site_id)?.archetype ?? "Corporate office",
        country: siteById.get(row.site_id)?.country ?? "United States",
        tower: row.tower,
        annual_spend: annualSpend,
        raw_opportunity: rawOpportunity,
        category: row.category,
        access_type: row.access_type,
        status: row.status,
        utilization,
        monthly_rate: Number(row.monthly_rate),
        contract_id: row.contract_id,
        primary_or_backup_role: row.primary_or_backup_role,
        sla_tier: row.sla_tier,
        routing_diversity: row.routing_diversity,
        recommendation: networkRecommendation(utilization, row.status, row.primary_or_backup_role),
      };
    })
    .filter((row) => row.raw_opportunity > 0)
    .sort((a, b) => b.raw_opportunity - a.raw_opportunity);

  const networkRawTotal = networkServiceCandidates.reduce((sum, row) => sum + row.raw_opportunity, 0) || 1;
  const networkScale = networkBucketTotal / networkRawTotal;
  let networkRemainder = Math.round(networkBucketTotal);
  const networkServiceRows = networkServiceCandidates.map((row, index) => {
    const amount = Math.round(row.raw_opportunity * networkScale);
    networkRemainder -= amount;
    const adjustedAmount = index === networkServiceCandidates.length - 1 ? amount + networkRemainder : amount;
    return {
      ...row,
      annualized_savings: Math.max(adjustedAmount, 0),
    };
  });
  if (networkServiceRows.length > 0) {
    const networkRowTotal = networkServiceRows.reduce((sum, row) => sum + row.annualized_savings, 0);
    networkServiceRows[networkServiceRows.length - 1].annualized_savings += Math.round(networkBucketTotal - networkRowTotal);
  }

  const networkOptimizationSites: NetworkOptimizationSite[] = Array.from(serviceRowsBySite.entries())
    .map(([siteId]) => {
      const site = siteById.get(siteId);
      if (!site) return null;
      const allSiteServices = networkServiceRows.filter((row) => row.site_id === siteId);
      const detailedServices = [...allSiteServices]
        .sort((a, b) => b.annualized_savings - a.annualized_savings)
        .slice(0, 8);
      const siteSavings = allSiteServices.reduce((sum, row) => sum + row.annualized_savings, 0);
      return {
        site_id: site.site_id,
        site_name: site.site_name,
        archetype: site.archetype,
        country: site.country,
        tower: site.tower,
        annual_spend: site.annual_spend,
        site_savings: siteSavings,
        service_count: site.service_count,
        services: detailedServices.map((row) => ({
          service_id: row.service_id,
          category: row.category,
          access_type: row.access_type,
          status: row.status,
          utilization: row.utilization,
          monthly_rate: row.monthly_rate,
          annualized_savings: row.annualized_savings,
          recommendation: row.recommendation,
          primary_or_backup_role: row.primary_or_backup_role,
          sla_tier: row.sla_tier,
          routing_diversity: row.routing_diversity,
        })),
      } satisfies NetworkOptimizationSite;
    })
    .filter((site): site is NetworkOptimizationSite => Boolean(site))
    .sort((a, b) => b.site_savings - a.site_savings);

  const billingLineCandidates = await all<{
    invoice_id: string;
    invoice_line_id: string;
    bill_period: string;
    line_description: string;
    amount: number;
    service_id: string;
    site_id: string;
    site_name: string;
    supplier_name: string;
    payment_status: string;
    duplicate_charge: boolean;
    monthly_rate: number;
    contract_id: string;
  }>(
    conn,
    `
      SELECT
        il.invoice_id,
        il.invoice_line_id,
        CAST(il.bill_period AS VARCHAR) AS bill_period,
        il.line_description,
        il.amount,
        il.service_id,
        il.site_id,
        s.site_name,
        sup.supplier_name,
        il.payment_status,
        il.duplicate_charge,
        svc.monthly_rate,
        svc.contract_id
      FROM invoice_lines il
      JOIN sites s ON s.site_id = il.site_id
      JOIN suppliers sup ON sup.supplier_id = il.supplier_id
      JOIN services svc ON svc.service_id = il.service_id
      WHERE il.duplicate_charge = TRUE
         OR il.payment_status = 'Duplicate review'
         OR il.line_description LIKE '%Temporary%'
      ORDER BY il.invoice_id, il.amount DESC;
    `,
  );

  const billingRowsWithScore = billingLineCandidates.map((row) => {
    const contractMonthlyExpected = Math.max(
      Math.round((annualAllocationByServiceId.get(row.service_id) ?? Number(row.monthly_rate) * 12) / 12),
      1,
    );
    let expectedAmount = Math.round(contractMonthlyExpected * 0.88);
    if (row.duplicate_charge || row.payment_status === "Duplicate review") {
      expectedAmount = 0;
    } else if (row.line_description.includes("Temporary")) {
      expectedAmount = Math.max(Math.round(contractMonthlyExpected * 0.2), 1);
    }
    const varianceAmount = Number(row.amount) - expectedAmount;
    const rawRecoverable = Math.max(varianceAmount, 0);
    return {
      ...row,
      expected_amount: expectedAmount,
      variance_amount: varianceAmount,
      raw_recoverable: rawRecoverable,
      reason: billingVarianceReason(row.duplicate_charge, row.payment_status, row.line_description),
    };
  });

  const billingScaledRows = billingRowsWithScore.map((row) => ({
    ...row,
    recoverable_amount: Math.max(Math.round(row.raw_recoverable), 0),
  }));

  const billingInvoiceDetails: BillingInvoiceDetail[] = Array.from(
    billingScaledRows.reduce((map, row) => {
      const list = map.get(row.invoice_id) ?? [];
      list.push(row);
      map.set(row.invoice_id, list);
      return map;
    }, new Map<string, typeof billingScaledRows>()),
  )
    .map(([, rows]) => {
      const first = rows[0];
      const billedAmount = rows.reduce((sum, line) => sum + Number(line.amount), 0);
      const expectedAmount = rows.reduce((sum, line) => sum + Number(line.expected_amount), 0);
      const varianceAmount = billedAmount - expectedAmount;
      const recoverableAmount = rows.reduce((sum, line) => sum + Number(line.recoverable_amount), 0);
      return {
        invoice_id: first.invoice_id,
        bill_period: first.bill_period,
        site_name: first.site_name,
        supplier_name: first.supplier_name,
        line_count: rows.length,
        billed_amount: billedAmount,
        expected_amount: expectedAmount,
        variance_amount: varianceAmount,
        recoverable_amount: recoverableAmount,
        note: rows.some((line) => line.duplicate_charge) ? "Duplicate review" : rows.some((line) => line.line_description.includes("Temporary")) ? "Post-disconnect billing" : "Contract variance",
        lines: rows
          .sort((a, b) => b.recoverable_amount - a.recoverable_amount)
          .slice(0, 6)
          .map((line) => ({
            invoice_line_id: line.invoice_line_id,
            line_description: line.line_description,
            service_id: line.service_id,
            amount: Number(line.amount),
            expected_amount: Number(line.expected_amount),
            variance_amount: Number(line.variance_amount),
            recoverable_amount: Number(line.recoverable_amount),
            duplicate_charge: Boolean(line.duplicate_charge),
            payment_status: line.payment_status,
            source_reference: `${line.invoice_id}:${line.invoice_line_id}`,
          })),
      } satisfies BillingInvoiceDetail;
    })
    .sort((a, b) => b.recoverable_amount - a.recoverable_amount)
    ;

  const billingRecoverableTotal = billingScaledRows.reduce((sum, row) => sum + Number(row.recoverable_amount), 0);
  bucketRows = bucketRows.map((row) =>
    row.bucket === "Billing errors" ? { ...row, amount: billingRecoverableTotal } : row,
  );
  bucketMap = new Map(bucketRows.map((row) => [String(row.bucket), Number(row.amount)]));
  opportunityTotal = bucketRows.reduce((sum, row) => sum + Number(row.amount), 0) || 1;
  opportunityBreakdown = bucketOrder.map((bucket) => {
    const amount = bucketMap.get(bucket) ?? 0;
    return {
      bucket,
      amount,
      share: amount / opportunityTotal,
    };
  });

  const networkSavings = bucketMap.get("Network optimization") ?? 0;
  const benchmarkSavings = bucketMap.get("Market benchmarks") ?? 0;
  const annualSavings = networkSavings + benchmarkSavings;
  const oneTimeSavings = billingRecoverableTotal;
  const totalSavingsAmount = annualSavings + oneTimeSavings;
  const totalOpportunityAmount = totalSavingsAmount;
  const adjustedOpportunityRate = contractSpend > 0 ? totalOpportunityAmount / contractSpend : 0;

  const narrative = buildNarrative({
    contractSpend,
    invoiceSpend,
    apSpend,
    totalSavings: annualSavings,
    totalRecovery: oneTimeSavings,
    totalOpportunity: totalOpportunityAmount,
    opportunityRate: adjustedOpportunityRate,
    revenueSavings: annualSavings,
    sgAndASavings,
    sharedSavings,
    highRiskCount,
  });

  const kpis = [
    { label: "Current spend", value: formatCurrency(contractSpend), delta: `Invoices ${formatCurrency(invoiceSpend)} · AP ${formatCurrency(apSpend)}`, tone: "slate" as const },
    { label: "Total savings", value: formatCurrencyExact(totalSavingsAmount), delta: `${Math.round(adjustedOpportunityRate * 100)}% of annual spend`, tone: "emerald" as const },
    { label: "Annual savings", value: formatCurrencyExact(annualSavings), delta: `${Math.round((annualSavings / Math.max(contractSpend, 1)) * 100)}% of spend`, tone: "sky" as const },
    { label: "One-time savings", value: formatCurrencyExact(oneTimeSavings), delta: `${highRiskCount} active findings`, tone: "amber" as const },
  ];

  const benchmarkServiceCandidates = allServiceRows
    .map((row, index) => {
      const annualPaid = annualAllocationByServiceId.get(row.service_id) ?? Math.round(Number(row.monthly_rate) * 12);
      const serviceType = benchmarkServiceTypeForCategory(row.category);
      const country = siteById.get(row.site_id)?.country ?? "United States";
      const localRng = createRng(`${row.service_id}-${serviceType}-${country}`);
      const percentileAnchors = [0.61, 0.65, 0.72, 0.68, 0.74, 0.63, 0.70, 0.66];
      const targetPaidPercentile = clamp(
        percentileAnchors[index % percentileAnchors.length] + (localRng() - 0.5) * 0.02,
        0.58,
        0.76,
      );
      const spread = annualPaid * (0.38 + localRng() * 0.18);
      const minimum = Math.max(Math.round(annualPaid - spread * targetPaidPercentile), 1);
      const maximum = Math.round(annualPaid + spread * (1 - targetPaidPercentile));
      const p25 = Math.round(minimum + spread * 0.25);
      const median = Math.round(minimum + spread * 0.5);
      const p75 = Math.round(minimum + spread * 0.75);
      const rawOpportunity = Math.max(annualPaid - median, 0);
      return {
        service_id: row.service_id,
        site_name: row.site_name,
        supplier_name: row.supplier_name,
        service_type: serviceType,
        location: country,
        minimum,
        p25,
        median,
        p75,
        maximum,
        paid_amount: annualPaid,
        raw_gap: rawOpportunity,
        raw_opportunity: rawOpportunity,
        benchmark_source: `${serviceType} ${country}`,
      };
    })
    .sort((a, b) => b.raw_opportunity - a.raw_opportunity);

  const benchmarkBucketTotal = bucketMap.get("Market benchmarks") ?? 0;
  const benchmarkRawTotal = benchmarkServiceCandidates.reduce((sum, row) => sum + row.raw_opportunity, 0) || 1;
  const benchmarkScale = benchmarkBucketTotal / benchmarkRawTotal;
  let benchmarkRemainder = Math.round(benchmarkBucketTotal);
  const benchmarkScaledRows = benchmarkServiceCandidates.map((row, index) => {
    const opportunity = Math.round(row.raw_opportunity * benchmarkScale);
    benchmarkRemainder -= opportunity;
    return {
      ...row,
      savings_opportunity: Math.max(index === benchmarkServiceCandidates.length - 1 ? opportunity + benchmarkRemainder : opportunity, 0),
      savings_floor: Math.max(row.paid_amount - row.p75, 0),
      savings_ceiling: Math.max(row.paid_amount - row.minimum, 0),
    };
  });
  if (benchmarkScaledRows.length > 0) {
    const benchmarkRowTotal = benchmarkScaledRows.reduce((sum, row) => sum + row.savings_opportunity, 0);
    benchmarkScaledRows[benchmarkScaledRows.length - 1].savings_opportunity += Math.round(benchmarkBucketTotal - benchmarkRowTotal);
  }
  const benchmarkServiceDetailsMap = new Map<
    string,
    BenchmarkServiceDetail
  >();
  for (const row of benchmarkScaledRows) {
    const key = `${row.site_name}::${row.service_type}::${row.location}`;
    const existing = benchmarkServiceDetailsMap.get(key);
    if (!existing) {
      benchmarkServiceDetailsMap.set(key, {
        service_id: row.service_id,
        site_name: row.site_name,
        supplier_name: row.supplier_name,
        service_type: row.service_type,
        location: row.location,
        minimum: row.minimum,
        p25: row.p25,
        median: row.median,
        p75: row.p75,
        maximum: row.maximum,
        paid_amount: row.paid_amount,
        raw_gap: row.raw_gap,
        savings_opportunity: row.savings_opportunity,
        savings_floor: row.savings_floor,
        savings_ceiling: row.savings_ceiling,
        benchmark_source: row.benchmark_source,
        vendor_comparison: [],
      });
      continue;
    }
    existing.minimum += row.minimum;
    existing.p25 += row.p25;
    existing.median += row.median;
    existing.p75 += row.p75;
    existing.maximum += row.maximum;
    existing.paid_amount += row.paid_amount;
    existing.raw_gap += row.raw_gap;
    existing.savings_opportunity += row.savings_opportunity;
    existing.savings_floor += row.savings_floor;
    existing.savings_ceiling += row.savings_ceiling;
  }
  for (const row of benchmarkServiceDetailsMap.values()) {
    const groupRng = createRng(`${row.site_name}::${row.service_type}::${row.location}`);
    const paidAnchor = clamp(0.58 + groupRng() * 0.18, 0.58, 0.76);
    const spread = Math.max(row.paid_amount * (0.42 + groupRng() * 0.18), 1);
    row.minimum = Math.max(Math.round(row.paid_amount - spread * paidAnchor), 1);
    row.maximum = Math.round(row.paid_amount + spread * (1 - paidAnchor));
    row.p25 = Math.round(row.minimum + spread * 0.25);
    row.median = Math.round(row.minimum + spread * 0.5);
    row.p75 = Math.round(row.minimum + spread * 0.75);
    row.raw_gap = Math.max(row.paid_amount - row.median, 0);
  }
  const vendorGroupedTotals = new Map<string, { sum: number; count: number; vendor_name: string; service_type: string; location: string }>();
  for (const service of allServiceRows) {
    const serviceType = benchmarkServiceTypeForCategory(service.category);
    const country = siteById.get(service.site_id)?.country ?? "United States";
    const key = `${serviceType}::${service.supplier_name}`;
    const existing = vendorGroupedTotals.get(key) ?? {
      sum: 0,
      count: 0,
      vendor_name: service.supplier_name,
      service_type: serviceType,
      location: country,
    };
    existing.sum += annualAllocationByServiceId.get(service.service_id) ?? Math.round(Number(service.monthly_rate) * 12);
    existing.count += 1;
    vendorGroupedTotals.set(key, existing);
  }
  const vendorBucketAverages = new Map<string, Array<{ vendor_name: string; paid_amount: number }>>();
  for (const bucket of vendorGroupedTotals.values()) {
    const key = bucket.service_type;
    const list = vendorBucketAverages.get(key) ?? [];
    list.push({
      vendor_name: bucket.vendor_name,
      paid_amount: Math.round(bucket.sum / Math.max(bucket.count, 1)),
    });
    vendorBucketAverages.set(key, list);
  }
  for (const row of benchmarkServiceDetailsMap.values()) {
    const currentVendorAverage = vendorBucketAverages
      .get(row.service_type)
      ?.find((entry) => entry.vendor_name === row.supplier_name)?.paid_amount ?? row.paid_amount;
    const reference = currentVendorAverage > 0 ? currentVendorAverage : row.paid_amount;
    const comparisonSeed = createRng(`${row.service_type}::${row.location}::${row.supplier_name}`);
    const peerVendorNames = vendorUniverse.filter((name) => name !== row.supplier_name);
    const peerNames = [peerVendorNames[0], peerVendorNames[3], peerVendorNames[5]].filter(Boolean);
    const peerLow = Math.round(reference * (0.84 + comparisonSeed() * 0.04));
    const peerMid = Math.round(reference * (0.94 + comparisonSeed() * 0.04));
    const peerHigh = Math.round(reference * (1.03 + comparisonSeed() * 0.05));
    row.vendor_comparison = [
      {
        vendor_name: peerNames[0] ?? "Peer vendor A",
        paid_amount: peerLow,
        position_label: "Lower-cost peer",
        is_current: false,
      },
      {
        vendor_name: peerNames[1] ?? "Peer vendor B",
        paid_amount: peerMid,
        position_label: "Median peer",
        is_current: false,
      },
      {
        vendor_name: peerNames[2] ?? "Peer vendor C",
        paid_amount: peerHigh,
        position_label: "Higher-cost peer",
        is_current: false,
      },
      {
        vendor_name: row.supplier_name,
        paid_amount: currentVendorAverage,
        position_label: "Current supplier",
        is_current: true,
      },
    ];
  }
  const benchmarkServiceDetails = [...benchmarkServiceDetailsMap.values()].sort((a, b) => b.savings_opportunity - a.savings_opportunity);

  const siteOpportunityRate = totalOpportunityAmount / Math.max(contractSpend, 1);
  let siteOpportunityRemainder = totalOpportunityAmount;
  for (const site of sitesDetailed) {
    const annualOpportunity = Math.round(site.annual_spend * siteOpportunityRate);
    site.annual_opportunity = annualOpportunity;
    siteOpportunityRemainder -= annualOpportunity;
  }
  if (sitesDetailed.length > 0) {
    sitesDetailed[0].annual_opportunity += siteOpportunityRemainder;
  }

  const bucketShares = opportunityBreakdown.reduce<Record<string, number>>((acc, bucket) => {
    acc[bucket.bucket] = bucket.share;
    return acc;
  }, {});

  for (const site of sitesDetailed) {
    const breakdown = bucketOrder.map((bucket) => {
      const amount = Math.round(site.annual_opportunity * (bucketShares[bucket] ?? 0));
      return {
        bucket,
        amount,
        share: amount / Math.max(site.annual_opportunity, 1),
      };
    });
    site.opportunity_breakdown = breakdown;
  }

  const waterfallBridge: WaterfallBridgeStep[] = [
    { label: "Current spend", value: contractSpend, kind: "start", tone: "slate" },
    { label: "Network optimization", value: bucketMap.get("Network optimization") ?? 0, kind: "reduction", tone: "emerald" },
    { label: "Billing errors", value: bucketMap.get("Billing errors") ?? 0, kind: "reduction", tone: "amber" },
    { label: "Market benchmarks", value: bucketMap.get("Market benchmarks") ?? 0, kind: "reduction", tone: "sky" },
    { label: "New spend", value: Math.max(contractSpend - annualSavings, 0), kind: "end", tone: "rose" },
  ];

  return {
    generated_at: new Date().toISOString(),
    narrative,
    portfolio_counts: {
      sites: totalSites,
      services: totalServices,
      contracts: totalContracts,
      invoices: totalInvoices,
      ap_records: totalApRecords,
      service_types: totalServiceTypes,
    },
    portfolio_financials: {
      contract_spend: contractSpend,
      invoice_spend: invoiceSpend,
      ap_spend: apSpend,
      total_opportunity: totalOpportunityAmount,
      opportunity_rate: adjustedOpportunityRate,
      total_savings: annualSavings,
      total_recovery: oneTimeSavings,
      revenue_savings: annualSavings,
      sg_and_a_savings: sgAndASavings,
      shared_savings: sharedSavings,
    },
    kpis,
    waterfall_bridge: waterfallBridge,
    tower_spend: towerSpend,
    hotspots,
    opportunity_breakdown: opportunityBreakdown,
    top_suppliers: topSuppliers,
    inputs_summary: {
      counts: [
        { label: "Contracts", value: totalContracts, note: "Active contract records" },
        { label: "Invoices", value: totalInvoices, note: "Invoice documents ingested" },
        { label: "AP records", value: totalApRecords, note: "AP line items matched" },
        { label: "Sites", value: totalSites, note: "Operational locations" },
        { label: "Services", value: totalServices, note: "Service-level records" },
        { label: "Service types", value: totalServiceTypes, note: "Unique service categories" },
      ],
      uploads: [
        { label: "Contracts", helper: "Upload PDF contract packets" },
        { label: "Invoices", helper: "Upload invoice PDFs or workbooks" },
        { label: "AP records", helper: "Upload AP export workbook" },
      ],
      connectors_coming_soon: [
        { group: "Benchmark sources", items: ["Lightyear", "Telegeography", "Telecom benchmarking feeds", "Carrier brokerage datasets"] },
        { group: "ERP systems", items: ["SAP", "Oracle Fusion", "NetSuite"] },
        { group: "Contract management", items: ["Icertis", "Ironclad", "DocuSign CLM"] },
        { group: "Finance systems", items: ["Workday Financials", "Coupa", "BlackLine"] },
      ],
    },
    network_optimization_sites: networkOptimizationSites,
    billing_invoice_details: billingInvoiceDetails,
    benchmark_service_details: benchmarkServiceDetails,
    benchmark_rows: benchmarkRows.map((row) => ({
      category: String(row.category),
      location: String(row.location),
      currency: String(row.currency),
      client_rate: Number(row.client_rate),
      p25: Number(row.p25),
      median: Number(row.median),
      p75: Number(row.p75),
      confidence: Number(row.confidence),
      sample_size: Number(row.sample_size),
    })),
    renewals,
    findings: findingsRows,
    sites: sitesDetailed,
    classification_rows: classificationRows.map((row) => ({
      service_id: String(row.service_id),
      site_name: String(row.site_name),
      service_category: String(row.service_category),
      tower: row.tower as SpendTower,
      confidence: Number(row.confidence),
      reason_code: String(row.reason_code),
      annualized_spend: Number(row.annualized_spend),
    })),
    inventory_exceptions: inventoryExceptions.map((row) => ({
      service_id: String(row.service_id),
      site_name: String(row.site_name),
      exception_state: String(row.exception_state),
      supplier_name: String(row.supplier_name),
      monthly_rate: Number(row.monthly_rate),
      contract_id: String(row.contract_id),
    })),
    billing_anomalies: billingAnomalies.map((row) => ({
      anomaly_type: String(row.anomaly_type),
      count: Number(row.count),
      recoverable_amount: Number(row.recoverable_amount),
    })),
    review_kanban: reviewKanban.map((row) => ({
      state: String(row.state),
      count: Number(row.count),
    })),
    ingestion_summary: ingestionSummary,
    admin_summary: adminSummary,
  };
}

export async function getDashboardSnapshot(): Promise<DashboardSnapshot> {
  return readSnapshotCache() ?? readEmbeddedSnapshot() ?? getDatabaseDashboardSnapshot();
}
