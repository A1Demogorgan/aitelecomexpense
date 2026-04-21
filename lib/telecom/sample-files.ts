import { PassThrough } from "node:stream";
import PDFDocument from "pdfkit";
import * as XLSX from "xlsx";
import { buildSeedDataset } from "./seed";

export type SampleKind = "contracts" | "invoices" | "ap";

const seed = buildSeedDataset();

type PdfDoc = InstanceType<typeof PDFDocument>;

function createPdfBuffer(write: (doc: PdfDoc) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [1224, 792],
      layout: "landscape",
      margin: 28,
      bufferPages: true,
    });
    const stream = new PassThrough();
    const chunks: Buffer[] = [];

    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);
    write(doc);
    doc.end();
  });
}

function writeHeader(doc: PdfDoc, title: string, subtitle: string, fieldOrder: string[]) {
  doc.fillColor("#0f172a").font("Helvetica-Bold").fontSize(18).text(title);
  doc.moveDown(0.35);
  doc.fillColor("#334155").font("Helvetica").fontSize(9).text(subtitle);
  doc.moveDown(0.25);
  doc.fillColor("#475569").font("Helvetica").fontSize(8).text(`FIELD ORDER | ${fieldOrder.join(" | ")}`);
  doc.moveDown(0.35);
  doc.fillColor("#020617");
  doc.font("Courier").fontSize(6);
}

function ensurePageSpace(doc: PdfDoc, linesNeeded = 1) {
  const bottom = doc.page.height - doc.page.margins.bottom - 18;
  const projected = doc.y + linesNeeded * 8;
  if (projected > bottom) {
    doc.addPage();
  }
}

function writeRows(doc: PdfDoc, rows: string[]) {
  for (const row of rows) {
    ensurePageSpace(doc);
    doc.text(row, { lineBreak: true });
  }
}

function contractLines() {
  return seed.contracts.map((contract) =>
    [
      "CONTRACT",
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
      String(contract.annual_spend_target),
      JSON.stringify(contract.sites_covered),
    ].join("|"),
  );
}

function invoiceLines() {
  return seed.invoiceLines.map((invoice) =>
    [
      "INVOICE",
      invoice.invoice_id,
      invoice.invoice_line_id,
      invoice.bill_period,
      invoice.line_description,
      String(invoice.amount),
      invoice.charge_type,
      String(invoice.billed_quantity),
      invoice.service_id,
      invoice.site_id,
      invoice.supplier_id,
      invoice.payment_status,
      invoice.source_file,
      invoice.source_sheet,
      invoice.source_reference,
      invoice.duplicate_charge ? "true" : "false",
    ].join("|"),
  );
}

function buildContractsPdf() {
  return createPdfBuffer((doc) => {
    writeHeader(
      doc,
      "Telecom Optimization Command Center - Contract Pack",
      "Synthetic contract packet for upload into DuckDB. Each row is a machine-readable CONTRACT record.",
      [
        "contract_id",
        "supplier_id",
        "supplier_name",
        "archetype",
        "country_scope",
        "start_date",
        "end_date",
        "rate_card",
        "discount_schedule",
        "escalation_clause",
        "renewal_terms",
        "auto_renew",
        "termination_terms",
        "clause_risk",
        "tower",
        "annual_spend_target",
        "sites_covered_json",
      ],
    );
    writeRows(doc, contractLines());
  });
}

function buildInvoicesPdf() {
  return createPdfBuffer((doc) => {
    writeHeader(
      doc,
      "Telecom Optimization Command Center - Invoice Pack",
      "Synthetic invoice packet for upload into DuckDB. Each row is a machine-readable INVOICE record.",
      [
        "invoice_id",
        "invoice_line_id",
        "bill_period",
        "line_description",
        "amount",
        "charge_type",
        "billed_quantity",
        "service_id",
        "site_id",
        "supplier_id",
        "payment_status",
        "source_file",
        "source_sheet",
        "source_reference",
        "duplicate_charge",
      ],
    );
    writeRows(doc, invoiceLines());
  });
}

function buildApWorkbook() {
  const worksheet = XLSX.utils.json_to_sheet(
    seed.apRows.map((row) => ({
      voucher_number: row.voucher_number,
      paid_amount: row.paid_amount,
      payment_date: row.payment_date,
      cost_center: row.cost_center,
      duplicate_check_key: row.duplicate_check_key,
      gl_mapping: row.gl_mapping,
      project_mapping: row.project_mapping,
      invoice_id: row.invoice_id,
      site_id: row.site_id,
      supplier_id: row.supplier_id,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ap_records");
  return Buffer.from(XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }));
}

export async function buildSampleFile(kind: SampleKind) {
  if (kind === "contracts") {
    return {
      buffer: await buildContractsPdf(),
      filename: "contracts.pdf",
      contentType: "application/pdf",
    };
  }
  if (kind === "invoices") {
    return {
      buffer: await buildInvoicesPdf(),
      filename: "invoices.pdf",
      contentType: "application/pdf",
    };
  }
  return {
    buffer: buildApWorkbook(),
    filename: "ap_export.xlsx",
    contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

export function sampleKindFromName(name: string): SampleKind | null {
  const normalized = name.toLowerCase();
  if (normalized.includes("contract")) return "contracts";
  if (normalized.includes("invoice")) return "invoices";
  if (normalized.includes("ap")) return "ap";
  return null;
}
