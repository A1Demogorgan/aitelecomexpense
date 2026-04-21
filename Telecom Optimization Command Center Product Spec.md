# Telecom Optimization Command Center
## Product Specification for Codex Implementation

**Source basis:** `Telecom Optimization Command Center POC Specification.pdf`  
**Purpose:** define a complete, build-ready product spec for a telecom optimization application that can ingest telecom data, normalize inventory, generate synthetic datasets, benchmark rates, detect savings opportunities, and present results in an executive-grade UI.

---

## 1. Product Summary

Telecom Optimization Command Center is a telecom-native optimization workbench for large enterprises. The application reconciles telecom invoices, contracts, AP records, service inventory, usage data, and benchmark rates into a single operating model. It then surfaces opportunities in three categories:

- Network optimization
- Billing recovery
- Price and contract optimization

The product must support both executive review and analyst workflow. It should be designed for a CFO, CIO, procurement lead, finance analyst, telecom operations analyst, and implementation analyst. The experience must be premium, evidence-driven, and conservative on revenue-sensitive services.

The product is not a generic sourcing dashboard. It is an inventory-backed telecom optimization platform with explainable AI, human review, and synthetic benchmark data.

---

## 2. Product Goals

### 2.1 Business goals

- Reduce telecom spend by finding actionable savings and recoveries.
- Accelerate the time from raw documents to approved action packet.
- Make telecom inventory reliable enough to support billing and benchmarking.
- Distinguish revenue-driving network services from SG&A telecom services.
- Support procurement and finance with evidence-backed recommendations.
- Provide executive visibility into run-rate savings, one-time recovery, risk, and confidence.

### 2.2 Product goals

- Ingest contracts, invoices, AP exports, inventory spreadsheets, and usage records.
- Generate synthetic datasets for demos and testing, including Excel files, invoice PDFs, contract packets, and AP exports.
- Normalize all data into a canonical telecom service model.
- Reconcile service, site, supplier, contract, invoice, AP, and benchmark records.
- Classify services into revenue, SG&A, or shared.
- Surface explainable recommendations with reviewer controls.
- Present data through a grid-based dashboard system with strong charting and drill-down.

### 2.3 Non-goals

- Fully autonomous disconnect or renewal execution.
- Black-box recommendations without evidence.
- Consumer-style UI patterns or AI chat as the primary interaction model.
- Treating all telecom as a single spend bucket.

---

## 3. Product Principles

The application must follow these product principles:

- Telecom inventory is the source of truth, not spreadsheets alone.
- Revenue-sensitive services must default to advisory-only behavior.
- Every major recommendation must be explainable in three clicks or fewer.
- Every output must show source lineage, confidence, and reviewer status.
- Benchmark output must show a band, not a single point estimate.
- Human review is required before client-facing export.
- The UI must feel sober, premium, and infrastructure-grade.
- Dashboard output must be boardroom-ready and operator-grade at the same time.

---

## 4. Primary Users

### 4.1 CFO

- Wants total annualized savings.
- Wants one-time recovery.
- Wants risk separation between revenue and SG&A.
- Wants simple visual storytelling.

### 4.2 CIO

- Wants network risk visibility.
- Wants to confirm that core services are handled conservatively.
- Wants to see service-level inventory, utilization, and resilience.

### 4.3 Procurement Lead

- Wants benchmark comparison.
- Wants contract risk and renewal timing.
- Wants negotiation-ready evidence.

### 4.4 Finance Analyst

- Wants invoice anomalies, duplicate payments, and recoverable charges.
- Wants line-level support for audit and dispute workflows.

### 4.5 Telecom Operations Analyst

- Wants inventory reconciliation and service status.
- Wants exception queues and service-level drill-down.

### 4.6 Implementation Analyst

- Wants data import, cleansing, mapping, and scenario generation tools.

---

## 5. Core User Experience

The app should have a desktop-first layout with:

- A top banner with product title, environment, active filters, and summary stats.
- A left-hand global menu for navigation.
- A persistent top filter bar on all main screens.
- A right-side evidence drawer for lineage, source files, and explanations.
- A central content area laid out on a 12-column grid.
- Card-based dashboards, tables, and charts that all support drill-down.

The interface should support two modes:

- Executive mode: simplified visuals, fewer controls, concise narrative summary.
- Analyst mode: full tables, filters, evidence, overrides, and workflow queues.

---

## 6. Information Architecture

### Global navigation

- Executive Command Center
- Spend Classification Studio
- Network Inventory Workbench
- Billing Assurance Console
- Benchmark and Market Rate Workbench
- Contract and Renewal Cockpit
- Site and Service 360
- Analyst Review and Action Studio
- Data Ingestion and Synthetic Data
- Admin and Configuration

### Global utilities

- Search
- Filter by region, supplier, site, service type, risk, reviewer status, and date range
- Export
- Audit trail
- Notifications
- Saved views

---

## 7. Canonical Data Model

The system must normalize all data into the following core objects.

### 7.1 Site

Required fields:

- Site ID
- Site name
- Region
- Country
- Metro
- Address
- Site type
- Criticality
- Business owner
- Revenue, SG&A, or shared classification

### 7.2 Service

Required fields:

- Service ID
- Site ID
- Supplier ID
- Category
- Access type
- Bandwidth or seat count
- Status
- Install date
- Disconnect date
- Primary or backup role
- SLA tier
- Routing diversity
- Contract ID

### 7.3 Supplier

Required fields:

- Supplier ID
- Supplier name
- Master agreement
- Account hierarchy
- Currency
- Invoice channel

### 7.4 Contract

Required fields:

- Contract ID
- Supplier ID
- Start date
- End date
- Rate card
- Discount schedule
- Escalation clauses
- Renewal terms
- Auto-renew rules
- Termination terms

### 7.5 Invoice line

Required fields:

- Invoice ID
- Invoice line ID
- Bill period
- Line description
- Amount
- NRC, MRC, usage, tax, or surcharge type
- Billed quantity
- Service mapping
- Payment status

### 7.6 AP record

Required fields:

- Voucher number
- Paid amount
- Payment date
- Cost center
- Duplicate-check key
- GL mapping
- Project mapping

### 7.7 Usage record

Required fields:

- Service ID
- Period
- Utilization
- Ports
- Minutes
- Seats
- Sessions
- Committed versus actual

### 7.8 Benchmark observation

Required fields:

- Service type
- Location
- Bandwidth
- Term
- Managed or unmanaged flag
- Percentile band
- Sample size
- Source date
- Confidence

### 7.9 Finding and action

Required fields:

- Finding ID
- Finding type
- Impact type
- Estimated annualized savings
- One-time recovery
- Confidence
- Risk rating
- Recommended next step
- Review status

---

## 8. Business Classification Logic

The system must classify every service into one of three spend towers:

- Revenue-driving network
- SG&A telecom
- Shared

### 8.1 Classification priority order

1. Explicit service-purpose tags
2. Site type
3. Known cost center or GL mapping
4. Contract family
5. Supplier pattern
6. Human override

### 8.2 Classification rules

- Revenue-driving network services are tied to content creation, contribution, distribution, playout, streaming delivery, ad delivery, or subscriber operations.
- SG&A telecom services support corporate enablement, office productivity, enterprise IT, or administrative functions.
- Shared services support both revenue and corporate functions, or evidence is mixed.

### 8.3 Required behavior

- Every classification must show the reason code and confidence score.
- Shared classification must be supported explicitly and cannot be treated as an exception.
- Human override must be logged with timestamp, user, old value, and new value.

### 8.4 Default action posture

- Revenue-driving network: advisory only, mandatory analyst review, no auto-disconnect.
- SG&A telecom: standard recommendation workflow.
- Shared: allocate by rule, show split rationale, require owner confirmation.

---

## 9. Opportunity Types

The opportunity engine must generate findings in three categories.

### 9.1 Network optimization

Examples:

- Unused backup circuits
- Legacy MPLS overlays after migration
- Redundant premium services without approved resilience need
- Low-utilization high-capacity services
- Expensive architecture on low-criticality sites
- Duplicate voice or contact-center capacity

### 9.2 Billing recovery

Examples:

- Contract mismatches
- Ghost services
- Duplicate charges
- Post-disconnect billing
- Wrong rate plans
- Tax or surcharge anomalies
- Duplicate AP payments
- Services billed but not present in active inventory

### 9.3 Price and contract optimization

Examples:

- Rates above benchmark band
- Expiring deals with discount cliffs
- Auto-renew exposure
- Unfavorable escalation clauses
- Better pricing available via longer term or redesigned service

---

## 10. Synthetic Data Generation Requirements

The product must include a synthetic data engine that can generate realistic telecom operating data for demos, QA, and testing.

### 10.1 Synthetic data inputs

The generator must support creating:

- Contract data
- Invoice data
- AP export data
- Service inventory spreadsheets
- Usage records
- Benchmark datasets
- Site master data
- Supplier master data
- Excel workbooks
- PDF invoice packets
- PDF contract summaries

### 10.2 Synthetic portfolio scale

Default demo portfolio:

- 180 to 250 global sites
- 8 to 12 major suppliers
- 10,000 to 20,000 normalized services
- 12 months of invoice history
- 24 months of AP records
- 20 to 30 active contracts
- Benchmark coverage across fixed network, voice, mobility, contact center, colo, and media-network transport

### 10.3 Site mix

The generator should create a realistic Paramount-like enterprise estate rather than a generic corporate portfolio. The site generator should create a weighted mix of:

- 20% to 30% corporate offices and administrative sites
- 12% to 18% studio lots and creative campuses
- 10% to 15% production facilities and remote production sites
- 8% to 12% distribution nodes and content delivery hubs
- 8% to 12% data centers and colocation-heavy technical sites
- 15% to 25% regional offices and field offices
- 8% to 12% broadcast hubs and playout facilities
- 5% to 10% streaming-adjacent or digital operations hubs

### 10.3.1 Paramount-like estate model

Each site archetype must carry a distinct telecom and network profile.

#### Corporate office

- Primary use: administrative, finance, HR, legal, procurement, and corporate IT.
- Typical services: broadband, DIA, SD-WAN, collaboration voice, mobility, and backup internet.
- Criticality: medium.
- Risk posture: standard recommendation workflow.
- Common opportunity types: underutilized backup circuits, duplicate mobility lines, overpriced broadband, and contract renewal leverage.

#### Studio lot

- Primary use: content creation, editing, post-production, producer workspaces, and vendor collaboration.
- Typical services: high-capacity WAN, diverse fiber, production interconnects, edit-suite connectivity, guest access, and secure Wi-Fi.
- Criticality: high.
- Risk posture: advisory-only for core production services.
- Common opportunity types: duplicate paths, oversized access links on noncritical buildings, unused temporary circuits, and stale vendor connectivity.

#### Production facility

- Primary use: field production, remote shoots, temporary project offices, and production support.
- Typical services: temporary circuits, mobile connectivity, short-term internet, voice, VPN, and occasional high-capacity event links.
- Criticality: variable by project.
- Risk posture: advisory-only when tied to active production windows.
- Common opportunity types: inactive project lines, short-duration circuits that were never disconnected, and duplicate invoice runs across projects.

#### Distribution node

- Primary use: content delivery, aggregation, regional distribution, and handoff to downstream partners.
- Typical services: transport, fiber backhaul, interconnect, CDN-adjacent links, and resilient WAN.
- Criticality: high.
- Risk posture: advisory-only for transport and handoff paths.
- Common opportunity types: excess redundancy, overbuilt bandwidth, and mispriced long-haul transport.

#### Data center or colocation site

- Primary use: technical hosting, backbone routing, application infrastructure, and interconnects.
- Typical services: colo, cross-connects, Ethernet, wavelengths, IP transit, and redundant transport.
- Criticality: high.
- Risk posture: advisory-only for core interconnect and backbone services.
- Common opportunity types: unused cross-connects, duplicate transport, capacity overstatement, and contract misalignment.

#### Regional office

- Primary use: sales, local operations, support staff, and local management.
- Typical services: broadband, DIA, SD-WAN, mobility, UCaaS, and backup internet.
- Criticality: medium.
- Risk posture: standard recommendation workflow.
- Common opportunity types: duplicate internet circuits, right-sizing opportunities, and mobility overages.
- Location types: domestic and international.
- Domestic regional offices should skew toward standard corporate telecom patterns and local U.S. carrier contracts.
- International regional offices should skew toward country-specific access, local carrier complexity, currency conversion, and cross-border contract normalization.

#### Broadcast hub or playout facility

- Primary use: broadcast operations, playout, master control, live transmission, and channel distribution.
- Typical services: diverse transport, contribution links, satellite or fiber uplinks, low-latency WAN, and redundant failover services.
- Criticality: very high.
- Risk posture: strict advisory-only with mandatory analyst review.
- Common opportunity types: unused redundancy, contract escalations, excess premium transport, and legacy failover services.

#### Streaming-adjacent or digital operations hub

- Primary use: subscriber operations, digital delivery, platform operations, app support, and adjacent engineering.
- Typical services: WAN, CDN-adjacent connectivity, cloud interconnect, voice, collaboration, and business internet.
- Criticality: high for user-facing operations, medium for internal teams.
- Risk posture: advisory-only when tied to customer-facing delivery paths.
- Common opportunity types: expensive interconnects, cloud transport redundancy, and stale circuit inventory.

### 10.3.2 Site-level generation ratios

The generator should assign a network complexity tier to each site and use that tier to determine service count, contract density, and invoice complexity.

- Tier 1: small corporate or regional sites with 3 to 8 services.
- Tier 2: standard offices or production support sites with 6 to 15 services.
- Tier 3: studios, distribution nodes, and technical sites with 15 to 40 services.
- Tier 4: broadcast hubs, data centers, and major production facilities with 30 to 80 services.

Each site must include:

- A business purpose label
- A criticality score from 1 to 5
- A resilience requirement flag
- A revenue-sensitive flag
- A primary network role
- Optional backup network role
- A site owner
- A cost center or GL association
- Local currency and country-specific contract rules

### 10.3.3 Concrete 200-site demo archetype

For the default 200-site demo, the generator should use the following exact site mix:

| Archetype | Count | Share | Typical complexity tier | Typical services per site |
| --- | ---: | ---: | --- | ---: |
| Corporate office | 52 | 26% | Tier 1 or 2 | 4 to 10 |
| Studio lot | 28 | 14% | Tier 3 | 15 to 30 |
| Production facility | 24 | 12% | Tier 2 or 3 | 8 to 24 |
| Distribution node | 18 | 9% | Tier 3 | 12 to 28 |
| Data center or colocation site | 16 | 8% | Tier 4 | 20 to 40 |
| Regional office - domestic | 20 | 10% | Tier 1 or 2 | 3 to 8 |
| Regional office - international | 18 | 9% | Tier 1 or 2 | 3 to 8 |
| Broadcast hub or playout facility | 14 | 7% | Tier 4 | 25 to 60 |
| Streaming-adjacent or digital operations hub | 10 | 5% | Tier 3 or 4 | 12 to 35 |

This exact mix should be used as the default Paramount-like portfolio because it produces enough corporate volume for spend normalization while preserving enough high-risk media-network sites to make the demo feel real.

#### Regional office split logic

- The 38 regional offices should be split into 20 domestic sites and 18 international sites.
- Domestic regional offices should be concentrated in the United States and should follow simpler carrier, tax, and currency rules.
- International regional offices should be distributed across key media and streaming markets and should require local currency normalization, country-specific contract handling, and region-aware benchmark mapping.
- International regional offices should be more likely to carry mixed shared allocations because they often support both corporate and content operations.

#### Regional office country distribution

For the default 200-site demo, the 18 international regional offices should be distributed across the following countries:

| Country | Count | Primary role |
| --- | ---: | --- |
| United Kingdom | 3 | EMEA commercial, distribution, and corporate support |
| Canada | 2 | North American support and content operations |
| Australia | 2 | APAC operations and broadcast support |
| Mexico | 2 | Latin American commercial and operations support |
| Brazil | 2 | Latin American commercial and content support |
| Argentina | 1 | Regional content and commercial support |
| Chile | 1 | Regional content and commercial support |
| Spain | 1 | EMEA content and commercial support |
| France | 1 | EMEA content and commercial support |
| Germany | 1 | EMEA commercial and technical support |
| Italy | 1 | EMEA commercial and technical support |
| Singapore | 1 | APAC coordination and digital operations |

This distribution intentionally emphasizes major media and streaming markets rather than trying to mirror Paramount’s exact office footprint.

#### Regional office network emphasis

- Domestic regional office: broadband, DIA, SD-WAN, UCaaS, mobility, and backup internet.
- International regional office: local access, DIA, SD-WAN, mobility, collaboration, and country-specific voice or managed service bundles.

#### Regional office risk posture

- Domestic regional office: standard recommendation workflow.
- International regional office: standard recommendation workflow, with extra review for tax, FX, and cross-border contract normalization.

#### Regional office service templates

##### Domestic regional office service template

- 1 primary internet service
- 1 backup internet service for medium and high criticality sites
- 1 SD-WAN service
- 1 voice or UCaaS bundle
- 1 mobility pool or line bundle
- Optional branch firewall or secure edge service
- Optional local network access circuit for larger offices

##### International regional office service template

- 1 primary local access service
- 1 secondary or backup access path for critical sites
- 1 SD-WAN or managed edge service
- 1 voice, UCaaS, or collaboration bundle
- 1 mobility bundle with country-specific plan structures
- Optional international calling, managed security, or local last-mile service
- Optional cloud interconnect or regional backhaul for higher-traffic sites

#### Regional office invoice and contract differences

##### Domestic regional office billing pattern

- Mostly USD invoicing.
- Shorter invoice descriptions with common U.S. telecom terms.
- Monthly recurring charges dominate.
- Contract terms are typically standardized across suppliers.
- Tax and surcharge logic is simpler and more uniform.
- Renewal timing usually aligns with standard annual or multi-year U.S. procurement cycles.

##### International regional office billing pattern

- Invoicing may occur in local currency, USD, or a mix depending on supplier and country.
- Line descriptions may include local language terms and carrier-specific service names.
- Currency conversion must be stored explicitly on invoice line and AP records.
- Tax, VAT, withholding, and local telecom surcharges must be modeled separately.
- Contracts may vary by country, legal entity, and local carrier affiliate.
- Renewal timing can be country-specific and may involve local notice periods, auto-renew rules, or regulatory constraints.
- International invoices should be more likely to contain partial mappings, aliasing, and service-name normalization issues.

#### Regional office benchmark behavior

- Domestic regional offices should benchmark against U.S. market rate bands.
- International regional offices should benchmark against country-specific or region-specific rate bands.
- The benchmark engine should preserve local currency output and also provide normalized USD comparison.
- International regional offices should be more likely to fall into the shared-services classification bucket because ownership and usage are often split across corporate and local business teams.

### 10.3.4 Exact service counts for the 200-site demo

The generator should use the following exact service targets per site archetype so the resulting portfolio lands in the correct operating scale for a realistic media enterprise.

| Archetype | Site count | Target services per site | Total services |
| --- | ---: | ---: | ---: |
| Corporate office | 52 | 30 | 1,560 |
| Studio lot | 28 | 75 | 2,100 |
| Production facility | 24 | 40 | 960 |
| Distribution node | 18 | 60 | 1,080 |
| Data center or colocation site | 16 | 100 | 1,600 |
| Regional office - domestic | 20 | 20 | 400 |
| Regional office - international | 18 | 24 | 432 |
| Broadcast hub or playout facility | 14 | 110 | 1,540 |
| Streaming-adjacent or digital operations hub | 10 | 55 | 550 |
| **Total** | **200** |  | **10,222** |

This exact service profile should be used as the default generator target because it keeps the demo within the 10,000 to 20,000 normalized service range while making the broadcast, studio, and technical layers materially dense.

#### Service mix by archetype

- Corporate offices should primarily generate broadband, DIA, SD-WAN, voice, mobility, backup internet, and a small number of local LAN or security services.
- Studio lots should primarily generate high-capacity WAN, diverse fiber, production interconnects, secure Wi-Fi, vendor access, and edit-suite connectivity.
- Production facilities should primarily generate temporary circuits, mobile connectivity, short-term internet, VPN, and event-based links.
- Distribution nodes should primarily generate transport, fiber backhaul, interconnect, CDN-adjacent links, and resilient WAN.
- Data centers or colocation sites should primarily generate colo, cross-connects, Ethernet, wavelengths, IP transit, and redundant transport.
- Domestic regional offices should primarily generate broadband, DIA, SD-WAN, UCaaS, mobility, and backup internet.
- International regional offices should primarily generate local access, DIA, SD-WAN, mobility, collaboration, and country-specific voice or managed service bundles.
- Broadcast hubs or playout facilities should primarily generate contribution links, satellite or fiber uplinks, low-latency WAN, and redundant failover services.
- Streaming-adjacent or digital operations hubs should primarily generate WAN, cloud interconnect, CDN-adjacent connectivity, voice, and collaboration services.

### 10.3.5 Exact active contract counts for the 200-site demo

The generator should use the following exact active master contract counts.

| Archetype | Domestic contracts | International contracts | Total active contracts |
| --- | ---: | ---: | ---: |
| Corporate office | 6 | 0 | 6 |
| Studio lot | 3 | 1 | 4 |
| Production facility | 2 | 1 | 3 |
| Distribution node | 2 | 1 | 3 |
| Data center or colocation site | 2 | 2 | 4 |
| Regional office - domestic | 2 | 0 | 2 |
| Regional office - international | 0 | 2 | 2 |
| Broadcast hub or playout facility | 2 | 2 | 4 |
| Streaming-adjacent or digital operations hub | 1 | 1 | 2 |
| **Total** | **20** | **10** | **30** |

This contract mix should be used as the default because it keeps the portfolio within the 20 to 30 active contract range while still giving each archetype enough coverage to support renewal, benchmark, and invoice-recovery workflows.

#### Contract structure by archetype

- Corporate office contracts should be concentrated in broadband, SD-WAN, mobility, and unified communications.
- Studio lot contracts should include production transport, fiber, secure access, and vendor connectivity.
- Production facility contracts should skew toward project-based and short-duration service schedules.
- Distribution node contracts should emphasize transport, backhaul, and interconnect.
- Data center or colocation site contracts should emphasize colo, cross-connect, waves, and backbone services.
- Domestic regional office contracts should emphasize U.S. office telecom, collaboration, and backup services.
- International regional office contracts should emphasize local access, local mobile plans, regional managed services, and local carrier affiliates.
- Broadcast hub or playout facility contracts should emphasize redundancy, low-latency transport, and failover architecture.
- Streaming-adjacent or digital operations hub contracts should emphasize cloud interconnect, digital delivery, and collaboration support.

### 10.3.6 Sample synthetic rows for regional offices

#### Domestic regional office sample row

| Field | Example value |
| --- | --- |
| Site ID | `RO-US-014` |
| Site name | `New York Regional Operations` |
| Country | `United States` |
| Region | `North America` |
| Site type | `Regional office - domestic` |
| Criticality | `3` |
| Primary services | `Broadband, SD-WAN, UCaaS, mobility, backup internet` |
| Invoice currency | `USD` |
| Contract type | `U.S. master service agreement` |
| Benchmark behavior | `U.S. market-rate band, USD only` |
| Key risk flags | `duplicate internet circuit, mobility overage, renewal cliff` |

#### International regional office sample row

| Field | Example value |
| --- | --- |
| Site ID | `RO-INT-007` |
| Site name | `London Regional Operations` |
| Country | `United Kingdom` |
| Region | `EMEA` |
| Site type | `Regional office - international` |
| Criticality | `3` |
| Primary services | `Local access, SD-WAN, collaboration bundle, mobility, managed security` |
| Invoice currency | `GBP` |
| Contract type | `Local carrier affiliate agreement` |
| Benchmark behavior | `UK market-rate band, local currency plus normalized USD` |
| Key risk flags | `FX conversion, VAT handling, cross-border normalization` |

#### International regional office sample row for a higher-complexity market

| Field | Example value |
| --- | --- |
| Site ID | `RO-INT-013` |
| Site name | `Singapore Digital Support` |
| Country | `Singapore` |
| Region | `APAC` |
| Site type | `Regional office - international` |
| Criticality | `4` |
| Primary services | `Local access, SD-WAN, cloud interconnect, mobility, collaboration` |
| Invoice currency | `SGD` |
| Contract type | `Local telecom carrier agreement with regional cloud interconnect addendum` |
| Benchmark behavior | `APAC market-rate band, local currency plus normalized USD` |
| Key risk flags | `local carrier complexity, FX conversion, mixed shared allocation` |

#### Studio lot sample row

| Field | Example value |
| --- | --- |
| Site ID | `ST-005` |
| Site name | `Burbank Studio Campus` |
| Country | `United States` |
| Region | `North America` |
| Site type | `Studio lot` |
| Criticality | `5` |
| Primary services | `High-capacity WAN, diverse fiber, secure Wi-Fi, edit-suite connectivity, vendor access, production interconnects` |
| Invoice currency | `USD` |
| Contract type | `Media transport and studio connectivity master agreement` |
| Benchmark behavior | `U.S. media-network band, benchmarked with advisory-only posture` |
| Key risk flags | `oversized access links, duplicate paths, temporary circuit leakage` |

#### Production facility sample row

| Field | Example value |
| --- | --- |
| Site ID | `PR-011` |
| Site name | `Atlanta Production Support Facility` |
| Country | `United States` |
| Region | `North America` |
| Site type | `Production facility` |
| Criticality | `4` |
| Primary services | `Temporary circuits, mobile connectivity, short-term internet, VPN, event-based links` |
| Invoice currency | `USD` |
| Contract type | `Project-based telecom services agreement` |
| Benchmark behavior | `U.S. project-services band, advisory-only during active production window` |
| Key risk flags | `inactive project lines, disconnected-but-billing, duplicate invoice runs` |

#### Distribution node sample row

| Field | Example value |
| --- | --- |
| Site ID | `DN-003` |
| Site name | `Chicago Distribution Hub` |
| Country | `United States` |
| Region | `North America` |
| Site type | `Distribution node` |
| Criticality | `5` |
| Primary services | `Transport, fiber backhaul, interconnect, CDN-adjacent links, resilient WAN` |
| Invoice currency | `USD` |
| Contract type | `Transport and handoff network agreement` |
| Benchmark behavior | `U.S. transport band, advisory-only for route and redundancy changes` |
| Key risk flags | `overbuilt bandwidth, excess redundancy, long-haul pricing mismatch` |

#### Data center or colocation site sample row

| Field | Example value |
| --- | --- |
| Site ID | `DC-008` |
| Site name | `Secaucus Colocation Node` |
| Country | `United States` |
| Region | `North America` |
| Site type | `Data center or colocation site` |
| Criticality | `5` |
| Primary services | `Colo, cross-connects, Ethernet, wavelengths, IP transit, redundant transport` |
| Invoice currency | `USD` |
| Contract type | `Data center interconnect and colocation master agreement` |
| Benchmark behavior | `U.S. colo and interconnect band, advisory-only for core services` |
| Key risk flags | `unused cross-connects, duplicate transport, missing contract linkage` |

#### Broadcast hub or playout facility sample row

| Field | Example value |
| --- | --- |
| Site ID | `BH-002` |
| Site name | `New York Playout Center` |
| Country | `United States` |
| Region | `North America` |
| Site type | `Broadcast hub or playout facility` |
| Criticality | `5` |
| Primary services | `Contribution links, satellite uplinks, fiber uplinks, low-latency WAN, failover services` |
| Invoice currency | `USD` |
| Contract type | `Broadcast transport and redundancy agreement` |
| Benchmark behavior | `U.S. media broadcast band, strict advisory-only posture` |
| Key risk flags | `premium transport creep, legacy failover services, auto-renew exposure` |

#### Streaming-adjacent or digital operations hub sample row

| Field | Example value |
| --- | --- |
| Site ID | `DG-004` |
| Site name | `Los Angeles Digital Operations Hub` |
| Country | `United States` |
| Region | `North America` |
| Site type | `Streaming-adjacent or digital operations hub` |
| Criticality | `4` |
| Primary services | `WAN, cloud interconnect, CDN-adjacent connectivity, voice, collaboration` |
| Invoice currency | `USD` |
| Contract type | `Digital operations and cloud interconnect agreement` |
| Benchmark behavior | `U.S. digital delivery band, advisory-only for customer-facing paths` |
| Key risk flags | `cloud transport redundancy, stale circuit inventory, mixed allocation` |

### 10.3.7 Synthetic invoice line examples per archetype

The generator should create invoice lines that reflect the service mix and billing language of each archetype.

| Archetype | Example invoice line descriptions |
| --- | --- |
| Corporate office | `Internet Access 1 Gbps - Monthly Recurring Charge`; `SD-WAN Managed Service`; `Unified Communications Seat Bundle`; `Mobile Voice Plan Pool`; `Backup DIA Circuit` |
| Studio lot | `Studio Fiber Diverse Path 10 Gbps`; `Edit Suite WAN Access`; `Production Interconnect Port`; `Secure Wireless Managed Service`; `Temporary Event Circuit - Monthly Charge` |
| Production facility | `Temporary Internet Access - Project Circuit`; `Field Production VPN Service`; `Mobile Data Pool`; `Short-Term Voice Lines`; `Event Connectivity Fee` |
| Distribution node | `Long-Haul Transport Circuit`; `Fiber Backhaul Port`; `CDN Adjacent Interconnect`; `Resilient WAN Access`; `Route Diversity Premium` |
| Data center or colocation site | `Cross-Connect Monthly Charge`; `Ethernet Transport Port`; `Wavelength Service`; `IP Transit`; `Colocation Cabinet Fee`; `Redundant Transport Link` |
| Regional office - domestic | `Business Broadband 500 Mbps`; `SD-WAN Branch Service`; `UCaaS User Seat`; `Domestic Mobility Plan`; `Backup Internet Circuit` |
| Regional office - international | `Local Access Circuit`; `Managed Edge Service`; `Regional Collaboration Bundle`; `Country Mobile Plan`; `International Calling Add-On`; `Local Carrier Last Mile` |
| Broadcast hub or playout facility | `Contribution Link - Protected`; `Satellite Uplink Service`; `Playout WAN - Low Latency`; `Failover Circuit Monthly`; `Broadcast Transport Premium` |
| Streaming-adjacent or digital operations hub | `Cloud Interconnect Port`; `CDN Peering Adjacent Link`; `Digital Operations WAN`; `Collaboration Service Bundle`; `Managed Security Edge` |

### 10.3.8 Contract clause examples per archetype

The generator should attach archetype-specific clause language to synthetic contracts so the benchmark, renewal, and risk workflows have realistic material to inspect.

| Archetype | Example contract clause patterns |
| --- | --- |
| Corporate office | Standard 36-month term; annual CPI-based escalation; 30-day notice for non-renewal; service credit schedule for downtime; standard termination assistance |
| Studio lot | Service continuity clause for production windows; temporary circuit addendum; route diversity requirement; change-control notice for production-impacting changes; restricted disconnect windows |
| Production facility | Project term alignment clause; auto-expire at project close; temporary service cancellation rules; short notice disconnect authorization; event-specific overage pricing |
| Distribution node | Minimum route-diversity clause; protected transport requirement; premium for expedited restoration; SLA-based service credits; capacity expansion notice terms |
| Data center or colocation site | Cross-connect inventory reconciliation clause; cabinet and port audit rights; backbone resilience clause; termination notice for unused interconnects; space and power true-up terms |
| Regional office - domestic | Standard U.S. telecom MSA; fixed-rate discount schedule; annual renewal window; tax and surcharge pass-through; standard ordering and amendment terms |
| Regional office - international | Local law governing clause; local carrier affiliate obligations; VAT and withholding treatment; currency conversion language; country-specific notice period and auto-renew terms |
| Broadcast hub or playout facility | Mandatory redundancy clause; minimum uptime commitment; priority restoration terms; scheduled maintenance blackout windows; no-disconnect-without-approval provision |
| Streaming-adjacent or digital operations hub | Cloud interconnect service levels; customer-facing path protection clause; managed edge responsibility split; regional failover requirement; usage-based scaling terms |

### 10.3.9 Regional office clause examples

#### Domestic regional office clauses

- 36-month master service term with annual pricing review.
- Standard U.S. tax, surcharge, and invoice dispute language.
- 30- to 60-day notice for renewal or termination.
- Standard service-credit schedule for SLA misses.

#### International regional office clauses

- Local governing law and local carrier affiliate language.
- Currency conversion and FX reference language.
- VAT, withholding, and local telecom tax handling.
- Country-specific notice period, renewal window, and auto-renew handling.
- Local-language service naming and alias mapping requirements.

#### Default network emphasis by archetype

- Corporate office: broadband, DIA, SD-WAN, voice, mobility, and backup internet.
- Studio lot: high-capacity WAN, diverse fiber, production interconnects, secure Wi-Fi, and vendor access.
- Production facility: temporary circuits, mobile connectivity, short-term internet, VPN, and event-based links.
- Distribution node: transport, fiber backhaul, interconnect, CDN-adjacent links, and resilient WAN.
- Data center or colocation site: colo, cross-connects, Ethernet, wavelengths, IP transit, and redundant transport.
- Regional office: broadband, DIA, SD-WAN, UCaaS, mobility, and backup internet.
- Broadcast hub or playout facility: contribution links, satellite or fiber uplinks, low-latency WAN, and redundant failover services.
- Streaming-adjacent or digital operations hub: WAN, cloud interconnect, CDN-adjacent connectivity, voice, and collaboration services.

#### Default risk posture by archetype

- Corporate office: standard recommendation workflow.
- Studio lot: advisory-only for core production services.
- Production facility: advisory-only during active project windows.
- Distribution node: advisory-only for transport and handoff paths.
- Data center or colocation site: advisory-only for core interconnect and backbone services.
- Regional office: standard recommendation workflow.
- Broadcast hub or playout facility: strict advisory-only with mandatory analyst review.
- Streaming-adjacent or digital operations hub: advisory-only for customer-facing delivery paths.

#### Default opportunity density by archetype

- Corporate office: medium.
- Studio lot: medium to high.
- Production facility: high.
- Distribution node: medium.
- Data center or colocation site: medium.
- Regional office: medium.
- Broadcast hub or playout facility: low to medium, but high impact when found.
- Streaming-adjacent or digital operations hub: medium to high.

### 10.4 Required opportunity seeds

The synthetic data should intentionally include these signals:

- Unused backup circuits at noncritical offices
- Legacy MPLS overlays after migration
- PRI or trunk charges after voice modernization
- Inactive mobility lines billed to closed projects
- Duplicate AP payments
- Expired discounts
- International services priced above benchmark
- Shared sites with messy cost allocation
- High-cost broadcast or streaming services that remain advisory-only

### 10.4.1 Estate-specific opportunity seeds

The generator should also seed the following Paramount-like patterns:

- Studio buildings with oversized circuits that were provisioned for peak productions but never right-sized.
- Broadcast facilities carrying duplicate failover links without an approved resilience policy.
- Production sites with temporary circuits still billed after the project closed.
- Regional offices with multiple overlapping internet services because of acquisitions or site consolidations.
- Distribution nodes with premium transport services priced as if they were mission-critical even when utilization is low.
- Data centers with cross-connects and interconnects that are active in contracts but missing from inventory.
- Streaming-adjacent hubs with cloud interconnect or backhaul services split across multiple suppliers.
- Sites with different service mixes for corporate and content operations, requiring mixed classification and shared allocation.

### 10.5 Synthetic file generation outputs

The generator must be able to produce downloadable files in these formats:

- `.xlsx` inventory workbook
- `.xlsx` invoice workbook
- `.xlsx` AP export workbook
- `.csv` normalized extract files
- `.json` API payload fixtures
- `.pdf` invoice packets
- `.pdf` contract summaries

### 10.6 Synthetic data generation logic

The generator should support parameters for:

- Geography mix
- Currency mix
- Supplier count
- Contract complexity
- Risk profile
- Opportunity density
- Revenue-sensitive service share
- Data quality noise level
- Site archetype mix
- Criticality mix
- Resilience requirement mix
- Temporary versus permanent circuit ratio
- Production versus corporate spend ratio
- Broadcast and playout concentration
- Shared-service allocation complexity

### 10.6.1 Network profile rules

The synthetic generator must vary the network estate based on site archetype:

- Corporate offices should skew toward broadband, DIA, SD-WAN, voice, and mobility.
- Studio lots should skew toward high-bandwidth fiber, secure access, vendor connectivity, and occasional temporary circuits.
- Production facilities should skew toward short-term, project-based, and mobile-centric services.
- Distribution nodes should skew toward transport-heavy, high-availability services with strong route diversity.
- Data centers should skew toward colo, interconnect, wavelength, and backbone routing services.
- Regional offices should skew toward standard internet and collaboration services with moderate redundancy.
- Broadcast hubs should skew toward redundant transport, contribution, playout, and low-latency architectures.
- Streaming-adjacent hubs should skew toward cloud interconnect, content delivery adjacency, and hybrid technical/corporate services.

### 10.6.2 Data shape rules

The generator must ensure the following relationships:

- Higher-criticality sites have higher service counts and higher contract complexity.
- Broadcast hubs and data centers have the highest redundancy ratios.
- Production sites have the highest share of temporary services.
- Corporate and regional offices have the highest share of standard office telecom.
- Shared sites must have allocations spanning both revenue and SG&A.
- Core revenue-sensitive services must appear in both inventory and contract data even when they are intentionally not benchmarked for automatic action.
- Each site should have at least one associated service except for intentionally empty placeholder sites used to test exception handling.
- Each major site archetype should produce at least one opportunity signal in the demo portfolio.

### 10.7 Required synthetic behaviors

- Randomized but plausible invoice line descriptions.
- Duplicate services with slight naming variations.
- Supplier aliases and account hierarchy variations.
- Incomplete or conflicting site names.
- Contract dates that create renewal urgency.
- AP records that occasionally fail duplicate-check logic.
- Usage values that enable underutilization findings.
- Benchmark records with percentile bands and sample sizes.

### 10.8 Synthetic generator UI

The app must include a Data Ingestion and Synthetic Data screen where users can:

- Choose a scenario template
- Select entity count and region mix
- Generate workbook and PDF files
- Upload files manually
- Preview generated records
- Download generated outputs

---

## 11. Data Ingestion Requirements

The application must support both upload-based ingestion and synthetic generation.

### 11.1 Supported ingestion formats

- Excel workbooks
- CSV files
- PDF invoices
- PDF contract summaries
- JSON API payloads

### 11.2 Ingestion flow

1. Upload file or generate synthetic dataset.
2. Extract structured content.
3. Map source fields to canonical model.
4. Reconcile aliases and duplicates.
5. Validate required fields.
6. Assign confidence scores.
7. Queue unresolved records for analyst review.

### 11.3 Mapping and validation requirements

- Show source file name and sheet name for each imported record.
- Detect missing fields and conflicting dates.
- Flag unmapped rows.
- Preserve raw text alongside normalized fields.
- Allow manual field mapping adjustments.

---

## 12. Screen Specifications

## 12.1 Executive Command Center

Purpose:

- Boardroom summary for CFO and CIO.

Must show:

- Total annualized run-rate savings
- One-time recovery potential
- Revenue versus SG&A savings split
- Time-to-decision metric
- Top carriers by addressable savings
- Global hotspot heatmap

Layout:

- Four KPI cards across the top.
- Savings waterfall.
- Spend split chart.
- Prioritized actions panel.
- Heatmap or map of global hotspots.

Mode:

- Executive mode should reduce the page to five primary visuals plus a narrative summary.

## 12.2 Spend Classification Studio

Purpose:

- Validate revenue versus SG&A versus shared classification.

Must show:

- Invoice lines
- AP records
- Site dictionaries
- Rule logic
- Category assignments
- Allocation percentages
- Exceptions
- Override history

Layout:

- Left pane: rules and filters.
- Center pane: line-item table.
- Right pane: explanation and override controls.

## 12.3 Network Inventory Workbench

Purpose:

- Reconciled view of services, billing, and contract status.

Must show:

- Reconciled inventory
- Exception states
- Service-first table
- Optional topology or relationship view
- Sticky comparison bar

Exception states:

- Billed but not in inventory
- In inventory but not billed
- Pending disconnect still billing
- Active but missing contract linkage

## 12.4 Billing Assurance Console

Purpose:

- Invoice audit and recovery workflow.

Must show:

- Invoice PDFs
- Extracted line items
- Contract rates
- AP data
- Inventory status
- Anomaly groups by error type
- Materiality
- Recoverability

Layout:

- Review queue at the center.
- Evidence drawer for every row.

## 12.5 Benchmark and Market Rate Workbench

Purpose:

- Compare current rates to market benchmarks.

Must show:

- Current rate
- Benchmark band
- Percentile placement
- Target rate
- Annualized opportunity
- Alternative commercial scenarios

Chart requirements:

- Benchmark band visualization with client rate overlay.
- Comparison table for repricing, consolidation, and redesign scenarios.
- Local currency and normalized USD views.

## 12.6 Contract and Renewal Cockpit

Purpose:

- Track renewal timing and contract risk.

Must show:

- Expiring deals
- Unfavorable term flags
- Escalation clauses
- Discount cliffs
- Auto-renew exposure
- AI-drafted negotiation packet

Layout:

- Timeline on top.
- Clause-risk heatmap in the middle.
- Action deck on the right.

## 12.7 Site and Service 360

Purpose:

- Universal drill-down screen for every site or service.

Must show:

- Site profile
- Business purpose
- Criticality
- Services in place
- Invoice history
- Benchmark position
- Utilization
- Recommended actions

For single service drill-down, also show:

- Supplier
- Status
- Contract linkage
- Billing anomalies
- Narrative explanation

## 12.8 Analyst Review and Action Studio

Purpose:

- Human review and client-facing export control.

Must show:

- Queue of findings
- Confidence filters
- Kanban states
- Approved actions
- Suppressed actions
- Edited rationales
- Export packets

Kanban states:

- New
- Under review
- Approved
- Blocked
- Exported

## 12.9 Data Ingestion and Synthetic Data

Purpose:

- Upload and generate data assets.

Must show:

- File upload zone
- Template selection
- Synthetic dataset parameters
- Generated file list
- Preview table
- Mapping status

## 12.10 Admin and Configuration

Purpose:

- Manage rules, classifications, benchmark configuration, user roles, and data sources.

Must show:

- Rule sets
- Thresholds
- Confidence settings
- Currency normalization settings
- Benchmark source settings
- Review workflow settings

---

## 13. UX and Visual Design Requirements

### 13.1 Layout system

- Desktop-first 12-column grid.
- Consistent spacing scale.
- Modular card system.
- Sticky top banner and filter bar.
- Sidebar navigation with clear active state.

### 13.2 Visual style

- Premium, sober, infrastructure-grade.
- Neutral workspace with dark navigation.
- Semantic color only for savings, risk, and review state.
- No consumer AI styling.
- No decorative clutter.

### 13.3 Chart system

Charts must include:

- KPI cards
- Waterfall chart
- Spend split chart
- Heatmap
- Benchmark band chart
- Trend line chart
- Exception distribution chart
- Renewal timeline
- Clause risk heatmap

### 13.4 Table system

Tables must support:

- Sorting
- Column resizing
- Saved views
- Row drill-down
- Inline evidence indicators
- Status chips
- Confidence chips
- Currency toggles

### 13.5 Evidence drawer

The right-side evidence drawer must show:

- Source file
- Source row or page reference
- Matched contract clause
- Matching invoice line
- AP record
- Usage record
- Benchmark source
- Model explanation
- Reviewer history

---

## 14. AI System Requirements

AI must be used in four places:

### 14.1 Extraction and normalization

- Parse contracts, invoices, AP exports, and inventory files.
- Convert unstructured text into canonical records.

### 14.2 Explanation

- Answer why a service was flagged.
- Show the evidence chain.
- Summarize the reason for classification and recommendation.

### 14.3 Recommendation drafting

- Generate downgrade, disconnect, rebid, renewal, and dispute suggestions.
- Draft negotiation notes and executive summaries.

### 14.4 Artifact generation

- Draft carrier dispute notes.
- Draft negotiation term sheets.
- Draft benchmark memos.
- Draft executive summaries.

### 14.5 AI guardrails

- AI must not auto-execute actions.
- Core revenue services default to advisory-only.
- AI outputs must be reviewable and editable.
- AI must always surface confidence and source lineage.

---

## 15. Benchmark Logic Requirements

Benchmark output must never be a single number without context.

Each benchmark response must include:

- Minimum
- 25th percentile
- Median
- 75th percentile
- Maximum
- Sample size
- Observation date
- Confidence flag

Supported benchmark categories:

- DIA
- Broadband
- WAN
- SD-WAN
- Local access
- Ethernet
- Wavelength
- Fixed voice
- Colocation
- Interconnect
- Mobility
- Contact center
- Media-network transport

The product should support both:

- Local currency benchmarking
- Normalized cross-country benchmark views

---

## 16. Finding and Review Workflow

### 16.1 Finding lifecycle

1. Ingest data.
2. Normalize and reconcile records.
3. Classify services.
4. Generate findings.
5. Attach evidence.
6. Route to analyst review.
7. Approve, suppress, or rewrite.
8. Export client-ready packet.

### 16.2 Required finding fields

- Finding type
- Financial impact
- Operational risk
- Evidence completeness
- Benchmark confidence
- Reviewer status
- Suggested next step

### 16.3 Review controls

- Approve
- Suppress
- Edit rationale
- Request more evidence
- Mark as blocked
- Export

---

## 17. Acceptance Criteria

The product is considered ready when it can do all of the following:

- Generate synthetic telecom datasets with contracts, invoices, AP exports, and Excel files.
- Ingest uploaded files and map them into the canonical model.
- Classify services into revenue, SG&A, and shared with explainable rules.
- Reconcile inventory, billing, and contracts.
- Produce at least three opportunity classes.
- Show benchmark comparisons with percentile bands.
- Support analyst review before export.
- Present an executive landing page with clear savings and risk visuals.
- Provide drill-down from summary to source evidence in three clicks or fewer.
- Maintain advisory-only posture for revenue-sensitive services.

---

## 18. Suggested MVP Scope

### MVP modules

- Executive Command Center
- Data Ingestion and Synthetic Data
- Network Inventory Workbench
- Billing Assurance Console
- Benchmark and Market Rate Workbench
- Analyst Review and Action Studio
- Site and Service 360

### Phase 2 modules

- Spend Classification Studio
- Contract and Renewal Cockpit
- Admin and Configuration
- Advanced scenario simulations
- Export packet templates

---

## 19. Technical Implementation Notes for Codex

### 19.1 Frontend

- Build a responsive desktop-first application.
- Use a 12-column CSS grid or equivalent layout system.
- Use a left navigation rail and sticky top banner.
- Use reusable chart, card, table, drawer, and filter components.
- Use a design system with neutral surfaces and semantic accents.

### 19.2 Backend

- Store normalized telecom entities in relational tables.
- Store raw imported files separately from normalized data.
- Store synthetic data generation parameters and outputs.
- Track full audit history for classification overrides and review actions.

### 19.3 Data services

- Parser service for PDF, Excel, CSV, and JSON inputs.
- Synthetic generator service for realistic telecom entities.
- Reconciliation service for service matching and deduplication.
- Benchmark service that returns percentile bands and confidence.
- Opportunity engine for savings and recovery calculations.

### 19.4 Workflow state

- Every finding needs a lifecycle state.
- Every state transition must be auditable.
- Reviewer actions must be preserved with reason text.

### 19.5 Security and governance

- Role-based access control.
- Restricted actions for revenue-sensitive services.
- Immutable audit log for overrides and exports.
- Separate demo data from production data.

---

## 20. Recommended Demo Narrative

1. CFO lands on the Executive Command Center and sees annualized savings, recovery, and risk split.
2. CIO drills into Site and Service 360 to verify that revenue-driving services are handled conservatively.
3. Procurement uses the Benchmark Workbench and Contract Cockpit to review rate opportunities and renewal risk.
4. Finance opens Billing Assurance Console to see invoice anomalies and recoverable spend.
5. Analyst Review and Action Studio exports a reviewed action packet.

---

## 21. Output Assets the Application Must Generate

The application should be able to generate:

- Executive summary views
- Savings waterfall snapshots
- Opportunity lists
- Billing dispute packets
- Renewal negotiation briefs
- Benchmark memos
- Exportable Excel workbooks
- CSV extracts
- PDF review packets

---

## 22. Definition of Done

The implementation is complete when:

- The app has a polished, grid-based dashboard system.
- The app can generate and ingest synthetic telecom data.
- The app supports a full input screen for manually entering or uploading data.
- All described screens exist and are connected by navigation.
- All major metrics, findings, and recommendations are drillable to evidence.
- Charts, tables, and drawers are consistent across the product.
- The UI feels like an enterprise operating system, not a basic demo.

---

## 23. Build Order Recommendation

Implement in this order:

1. Canonical data model
2. Synthetic data generator
3. Data ingestion and mapping
4. Reconciliation and classification logic
5. Benchmark service
6. Finding engine
7. Executive Command Center
8. Inventory and billing screens
9. Contract and review workflow
10. Polish, charts, and export packets

---

## 24. Notes for Codex

- Treat this markdown as the source-of-truth build spec.
- Favor clarity, auditability, and premium enterprise design.
- Preserve the conservative treatment of revenue-sensitive services.
- Prioritize explainability over automation.
- Use synthetic data that feels realistic, complex, and demo-worthy.
