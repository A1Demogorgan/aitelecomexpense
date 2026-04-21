import type { SiteArchetype, SpendTower } from "./types";

export type SiteRow = {
  site_id: string;
  site_name: string;
  archetype: SiteArchetype;
  region: string;
  country: string;
  metro: string;
  site_type: string;
  criticality: number;
  business_owner: string;
  revenue_sensitive: boolean;
  resilience_required: boolean;
  tower: SpendTower;
  primary_network_role: string;
  backup_network_role: string | null;
  cost_center: string;
  currency: string;
  site_index: number;
  latitude: number;
  longitude: number;
};

export type SupplierRow = {
  supplier_id: string;
  supplier_name: string;
  account_hierarchy: string;
  currency: string;
  invoice_channel: string;
};

export type ContractRow = {
  contract_id: string;
  supplier_id: string;
  supplier_name: string;
  archetype: SiteArchetype | "Mixed portfolio";
  country_scope: string;
  start_date: string;
  end_date: string;
  rate_card: string;
  discount_schedule: string;
  escalation_clause: string;
  renewal_terms: string;
  auto_renew: string;
  termination_terms: string;
  clause_risk: string;
  tower: SpendTower;
  annual_spend_target: number;
  sites_covered: string[];
};

export type ServiceRow = {
  service_id: string;
  site_id: string;
  site_name: string;
  supplier_id: string;
  supplier_name: string;
  contract_id: string;
  archetype: SiteArchetype;
  category: string;
  access_type: string;
  bandwidth_or_size: string;
  status: string;
  install_date: string;
  disconnect_date: string | null;
  primary_or_backup_role: string;
  sla_tier: string;
  routing_diversity: string;
  revenue_sensitive: boolean;
  tower: SpendTower;
  monthly_rate: number;
  utilization: number;
  committed_actual_ratio: number;
  reason_code: string;
};

export type InvoiceLineRow = {
  invoice_id: string;
  invoice_line_id: string;
  bill_period: string;
  line_description: string;
  amount: number;
  charge_type: string;
  billed_quantity: number;
  service_id: string;
  site_id: string;
  supplier_id: string;
  payment_status: string;
  source_file: string;
  source_sheet: string;
  source_reference: string;
  duplicate_charge: boolean;
};

export type ApRow = {
  voucher_number: string;
  paid_amount: number;
  payment_date: string;
  cost_center: string;
  duplicate_check_key: string;
  gl_mapping: string;
  project_mapping: string;
  invoice_id: string;
  site_id: string;
  supplier_id: string;
};

export type UsageRow = {
  service_id: string;
  period: string;
  utilization: number;
  ports: number;
  minutes: number;
  seats: number;
  sessions: number;
  committed_vs_actual: number;
};

export type BenchmarkRow = {
  benchmark_id: string;
  service_type: string;
  location: string;
  region: string;
  bandwidth: string;
  term: string;
  managed_flag: string;
  minimum: number;
  p25: number;
  median: number;
  p75: number;
  maximum: number;
  sample_size: number;
  source_date: string;
  confidence: number;
  currency: string;
  normalized_usd_median: number;
};

export type FindingRow = {
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

export type ReviewEventRow = {
  finding_id: string;
  event_at: string;
  actor: string;
  action: string;
  note: string;
};

const today = new Date();
const currentYear = today.getUTCFullYear();
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  "New York": { latitude: 40.7128, longitude: -74.006 },
  "Los Angeles": { latitude: 34.0522, longitude: -118.2437 },
  "Chicago": { latitude: 41.8781, longitude: -87.6298 },
  "Atlanta": { latitude: 33.749, longitude: -84.388 },
  "Dallas": { latitude: 32.7767, longitude: -96.797 },
  "Toronto": { latitude: 43.6532, longitude: -79.3832 },
  "Monterrey": { latitude: 25.6866, longitude: -100.3161 },
  "Burbank": { latitude: 34.1808, longitude: -118.3089 },
  "Culver City": { latitude: 34.0211, longitude: -118.3965 },
  "Austin": { latitude: 30.2672, longitude: -97.7431 },
  "Vancouver": { latitude: 49.2827, longitude: -123.1207 },
  "Guadalajara": { latitude: 20.6597, longitude: -103.3496 },
  "Ashburn": { latitude: 39.0438, longitude: -77.4874 },
  "Seattle": { latitude: 47.6062, longitude: -122.3321 },
  "Denver": { latitude: 39.7392, longitude: -104.9903 },
  "Secaucus": { latitude: 40.7895, longitude: -74.0565 },
  "Phoenix": { latitude: 33.4484, longitude: -112.074 },
  "Montreal": { latitude: 45.5017, longitude: -73.5673 },
  "Miami": { latitude: 25.7617, longitude: -80.1918 },
  "Boston": { latitude: 42.3601, longitude: -71.0589 },
  "London": { latitude: 51.5074, longitude: -0.1278 },
  "Manchester": { latitude: 53.4808, longitude: -2.2426 },
  "Birmingham": { latitude: 52.4862, longitude: -1.8904 },
  "Sydney": { latitude: -33.8688, longitude: 151.2093 },
  "Melbourne": { latitude: -37.8136, longitude: 144.9631 },
  "Mexico City": { latitude: 19.4326, longitude: -99.1332 },
  "Sao Paulo": { latitude: -23.5558, longitude: -46.6396 },
  "Rio de Janeiro": { latitude: -22.9068, longitude: -43.1729 },
  "Buenos Aires": { latitude: -34.6037, longitude: -58.3816 },
  "Santiago": { latitude: -33.4489, longitude: -70.6693 },
  "Madrid": { latitude: 40.4168, longitude: -3.7038 },
  "Paris": { latitude: 48.8566, longitude: 2.3522 },
  "Berlin": { latitude: 52.52, longitude: 13.405 },
  "Milan": { latitude: 45.4642, longitude: 9.19 },
  "Singapore": { latitude: 1.3521, longitude: 103.8198 },
  "San Francisco": { latitude: 37.7749, longitude: -122.4194 },
  "Montgomery Highway": { latitude: 33.448, longitude: -86.798 },
};

function getCoordinates(city: string, country: string, rng: () => number) {
  const base = cityCoordinates[city] ?? cityCoordinates[country] ?? { latitude: 39.8283, longitude: -98.5795 };
  return {
    latitude: Number((base.latitude + (rng() - 0.5) * 0.6).toFixed(6)),
    longitude: Number((base.longitude + (rng() - 0.5) * 0.6).toFixed(6)),
  };
}

function pad(num: number, width = 3) {
  return String(num).padStart(width, "0");
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

function pick<T>(items: T[], rng: () => number) {
  return items[Math.floor(rng() * items.length)];
}

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

function formatDateUtc(date: Date) {
  return date.toISOString().slice(0, 10);
}

function monthsAgo(months: number) {
  const date = new Date(Date.UTC(currentYear, today.getUTCMonth(), 1));
  date.setUTCMonth(date.getUTCMonth() - months);
  return date;
}

function makeMoney(base: number, rng: () => number, variance = 0.18) {
  return Math.round(base * (1 + (rng() - 0.5) * variance * 2));
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

const archetypeBlueprints: Array<{
  archetype: SiteArchetype;
  count: number;
  servicesPerSite: number;
  region: string;
  countryPool: string[];
  cityPool: string[];
  ownerPool: string[];
  tower: SpendTower;
  primaryRole: string;
  backupRole: string | null;
  resilienceRequired: boolean;
  revenueSensitive: boolean;
}> = [
  {
    archetype: "Corporate office",
    count: 52,
    servicesPerSite: 30,
    region: "North America",
    countryPool: ["United States", "United States", "United States", "Canada", "Mexico"],
    cityPool: ["New York", "Los Angeles", "Chicago", "Atlanta", "Dallas", "Toronto", "Monterrey"],
    ownerPool: ["Finance", "HR", "Legal", "Corporate IT", "Procurement"],
    tower: "SG&A telecom",
    primaryRole: "Corporate connectivity and collaboration",
    backupRole: "Backup internet",
    resilienceRequired: false,
    revenueSensitive: false,
  },
  {
    archetype: "Studio lot",
    count: 28,
    servicesPerSite: 75,
    region: "North America",
    countryPool: ["United States"],
    cityPool: ["Burbank", "Culver City", "Los Angeles", "New York"],
    ownerPool: ["Production", "Post-production", "Studio Operations"],
    tower: "Revenue-driving network",
    primaryRole: "Content creation and edit connectivity",
    backupRole: "Diverse fiber",
    resilienceRequired: true,
    revenueSensitive: true,
  },
  {
    archetype: "Production facility",
    count: 24,
    servicesPerSite: 40,
    region: "North America",
    countryPool: ["United States", "United States", "Canada", "Mexico"],
    cityPool: ["Atlanta", "Chicago", "Miami", "Austin", "Vancouver", "Guadalajara"],
    ownerPool: ["Production", "Field Operations", "Media Services"],
    tower: "Revenue-driving network",
    primaryRole: "Project and field production transport",
    backupRole: "Temporary circuit",
    resilienceRequired: true,
    revenueSensitive: true,
  },
  {
    archetype: "Distribution node",
    count: 18,
    servicesPerSite: 60,
    region: "North America",
    countryPool: ["United States"],
    cityPool: ["Chicago", "Ashburn", "Seattle", "Denver", "Dallas"],
    ownerPool: ["Distribution", "Network Engineering", "Media Operations"],
    tower: "Revenue-driving network",
    primaryRole: "Content delivery and transport handoff",
    backupRole: "Route diversity",
    resilienceRequired: true,
    revenueSensitive: true,
  },
  {
    archetype: "Data center or colocation site",
    count: 16,
    servicesPerSite: 100,
    region: "North America",
    countryPool: ["United States", "Canada"],
    cityPool: ["Ashburn", "Secaucus", "Dallas", "Phoenix", "Toronto", "Montreal"],
    ownerPool: ["Infrastructure", "Platform Operations", "Network Engineering"],
    tower: "Shared",
    primaryRole: "Backbone routing and hosting",
    backupRole: "Interconnect redundancy",
    resilienceRequired: true,
    revenueSensitive: true,
  },
  {
    archetype: "Regional office - domestic",
    count: 20,
    servicesPerSite: 20,
    region: "North America",
    countryPool: ["United States"],
    cityPool: ["New York", "Dallas", "Miami", "Chicago", "Boston", "Seattle", "Denver"],
    ownerPool: ["Regional Ops", "Sales", "Support", "Admin"],
    tower: "SG&A telecom",
    primaryRole: "Regional office connectivity",
    backupRole: "Backup internet",
    resilienceRequired: false,
    revenueSensitive: false,
  },
  {
    archetype: "Regional office - international",
    count: 18,
    servicesPerSite: 24,
    region: "EMEA / APAC / LATAM",
    countryPool: [
      "United Kingdom",
      "United Kingdom",
      "United Kingdom",
      "Australia",
      "Australia",
      "Brazil",
      "Brazil",
      "Argentina",
      "Chile",
      "Spain",
      "France",
      "Germany",
      "Italy",
      "Singapore",
      "Singapore",
    ],
    cityPool: [
      "London",
      "Manchester",
      "Birmingham",
      "Sydney",
      "Melbourne",
      "Sao Paulo",
      "Rio de Janeiro",
      "Buenos Aires",
      "Santiago",
      "Madrid",
      "Paris",
      "Berlin",
      "Milan",
      "Singapore",
      "Singapore",
    ],
    ownerPool: ["Regional Ops", "Commercial", "Digital Operations", "Support"],
    tower: "Shared",
    primaryRole: "International regional connectivity",
    backupRole: "Managed edge",
    resilienceRequired: false,
    revenueSensitive: true,
  },
  {
    archetype: "Broadcast hub or playout facility",
    count: 14,
    servicesPerSite: 110,
    region: "North America",
    countryPool: ["United States"],
    cityPool: ["New York", "Los Angeles", "Chicago", "Atlanta"],
    ownerPool: ["Broadcast Operations", "Master Control", "Transmission"],
    tower: "Revenue-driving network",
    primaryRole: "Playout and live transmission",
    backupRole: "Failover transport",
    resilienceRequired: true,
    revenueSensitive: true,
  },
  {
    archetype: "Streaming-adjacent or digital operations hub",
    count: 10,
    servicesPerSite: 55,
    region: "North America",
    countryPool: ["United States", "United Kingdom", "Singapore"],
    cityPool: ["Los Angeles", "New York", "London", "Singapore", "San Francisco"],
    ownerPool: ["Digital Operations", "Platform Support", "Subscriber Operations"],
    tower: "Shared",
    primaryRole: "Subscriber and digital delivery support",
    backupRole: "Cloud interconnect",
    resilienceRequired: true,
    revenueSensitive: true,
  },
];

const suppliers = [
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

const serviceCategoryTemplates: Record<
  SiteArchetype,
  Array<{
    category: string;
    accessType: string;
    bandwidth: string;
    role: string;
    slaTier: string;
    routingDiversity: string;
    rateBase: number;
    tower: SpendTower;
    revenueSensitive: boolean;
  }>
> = {
  "Corporate office": [
    { category: "Business broadband", accessType: "Broadband", bandwidth: "500 Mbps", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 620, tower: "SG&A telecom", revenueSensitive: false },
    { category: "DIA", accessType: "Dedicated internet", bandwidth: "1 Gbps", role: "Primary", slaTier: "Tier 2", routingDiversity: "Single path", rateBase: 1250, tower: "SG&A telecom", revenueSensitive: false },
    { category: "SD-WAN", accessType: "Managed edge", bandwidth: "50 Mbps", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 420, tower: "SG&A telecom", revenueSensitive: false },
    { category: "UCaaS", accessType: "Collaboration", bandwidth: "Seat bundle", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 210, tower: "SG&A telecom", revenueSensitive: false },
    { category: "Mobility", accessType: "Mobile", bandwidth: "Pool", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 160, tower: "SG&A telecom", revenueSensitive: false },
    { category: "Backup internet", accessType: "Broadband", bandwidth: "300 Mbps", role: "Backup", slaTier: "Tier 2", routingDiversity: "Diverse", rateBase: 300, tower: "SG&A telecom", revenueSensitive: false },
    { category: "Secure edge", accessType: "Security", bandwidth: "Branch firewall", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 250, tower: "SG&A telecom", revenueSensitive: false },
  ],
  "Studio lot": [
    { category: "Studio fiber", accessType: "Fiber", bandwidth: "10 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 3800, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Production interconnect", accessType: "Interconnect", bandwidth: "2 x 10 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 3200, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Edit suite WAN", accessType: "WAN", bandwidth: "2 Gbps", role: "Primary", slaTier: "Tier 3", routingDiversity: "Standard", rateBase: 1450, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Secure Wi-Fi", accessType: "Wireless", bandwidth: "Campus", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 780, tower: "Shared", revenueSensitive: true },
    { category: "Vendor access", accessType: "Guest access", bandwidth: "Access bundle", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 520, tower: "Shared", revenueSensitive: true },
    { category: "Temporary circuit", accessType: "Project circuit", bandwidth: "1 Gbps", role: "Backup", slaTier: "Tier 3", routingDiversity: "Diverse", rateBase: 980, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Backup fiber", accessType: "Fiber", bandwidth: "5 Gbps", role: "Backup", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 2600, tower: "Revenue-driving network", revenueSensitive: true },
  ],
  "Production facility": [
    { category: "Temporary internet", accessType: "Project circuit", bandwidth: "500 Mbps", role: "Primary", slaTier: "Tier 3", routingDiversity: "Standard", rateBase: 1100, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Field VPN", accessType: "VPN", bandwidth: "License", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 390, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Mobile data", accessType: "Mobile", bandwidth: "Pool", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 210, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Event connectivity", accessType: "Event circuit", bandwidth: "1 Gbps", role: "Primary", slaTier: "Tier 3", routingDiversity: "Diverse", rateBase: 1800, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Short-term voice", accessType: "Voice", bandwidth: "Lines", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 260, tower: "SG&A telecom", revenueSensitive: false },
    { category: "Temporary backup", accessType: "Project circuit", bandwidth: "300 Mbps", role: "Backup", slaTier: "Tier 3", routingDiversity: "Standard", rateBase: 760, tower: "Revenue-driving network", revenueSensitive: true },
  ],
  "Distribution node": [
    { category: "Long-haul transport", accessType: "Transport", bandwidth: "10 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 3400, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Fiber backhaul", accessType: "Backhaul", bandwidth: "5 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 2200, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Interconnect", accessType: "Interconnect", bandwidth: "10 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 2900, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "CDN adjacency", accessType: "Adjacency", bandwidth: "2 Gbps", role: "Primary", slaTier: "Tier 3", routingDiversity: "Diverse", rateBase: 1450, tower: "Shared", revenueSensitive: true },
    { category: "Resilient WAN", accessType: "WAN", bandwidth: "1 Gbps", role: "Backup", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 1750, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Route diversity premium", accessType: "Transport", bandwidth: "Premium", role: "Backup", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 820, tower: "Revenue-driving network", revenueSensitive: true },
  ],
  "Data center or colocation site": [
    { category: "Cross-connect", accessType: "Interconnect", bandwidth: "Port", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 180, tower: "Shared", revenueSensitive: true },
    { category: "Ethernet transport", accessType: "Ethernet", bandwidth: "10 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 3600, tower: "Shared", revenueSensitive: true },
    { category: "Wavelength", accessType: "Wave", bandwidth: "100 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 6200, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "IP transit", accessType: "Transit", bandwidth: "1 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 2100, tower: "Shared", revenueSensitive: true },
    { category: "Colocation cabinet", accessType: "Colo", bandwidth: "Cabinet", role: "Primary", slaTier: "Tier 4", routingDiversity: "Standard", rateBase: 1550, tower: "Shared", revenueSensitive: true },
    { category: "Redundant transport", accessType: "Transport", bandwidth: "5 Gbps", role: "Backup", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 2350, tower: "Shared", revenueSensitive: true },
  ],
  "Regional office - domestic": [
    { category: "Business broadband", accessType: "Broadband", bandwidth: "500 Mbps", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 580, tower: "SG&A telecom", revenueSensitive: false },
    { category: "SD-WAN", accessType: "Managed edge", bandwidth: "50 Mbps", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 410, tower: "SG&A telecom", revenueSensitive: false },
    { category: "UCaaS", accessType: "Collaboration", bandwidth: "Seat bundle", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 220, tower: "SG&A telecom", revenueSensitive: false },
    { category: "Mobility", accessType: "Mobile", bandwidth: "Pool", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 150, tower: "SG&A telecom", revenueSensitive: false },
    { category: "Backup internet", accessType: "Broadband", bandwidth: "300 Mbps", role: "Backup", slaTier: "Tier 2", routingDiversity: "Diverse", rateBase: 290, tower: "SG&A telecom", revenueSensitive: false },
  ],
  "Regional office - international": [
    { category: "Local access", accessType: "Access", bandwidth: "500 Mbps", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 760, tower: "SG&A telecom", revenueSensitive: true },
    { category: "Managed edge", accessType: "Managed edge", bandwidth: "50 Mbps", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 510, tower: "Shared", revenueSensitive: true },
    { category: "Collaboration bundle", accessType: "Collaboration", bandwidth: "Seat bundle", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 260, tower: "SG&A telecom", revenueSensitive: true },
    { category: "Country mobile plan", accessType: "Mobile", bandwidth: "Pool", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 190, tower: "SG&A telecom", revenueSensitive: true },
    { category: "Regional backhaul", accessType: "Backhaul", bandwidth: "1 Gbps", role: "Backup", slaTier: "Tier 2", routingDiversity: "Diverse", rateBase: 930, tower: "Shared", revenueSensitive: true },
  ],
  "Broadcast hub or playout facility": [
    { category: "Contribution link", accessType: "Transport", bandwidth: "10 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 4200, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Satellite uplink", accessType: "Uplink", bandwidth: "Premium", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 6800, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Playout WAN", accessType: "WAN", bandwidth: "5 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 2900, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Failover circuit", accessType: "Transport", bandwidth: "2 Gbps", role: "Backup", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 1800, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Broadcast premium", accessType: "Transport", bandwidth: "Premium", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 950, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Maintenance access", accessType: "Access", bandwidth: "Admin", role: "Primary", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 320, tower: "SG&A telecom", revenueSensitive: false },
  ],
  "Streaming-adjacent or digital operations hub": [
    { category: "Cloud interconnect", accessType: "Interconnect", bandwidth: "10 Gbps", role: "Primary", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 3300, tower: "Shared", revenueSensitive: true },
    { category: "CDN adjacency", accessType: "Adjacency", bandwidth: "2 Gbps", role: "Primary", slaTier: "Tier 3", routingDiversity: "Diverse", rateBase: 1550, tower: "Revenue-driving network", revenueSensitive: true },
    { category: "Digital WAN", accessType: "WAN", bandwidth: "1 Gbps", role: "Primary", slaTier: "Tier 3", routingDiversity: "Diverse", rateBase: 1650, tower: "Shared", revenueSensitive: true },
    { category: "Voice and collaboration", accessType: "Collaboration", bandwidth: "Seat bundle", role: "Primary", slaTier: "Tier 1", routingDiversity: "Standard", rateBase: 290, tower: "SG&A telecom", revenueSensitive: false },
    { category: "Managed security edge", accessType: "Security", bandwidth: "Edge", role: "Backup", slaTier: "Tier 2", routingDiversity: "Standard", rateBase: 760, tower: "Shared", revenueSensitive: true },
    { category: "Hybrid backhaul", accessType: "Backhaul", bandwidth: "5 Gbps", role: "Backup", slaTier: "Tier 4", routingDiversity: "Diverse", rateBase: 2100, tower: "Shared", revenueSensitive: true },
  ],
};

export function buildSeedDataset() {
  const sites: SiteRow[] = [];
  const services: ServiceRow[] = [];
  const contracts: ContractRow[] = [];
  const invoiceLines: InvoiceLineRow[] = [];
  const apRows: ApRow[] = [];
  const usageRows: UsageRow[] = [];
  const benchmarkRows: BenchmarkRow[] = [];
  const findings: FindingRow[] = [];
  const reviewEvents: ReviewEventRow[] = [];

  const supplierRows: SupplierRow[] = suppliers.map((supplier_name, index) => ({
    supplier_id: `SUP-${pad(index + 1)}`,
    supplier_name,
    account_hierarchy: index < 4 ? "Tier 1 global" : index < 7 ? "Tier 2 regional" : "Tier 3 specialist",
    currency: index < 3 ? "USD" : index < 6 ? "EUR" : "Local",
    invoice_channel: index % 2 === 0 ? "EDI" : "PDF",
  }));

  let siteSequence = 1;
  let serviceSequence = 1;
  let contractSequence = 1;
  let invoiceSequence = 1;
  let apSequence = 1;
  let findingSequence = 1;

  const siteRowsByArchetype: Record<SiteArchetype, SiteRow[]> = {} as Record<SiteArchetype, SiteRow[]>;
  const contractRowsByArchetype: Record<string, ContractRow[]> = {};

  archetypeBlueprints.forEach((blueprint) => {
    siteRowsByArchetype[blueprint.archetype] = [];
  });

  for (const blueprint of archetypeBlueprints) {
    for (let i = 0; i < blueprint.count; i += 1) {
      const localRng = createRng(`${blueprint.archetype}-${i}`);
      const country = pick(blueprint.countryPool, localRng);
      const city = pick(blueprint.cityPool, localRng);
      const geo = getCoordinates(city, country, localRng);
      const site_id = `${blueprint.archetype.startsWith("Regional office") ? "RO" : blueprint.archetype.startsWith("Broadcast") ? "BH" : blueprint.archetype.startsWith("Corporate") ? "CO" : blueprint.archetype.startsWith("Studio") ? "ST" : blueprint.archetype.startsWith("Production") ? "PR" : blueprint.archetype.startsWith("Distribution") ? "DN" : blueprint.archetype.startsWith("Data center") ? "DC" : "DG"}-${pad(siteSequence)}`;
      const siteNamePrefix = {
        "Corporate office": ["Corporate Center", "HQ", "Business Office"],
        "Studio lot": ["Studio Campus", "Studio Lot", "Production Campus"],
        "Production facility": ["Production Support", "Field Operations", "Production Facility"],
        "Distribution node": ["Distribution Hub", "Delivery Node", "Transport Hub"],
        "Data center or colocation site": ["Colocation Node", "Interconnect Site", "Data Center"],
        "Regional office - domestic": ["Regional Operations", "Regional Office", "Field Office"],
        "Regional office - international": ["Regional Operations", "Regional Support", "International Office"],
        "Broadcast hub or playout facility": ["Playout Center", "Broadcast Hub", "Transmission Center"],
        "Streaming-adjacent or digital operations hub": ["Digital Operations Hub", "Streaming Support", "Platform Operations"],
      }[blueprint.archetype];
      const site_name = `${city} ${pick(siteNamePrefix, localRng)}`;
      const site: SiteRow = {
        site_id,
        site_name,
        archetype: blueprint.archetype,
        region: blueprint.region,
        country,
        metro: city,
        site_type: blueprint.archetype,
        criticality: blueprint.archetype === "Broadcast hub or playout facility" ? 5 : blueprint.archetype === "Data center or colocation site" ? 5 : blueprint.archetype === "Studio lot" ? 5 : blueprint.archetype === "Distribution node" ? 5 : blueprint.archetype === "Production facility" ? 4 : blueprint.archetype === "Streaming-adjacent or digital operations hub" ? 4 : 3,
        business_owner: pick(blueprint.ownerPool, localRng),
        revenue_sensitive: blueprint.revenueSensitive,
        resilience_required: blueprint.resilienceRequired,
        tower: blueprint.tower,
        primary_network_role: blueprint.primaryRole,
        backup_network_role: blueprint.backupRole,
        cost_center: `${country.slice(0, 2).toUpperCase()}-${pad(siteSequence, 4)}`,
        currency: country === "United States" || country === "Canada" ? "USD" : country === "United Kingdom" ? "GBP" : country === "Singapore" ? "SGD" : country === "Australia" ? "AUD" : country === "Brazil" ? "BRL" : country === "Mexico" ? "MXN" : country === "Argentina" ? "ARS" : country === "Chile" ? "CLP" : country === "France" || country === "Germany" || country === "Italy" || country === "Spain" ? "EUR" : "USD",
        site_index: siteSequence,
        latitude: geo.latitude,
        longitude: geo.longitude,
      };
      siteRowsByArchetype[blueprint.archetype].push(site);
      sites.push(site);
      siteSequence += 1;
    }
  }

  const contractBlueprints: Array<{
    archetype: SiteArchetype;
    total: number;
    tower: SpendTower;
    supplierPick: number;
    annualSpendBase: number;
    clauseRisk: string;
  }> = [
    { archetype: "Corporate office", total: 6, tower: "SG&A telecom", supplierPick: 0, annualSpendBase: 260000, clauseRisk: "Moderate" },
    { archetype: "Studio lot", total: 4, tower: "Revenue-driving network", supplierPick: 1, annualSpendBase: 1180000, clauseRisk: "High" },
    { archetype: "Production facility", total: 3, tower: "Revenue-driving network", supplierPick: 2, annualSpendBase: 680000, clauseRisk: "High" },
    { archetype: "Distribution node", total: 3, tower: "Revenue-driving network", supplierPick: 3, annualSpendBase: 920000, clauseRisk: "High" },
    { archetype: "Data center or colocation site", total: 4, tower: "Shared", supplierPick: 4, annualSpendBase: 1360000, clauseRisk: "Moderate" },
    { archetype: "Regional office - domestic", total: 2, tower: "SG&A telecom", supplierPick: 5, annualSpendBase: 180000, clauseRisk: "Low" },
    { archetype: "Regional office - international", total: 2, tower: "Shared", supplierPick: 6, annualSpendBase: 240000, clauseRisk: "Moderate" },
    { archetype: "Broadcast hub or playout facility", total: 4, tower: "Revenue-driving network", supplierPick: 7, annualSpendBase: 1850000, clauseRisk: "High" },
    { archetype: "Streaming-adjacent or digital operations hub", total: 2, tower: "Shared", supplierPick: 8, annualSpendBase: 720000, clauseRisk: "Moderate" },
  ];

  for (const blueprint of contractBlueprints) {
    for (let i = 0; i < blueprint.total; i += 1) {
      const localRng = createRng(`${blueprint.archetype}-contract-${i}`);
      const supplier = supplierRows[(blueprint.supplierPick + i) % supplierRows.length];
      const coveredSites = siteRowsByArchetype[blueprint.archetype].slice(i * 2, i * 2 + 12).map((site) => site.site_id);
      const start = monthsAgo(34 - i * 2);
      const end = new Date(Date.UTC(start.getUTCFullYear() + 3, start.getUTCMonth(), 1));
      const contract: ContractRow = {
        contract_id: `CTR-${pad(contractSequence)}`,
        supplier_id: supplier.supplier_id,
        supplier_name: supplier.supplier_name,
        archetype: blueprint.archetype,
        country_scope: blueprint.archetype === "Regional office - international" ? "Multi-country" : blueprint.archetype === "Regional office - domestic" ? "United States" : blueprint.archetype === "Corporate office" ? "United States and Canada" : "Global",
        start_date: formatDateUtc(start),
        end_date: formatDateUtc(end),
        rate_card: blueprint.archetype === "Broadcast hub or playout facility" ? "Premium transport and redundancy rate card" : blueprint.archetype === "Data center or colocation site" ? "Interconnect and colocation rate card" : blueprint.archetype === "Studio lot" ? "Media transport rate card" : "Standard telecom rate card",
        discount_schedule: `${clamp(8 + Math.floor(localRng() * 16), 8, 24)}% tiered discount with volume triggers`,
        escalation_clause: blueprint.archetype === "Regional office - international" ? "Local CPI or CPI+1.5%" : "Annual CPI-based escalation",
        renewal_terms: blueprint.archetype === "Production facility" ? "Project-close auto-expire plus short notice" : "Renewal review 120 days before term end",
        auto_renew: i % 2 === 0 ? "Yes" : "No",
        termination_terms: blueprint.archetype === "Broadcast hub or playout facility" ? "60-day notice, restricted blackout windows" : "30-day standard notice",
        clause_risk: blueprint.clauseRisk,
        tower: blueprint.tower,
        annual_spend_target: makeMoney(blueprint.annualSpendBase, localRng, 0.22),
        sites_covered: coveredSites.length ? coveredSites : siteRowsByArchetype[blueprint.archetype].slice(0, 4).map((site) => site.site_id),
      };
      contracts.push(contract);
      contractRowsByArchetype[blueprint.archetype] ||= [];
      contractRowsByArchetype[blueprint.archetype].push(contract);
      contractSequence += 1;
    }
  }

  const invoiceMonths = Array.from({ length: 12 }, (_, index) => monthsAgo(11 - index));

  for (const site of sites) {
    const blueprint = archetypeBlueprints.find((item) => item.archetype === site.archetype)!;
    const templates = serviceCategoryTemplates[site.archetype];
    const siteContracts = contractRowsByArchetype[site.archetype] ?? contracts;
    const serviceCount = blueprint.servicesPerSite;
    const serviceRng = createRng(`${site.site_id}-service`);

    for (let i = 0; i < serviceCount; i += 1) {
      const template = templates[i % templates.length];
      const variation = (i % 4) + 1;
      const monthlyRate = makeMoney(template.rateBase * (0.85 + variation * 0.08), serviceRng, 0.34);
      const utilizationBase = site.archetype === "Broadcast hub or playout facility" ? 0.72 : site.archetype === "Production facility" ? 0.58 : site.archetype === "Data center or colocation site" ? 0.64 : site.archetype === "Corporate office" ? 0.43 : site.archetype === "Regional office - international" ? 0.46 : 0.55;
      const utilization = clamp(Number((utilizationBase + (serviceRng() - 0.5) * 0.6).toFixed(2)), 0.05, 0.98);
      const service: ServiceRow = {
        service_id: `SV-${pad(serviceSequence, 5)}`,
        site_id: site.site_id,
        site_name: site.site_name,
        supplier_id: pick(supplierRows, serviceRng).supplier_id,
        supplier_name: pick(supplierRows, serviceRng).supplier_name,
        contract_id: pick(siteContracts, serviceRng).contract_id,
        archetype: site.archetype,
        category: template.category,
        access_type: template.accessType,
        bandwidth_or_size: template.bandwidth,
        status: serviceRng() < 0.08 ? "Pending disconnect" : serviceRng() < 0.1 ? "Inactive" : "Active",
        install_date: formatDateUtc(new Date(Date.UTC(currentYear - 1, Math.floor(serviceRng() * 12), 1 + Math.floor(serviceRng() * 20)))),
        disconnect_date: serviceRng() < 0.1 ? formatDateUtc(new Date(Date.UTC(currentYear, today.getUTCMonth() - Math.floor(serviceRng() * 4), 1))) : null,
        primary_or_backup_role: template.role,
        sla_tier: template.slaTier,
        routing_diversity: template.routingDiversity,
        revenue_sensitive: template.revenueSensitive || site.revenue_sensitive,
        tower: site.archetype === "Regional office - international" && i % 5 === 0 ? "Shared" : template.tower,
        monthly_rate: monthlyRate,
        utilization,
        committed_actual_ratio: Number((0.85 + (serviceRng() - 0.5) * 0.3).toFixed(2)),
        reason_code:
          template.category === "Backup internet" || template.category === "Temporary circuit" || template.category === "Failover circuit"
            ? "RESILIENCE"
            : template.category === "Mobility" || template.category === "UCaaS" || template.category === "Collaboration bundle"
              ? "COLLABORATION"
              : template.category === "Cross-connect" || template.category === "Wavelength" || template.category === "Interconnect"
                ? "CORE_NETWORK"
                : "STANDARD",
      };
      services.push(service);
      serviceSequence += 1;

      if (i % 7 === 0) {
        usageRows.push({
          service_id: service.service_id,
          period: `${currentYear}-Q${Math.floor((i % 12) / 3) + 1}`,
          utilization: utilization,
          ports: service.archetype === "Data center or colocation site" ? 8 + Math.floor(serviceRng() * 12) : 1 + Math.floor(serviceRng() * 6),
          minutes: Math.floor(serviceRng() * 12000),
          seats: service.category.includes("UCaaS") || service.category.includes("Collaboration") ? 20 + Math.floor(serviceRng() * 200) : 0,
          sessions: Math.floor(serviceRng() * 800),
          committed_vs_actual: Number((0.9 + (serviceRng() - 0.5) * 0.4).toFixed(2)),
        });
      }
    }
  }

  const contractSpendById = new Map(contracts.map((contract) => [contract.contract_id, contract.annual_spend_target]));
  const servicesByContract = new Map<string, ServiceRow[]>();
  for (const service of services) {
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

  for (const service of services) {
    const site = sites.find((row) => row.site_id === service.site_id)!;
    const serviceAnnualSpend = annualAllocationByServiceId.get(service.service_id) ?? Math.round(service.monthly_rate * 12);
    const monthlyBase = Math.floor(serviceAnnualSpend / 12);
    const monthlyRemainder = serviceAnnualSpend % 12;
    const invoiceRng = createRng(`${service.service_id}-invoice`);

    for (const [monthIndex, month] of invoiceMonths.entries()) {
      const invoice_id = `INV-${site.site_index}-${String(month.getUTCMonth() + 1).padStart(2, "0")}`;
      const invoice_line_id = `ILL-${pad(invoiceSequence, 6)}`;
      const duplicateCharge = invoiceRng() < 0.02;
      const amount = monthlyBase + (monthIndex < monthlyRemainder ? 1 : 0);

      invoiceLines.push({
        invoice_id,
        invoice_line_id,
        bill_period: `${month.getUTCFullYear()}-${String(month.getUTCMonth() + 1).padStart(2, "0")}-01`,
        line_description: `${service.category} - Monthly Recurring Charge`,
        amount,
        charge_type: "MRC",
        billed_quantity: 1,
        service_id: service.service_id,
        site_id: site.site_id,
        supplier_id: service.supplier_id,
        payment_status: duplicateCharge ? "Duplicate review" : "Paid",
        source_file: `invoice_${site.site_index}_${monthNames[month.getUTCMonth()].toLowerCase()}.pdf`,
        source_sheet: "Invoice Lines",
        source_reference: `${site.site_id}:${invoice_line_id}`,
        duplicate_charge: duplicateCharge,
      });
      apRows.push({
        voucher_number: `VCH-${pad(apSequence, 6)}`,
        paid_amount: amount,
        payment_date: formatDateUtc(new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth() + 1, 10))),
        cost_center: site.cost_center,
        duplicate_check_key: `${site.site_id}-${service.category}`,
        gl_mapping: site.tower === "SG&A telecom" ? "6260 Telecom" : site.tower === "Shared" ? "6280 Shared infrastructure" : "6290 Network services",
        project_mapping: site.archetype === "Production facility" ? "PROJ-TEMP" : site.archetype === "Studio lot" ? "PROJ-STUDIO" : "CORP-OPS",
        invoice_id,
        site_id: site.site_id,
        supplier_id: service.supplier_id,
      });
      apSequence += 1;
      invoiceSequence += 1;
    }
  }

  const benchmarkCategories = [
    "DIA",
    "Broadband",
    "WAN",
    "SD-WAN",
    "Local access",
    "Ethernet",
    "Wavelength",
    "Fixed voice",
    "Colocation",
    "Interconnect",
    "Mobility",
    "Contact center",
    "Media-network transport",
  ];

  const benchmarkLocations: Array<[string, string]> = [
    ["North America", "United States"],
    ["North America", "Canada"],
    ["EMEA", "United Kingdom"],
    ["EMEA", "Germany"],
    ["APAC", "Singapore"],
    ["APAC", "Australia"],
    ["LATAM", "Brazil"],
    ["LATAM", "Mexico"],
  ];

  const sitesById = new Map(sites.map((site) => [site.site_id, site]));
  const benchmarkSpendBuckets = new Map<string, { sum: number; count: number }>();
  for (const service of services) {
    const site = sitesById.get(service.site_id);
    const key = `${benchmarkServiceTypeForCategory(service.category)}::${site?.country ?? "United States"}`;
    const bucket = benchmarkSpendBuckets.get(key) ?? { sum: 0, count: 0 };
    bucket.sum += annualAllocationByServiceId.get(service.service_id) ?? service.monthly_rate * 12;
    bucket.count += 1;
    benchmarkSpendBuckets.set(key, bucket);
  }

  benchmarkCategories.forEach((category, categoryIndex) => {
    benchmarkLocations.forEach(([region, country], locationIndex) => {
      const localRng = createRng(`${category}-${country}`);
      const bucket = benchmarkSpendBuckets.get(`${category}::${country}`) ?? benchmarkSpendBuckets.get(`${category}::United States`);
      const averageAnnualSpend = bucket && bucket.count > 0 ? bucket.sum / bucket.count : 12000 + categoryIndex * 1400 + locationIndex * 900;
      const median = Math.round(averageAnnualSpend * (0.88 + localRng() * 0.06));
      const sample_size = 24 + Math.floor(localRng() * 120);
      benchmarkRows.push({
        benchmark_id: `BM-${pad(benchmarkRows.length + 1, 4)}`,
        service_type: category,
        location: country,
        region,
        bandwidth: category === "Wavelength" ? "100 Gbps" : category === "Colocation" ? "Cabinet" : "1 Gbps",
        term: category === "Media-network transport" ? "36 months" : "24 months",
        managed_flag: category === "Broadband" || category === "Mobility" ? "Unmanaged" : "Managed",
        minimum: Math.round(median * 0.94),
        p25: Math.round(median * 0.97),
        median,
        p75: Math.round(median * 1.03),
        maximum: Math.round(median * 1.08),
        sample_size,
        source_date: formatDateUtc(monthsAgo(locationIndex + 1)),
        confidence: clamp(0.68 + localRng() * 0.27, 0.68, 0.95),
        currency: country === "United Kingdom" ? "GBP" : country === "Germany" || country === "France" || country === "Spain" || country === "Italy" ? "EUR" : country === "Australia" ? "AUD" : country === "Brazil" ? "BRL" : country === "Mexico" ? "MXN" : country === "Singapore" ? "SGD" : "USD",
        normalized_usd_median: Math.round(median * (country === "United Kingdom" ? 1.26 : country === "Australia" ? 0.66 : country === "Brazil" ? 0.2 : country === "Mexico" ? 0.058 : country === "Singapore" ? 0.74 : country === "Canada" ? 0.74 : 1)),
      });
    });
  });

  const findingTemplates = [
    {
      finding_type: "Unused backup circuit",
      impact_type: "Network optimization",
      next_step: "Validate resilience need and suppress or disconnect",
      risk_rating: "Medium",
      source_file: "inventory_reconciliation.xlsx",
      source_reference: "Inventory sheet row",
      contract_clause: "Backup circuit addendum with no approved resilience requirement",
      invoice_line: "Backup DIA Circuit - Monthly Recurring Charge",
      ap_record: "Duplicate-check passed, service still billed",
      usage_record: "Utilization below 15%",
      benchmark_source: "Backup internet benchmark band",
    },
    {
      finding_type: "Duplicate charge",
      impact_type: "Billing recovery",
      next_step: "Raise dispute and request credit memo",
      risk_rating: "High",
      source_file: "invoice_packet.pdf",
      source_reference: "Invoice page 4",
      contract_clause: "Monthly recurring charge duplicated on bill",
      invoice_line: "Duplicated monthly recurring charge",
      ap_record: "AP record paid twice",
      usage_record: "N/A",
      benchmark_source: "Invoice anomaly rule set",
    },
    {
      finding_type: "Above benchmark rate",
      impact_type: "Price and contract optimization",
      next_step: "Rebid or renegotiate against benchmark band",
      risk_rating: "High",
      source_file: "benchmark_model.csv",
      source_reference: "Band percentile comparison",
      contract_clause: "Renewal within 180 days",
      invoice_line: "Access circuit priced above 75th percentile",
      ap_record: "AP paid as billed",
      usage_record: "Utilization above 50%",
      benchmark_source: "Current rate versus benchmark band",
    },
    {
      finding_type: "Expired discount",
      impact_type: "Price and contract optimization",
      next_step: "Recover discount cliff and update rate card",
      risk_rating: "Medium",
      source_file: "contract_summary.pdf",
      source_reference: "Clause risk heatmap",
      contract_clause: "Discount schedule expired at renewal boundary",
      invoice_line: "Service renewed at list price",
      ap_record: "No override found",
      usage_record: "Standard utilization",
      benchmark_source: "Contract discount benchmark",
    },
    {
      finding_type: "Post-disconnect billing",
      impact_type: "Billing recovery",
      next_step: "Confirm disconnect date and seek refund",
      risk_rating: "High",
      source_file: "service_inventory.xlsx",
      source_reference: "Disconnect tracking row",
      contract_clause: "Termination notice satisfied",
      invoice_line: "Inactive line still billed",
      ap_record: "Invoice paid after disconnect",
      usage_record: "Zero utilization",
      benchmark_source: "Service status reconciliation",
    },
  ];

  const invoicesBySite = new Map<string, InvoiceLineRow[]>();
  const servicesBySite = new Map<string, ServiceRow[]>();
  const apByInvoice = new Map<string, ApRow[]>();

  for (const service of services) {
    servicesBySite.set(service.site_id, [...(servicesBySite.get(service.site_id) ?? []), service]);
  }
  for (const invoice of invoiceLines) {
    invoicesBySite.set(invoice.site_id, [...(invoicesBySite.get(invoice.site_id) ?? []), invoice]);
  }
  for (const ap of apRows) {
    apByInvoice.set(ap.invoice_id, [...(apByInvoice.get(ap.invoice_id) ?? []), ap]);
  }

  const candidateServices = services.filter((service) => service.utilization < 0.42 || service.status !== "Active" || service.monthly_rate > 2000);
  candidateServices.slice(0, 110).forEach((service, index) => {
    const template = findingTemplates[index % findingTemplates.length];
    const site = sites.find((row) => row.site_id === service.site_id)!;
    const siteInvoices = invoicesBySite.get(site.site_id) ?? [];
    const invoice = siteInvoices[index % Math.max(siteInvoices.length, 1)];
    const localRng = createRng(`${service.service_id}-finding`);
    const annualizedSavings = Math.round(service.monthly_rate * (service.utilization < 0.2 ? 11 : service.utilization < 0.35 ? 8 : 6) * (template.impact_type === "Billing recovery" ? 1.1 : 1));
    const recovery = template.impact_type === "Billing recovery" ? Math.round((invoice?.amount ?? service.monthly_rate) * (service.status !== "Active" ? 2 : 1)) : Math.round((service.monthly_rate * (localRng() < 0.5 ? 1.5 : 0.8)));
    const reviewStatus = index % 4 === 0 ? "New" : index % 4 === 1 ? "Under review" : index % 4 === 2 ? "Approved" : "Blocked";
    const reviewedAt = reviewStatus === "New" ? null : formatDateUtc(new Date(Date.UTC(currentYear, 3, 1 - index)));
    const finding: FindingRow = {
      finding_id: `FND-${pad(findingSequence, 4)}`,
      finding_type: template.finding_type,
      impact_type: template.impact_type,
      estimated_annualized_savings: annualizedSavings,
      one_time_recovery: recovery,
      confidence: Number((0.7 + (service.utilization < 0.3 ? 0.18 : 0.08) + (localRng() * 0.07)).toFixed(2)),
      risk_rating: template.risk_rating,
      recommended_next_step: template.next_step,
      review_status: reviewStatus,
      supplier_name: service.supplier_name,
      site_name: site.site_name,
      site_id: site.site_id,
      tower: service.tower,
      source_file: template.source_file,
      source_reference: `${template.source_reference} / ${site.site_id}`,
      contract_clause: template.contract_clause,
      invoice_line: invoice?.line_description ?? template.invoice_line,
      ap_record: apByInvoice.get(invoice?.invoice_id ?? "")?.[0]?.voucher_number ? `Voucher ${apByInvoice.get(invoice?.invoice_id ?? "")?.[0]?.voucher_number}` : template.ap_record,
      usage_record: template.usage_record,
      benchmark_source: template.benchmark_source,
      reviewer_history: reviewStatus === "Approved" ? "Analyst approved after evidence review" : reviewStatus === "Blocked" ? "Blocked pending evidence" : "Queued for analyst review",
      created_at: formatDateUtc(new Date(Date.UTC(currentYear, 0, 10 + (index % 15)))),
      reviewed_at: reviewedAt,
    };
    findings.push(finding);
    reviewEvents.push({
      finding_id: finding.finding_id,
      event_at: finding.created_at,
      actor: "System",
      action: "Created",
      note: "Rule engine flagged opportunity",
    });
    if (reviewStatus !== "New") {
      reviewEvents.push({
        finding_id: finding.finding_id,
        event_at: finding.reviewed_at ?? finding.created_at,
        actor: reviewStatus === "Approved" ? "Analyst" : reviewStatus === "Blocked" ? "Manager" : "Reviewer",
        action: reviewStatus,
        note: finding.reviewer_history,
      });
    }
    findingSequence += 1;
  });

  const contractSpendTotal = contracts.reduce((sum, contract) => sum + contract.annual_spend_target, 0);
  const rawOpportunityTotal = findings.reduce(
    (sum, finding) => sum + finding.estimated_annualized_savings + finding.one_time_recovery,
    0,
  );
  const targetOpportunityTotal = contractSpendTotal * 0.21;
  const opportunityScale = rawOpportunityTotal > 0 ? targetOpportunityTotal / rawOpportunityTotal : 1;

  findings.forEach((finding, index) => {
    finding.estimated_annualized_savings = Math.round(finding.estimated_annualized_savings * opportunityScale);
    finding.one_time_recovery = Math.round(finding.one_time_recovery * opportunityScale);
    if (index === findings.length - 1) {
      const adjustedTotal = findings.reduce(
        (sum, item) => sum + item.estimated_annualized_savings + item.one_time_recovery,
        0,
      );
      finding.one_time_recovery += Math.round(targetOpportunityTotal - adjustedTotal);
    }
  });

  return {
    sites,
    supplierRows,
    contracts,
    services,
    invoiceLines,
    apRows,
    usageRows,
    benchmarkRows,
    findings,
    reviewEvents,
  };
}
