export type SpendTower =
  | "Revenue-driving network"
  | "SG&A telecom"
  | "Shared";

export type SiteArchetype =
  | "Corporate office"
  | "Studio lot"
  | "Production facility"
  | "Distribution node"
  | "Data center or colocation site"
  | "Regional office - domestic"
  | "Regional office - international"
  | "Broadcast hub or playout facility"
  | "Streaming-adjacent or digital operations hub";

export type DashboardKpi = {
  label: string;
  value: string;
  delta: string;
  tone: "emerald" | "amber" | "sky" | "rose" | "slate";
};

export type WaterfallBridgeStep = {
  label: string;
  value: number;
  kind: "start" | "reduction" | "end";
  tone: "emerald" | "amber" | "sky" | "rose" | "slate";
};

export type TowerSpend = {
  tower: SpendTower;
  amount: number;
  share: number;
};

export type Hotspot = {
  label: string;
  region: string;
  country: string;
  savings: number;
  risk: number;
};

export type SiteOpportunityBucket = {
  bucket: string;
  amount: number;
  share: number;
};

export type FindingCard = {
  finding_id: string;
  finding_type: string;
  impact_type: string;
  estimated_annualized_savings: number;
  one_time_recovery: number;
  confidence: number;
  risk_rating: string;
  recommended_next_step: string;
  review_status: string;
  supplier_name: string;
  site_name: string;
  site_id: string;
  tower: SpendTower;
  source_file: string;
  source_reference: string;
  contract_clause: string;
  invoice_line: string;
  ap_record: string;
  usage_record: string;
  benchmark_source: string;
  reviewer_history: string;
  created_at: string;
  reviewed_at: string | null;
};

export type Site360 = {
  site_id: string;
  site_name: string;
  archetype: SiteArchetype;
  region: string;
  country: string;
  criticality: number;
  revenue_sensitive: boolean;
  tower: SpendTower;
  primary_network_role: string;
  backup_network_role: string | null;
  annual_spend: number;
  annual_opportunity: number;
  service_count: number;
  opportunity_breakdown: SiteOpportunityBucket[];
  latitude: number;
  longitude: number;
  services: Array<{
    service_id: string;
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
  }>;
};

export type NetworkOptimizationSite = {
  site_id: string;
  site_name: string;
  archetype: SiteArchetype;
  country: string;
  tower: SpendTower;
  annual_spend: number;
  site_savings: number;
  service_count: number;
  services: Array<{
    service_id: string;
    category: string;
    access_type: string;
    status: string;
    utilization: number;
    monthly_rate: number;
    annualized_savings: number;
    recommendation: string;
    primary_or_backup_role: string;
    sla_tier: string;
    routing_diversity: string;
  }>;
};

export type BillingInvoiceDetail = {
  invoice_id: string;
  bill_period: string;
  site_name: string;
  supplier_name: string;
  line_count: number;
  billed_amount: number;
  expected_amount: number;
  variance_amount: number;
  recoverable_amount: number;
  note: string;
  lines: Array<{
    invoice_line_id: string;
    line_description: string;
    service_id: string;
    amount: number;
    expected_amount: number;
    variance_amount: number;
    recoverable_amount: number;
    duplicate_charge: boolean;
    payment_status: string;
    source_reference: string;
  }>;
};

export type BenchmarkServiceDetail = {
  service_id: string;
  site_name: string;
  supplier_name: string;
  service_type: string;
  location: string;
  minimum: number;
  p25: number;
  median: number;
  p75: number;
  maximum: number;
  paid_amount: number;
  raw_gap: number;
  savings_opportunity: number;
  savings_floor: number;
  savings_ceiling: number;
  benchmark_source: string;
  vendor_comparison: Array<{
    vendor_name: string;
    paid_amount: number;
    position_label: string;
    is_current: boolean;
  }>;
};

export type DashboardSnapshot = {
  generated_at: string;
  narrative: string;
  portfolio_counts: {
    sites: number;
    services: number;
    contracts: number;
    invoices: number;
    ap_records: number;
    service_types: number;
  };
  portfolio_financials: {
    contract_spend: number;
    invoice_spend: number;
    ap_spend: number;
    total_opportunity: number;
    opportunity_rate: number;
    total_savings: number;
    total_recovery: number;
    revenue_savings: number;
    sg_and_a_savings: number;
    shared_savings: number;
  };
  kpis: DashboardKpi[];
  waterfall_bridge: WaterfallBridgeStep[];
  tower_spend: TowerSpend[];
  hotspots: Hotspot[];
  opportunity_breakdown: Array<{
    bucket: string;
    amount: number;
    share: number;
  }>;
  top_suppliers: Array<{ supplier_name: string; savings: number }>;
  inputs_summary: {
    counts: Array<{
      label: string;
      value: number;
      note: string;
    }>;
    uploads: Array<{
      label: string;
      helper: string;
    }>;
    connectors_coming_soon: Array<{
      group: string;
      items: string[];
    }>;
  };
  benchmark_rows: Array<{
    category: string;
    location: string;
    currency: string;
    client_rate: number;
    p25: number;
    median: number;
    p75: number;
    confidence: number;
    sample_size: number;
  }>;
  renewals: Array<{
    contract_id: string;
    supplier_name: string;
    site_name: string;
    days_to_renewal: number;
    risk_score: number;
    clause_risk: string;
    annual_spend: number;
  }>;
  findings: FindingCard[];
  sites: Site360[];
  network_optimization_sites: NetworkOptimizationSite[];
  billing_invoice_details: BillingInvoiceDetail[];
  benchmark_service_details: BenchmarkServiceDetail[];
  classification_rows: Array<{
    service_id: string;
    site_name: string;
    service_category: string;
    tower: SpendTower;
    confidence: number;
    reason_code: string;
    annualized_spend: number;
  }>;
  inventory_exceptions: Array<{
    service_id: string;
    site_name: string;
    exception_state: string;
    supplier_name: string;
    monthly_rate: number;
    contract_id: string;
  }>;
  billing_anomalies: Array<{
    anomaly_type: string;
    count: number;
    recoverable_amount: number;
  }>;
  review_kanban: Array<{
    state: string;
    count: number;
  }>;
  ingestion_summary: {
    files: string[];
    mapped_rows: number;
    unmapped_rows: number;
    confidence: number;
    generated_assets: string[];
  };
  admin_summary: Array<{
    setting: string;
    value: string;
    note: string;
  }>;
};
