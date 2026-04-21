import { NextResponse } from "next/server";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as XLSX from "xlsx";
import { getDashboardSnapshot, resetDatabaseCache } from "@/lib/telecom/db";

export const runtime = "nodejs";

type DuckDbConnection = {
  run(sql: string, ...params: unknown[]): void;
  close(cb?: (error?: Error | null) => void): void;
};

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

async function readRows(file: File, preferredSheet: string) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName =
    workbook.SheetNames.find((sheet) => sheet.toLowerCase() === preferredSheet.toLowerCase()) ??
    workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: "" });
}

async function readPdfText(file: File) {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()) });
  const parsed = await parser.getText();
  await parser.destroy();
  return parsed.text;
}

function splitRecords(text: string, prefix: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith(prefix));
}

function parseDelimitedRecord(line: string, expectedPrefix: string) {
  const parts = line.split("|");
  if (parts[0] !== expectedPrefix) {
    return null;
  }
  return parts;
}

function parseContractsPdf(text: string) {
  return splitRecords(text, "CONTRACT|")
    .map((line) => parseDelimitedRecord(line, "CONTRACT"))
    .filter((parts): parts is string[] => parts !== null && parts.length >= 18)
    .map((parts) => ({
      contract_id: parts[1] ?? "",
      supplier_id: parts[2] ?? "",
      supplier_name: parts[3] ?? "",
      archetype: parts[4] ?? "",
      country_scope: parts[5] ?? "",
      start_date: parts[6] ?? "",
      end_date: parts[7] ?? "",
      rate_card: parts[8] ?? "",
      discount_schedule: parts[9] ?? "",
      escalation_clause: parts[10] ?? "",
      renewal_terms: parts[11] ?? "",
      auto_renew: parts[12] ?? "",
      termination_terms: parts[13] ?? "",
      clause_risk: parts[14] ?? "",
      tower: parts[15] ?? "",
      annual_spend_target: parts[16] ?? "",
      sites_covered_json: parts[17] ?? "[]",
    }));
}

function parseInvoicesPdf(text: string) {
  return splitRecords(text, "INVOICE|")
    .map((line) => parseDelimitedRecord(line, "INVOICE"))
    .filter((parts): parts is string[] => parts !== null && parts.length >= 16)
    .map((parts) => ({
      invoice_id: parts[1] ?? "",
      invoice_line_id: parts[2] ?? "",
      bill_period: parts[3] ?? "",
      line_description: parts[4] ?? "",
      amount: parts[5] ?? "",
      charge_type: parts[6] ?? "",
      billed_quantity: parts[7] ?? "",
      service_id: parts[8] ?? "",
      site_id: parts[9] ?? "",
      supplier_id: parts[10] ?? "",
      payment_status: parts[11] ?? "",
      source_file: parts[12] ?? "",
      source_sheet: parts[13] ?? "",
      source_reference: parts[14] ?? "",
      duplicate_charge: parts[15] ?? "false",
    }));
}

async function getConnection() {
  const dbDir = process.env.TELECOM_DB_DIR ?? path.join(os.tmpdir(), "aitelecomexpense");
  fs.mkdirSync(dbDir, { recursive: true });
  const duckdb = await import("duckdb");
  const db = new duckdb.Database(path.join(dbDir, "telecom-optimization.duckdb"));
  return db.connect();
}

function coerceText(value: unknown) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function coerceNumber(value: unknown) {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function coerceBoolean(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }
  return String(value).toLowerCase() === "true" || String(value) === "1";
}

function looksLikePdf(file: File) {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploaded: Array<{ kind: string; count: number }> = [];

  const conn = await getConnection();

  try {
    await run(conn, "BEGIN TRANSACTION");

    const contractFile = formData.get("contracts");
    if (contractFile instanceof File && contractFile.size > 0) {
      const rows = looksLikePdf(contractFile)
        ? parseContractsPdf(await readPdfText(contractFile))
        : await readRows(contractFile, "contracts");
      await run(conn, "DELETE FROM contracts");
      for (const row of rows) {
        await run(
          conn,
          "INSERT INTO contracts VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            coerceText(row.contract_id),
            coerceText(row.supplier_id),
            coerceText(row.supplier_name),
            coerceText(row.archetype),
            coerceText(row.country_scope),
            coerceText(row.start_date),
            coerceText(row.end_date),
            coerceText(row.rate_card),
            coerceText(row.discount_schedule),
            coerceText(row.escalation_clause),
            coerceText(row.renewal_terms),
            coerceText(row.auto_renew),
            coerceText(row.termination_terms),
            coerceText(row.clause_risk),
            coerceText(row.tower),
            coerceNumber(row.annual_spend_target),
            coerceText(row.sites_covered_json),
          ],
        );
      }
      uploaded.push({ kind: "contracts", count: rows.length });
    }

    const invoiceFile = formData.get("invoices");
    if (invoiceFile instanceof File && invoiceFile.size > 0) {
      const rows = looksLikePdf(invoiceFile)
        ? parseInvoicesPdf(await readPdfText(invoiceFile))
        : await readRows(invoiceFile, "invoice_lines");
      await run(conn, "DELETE FROM invoice_lines");
      for (const row of rows) {
        await run(
          conn,
          "INSERT INTO invoice_lines VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            coerceText(row.invoice_id),
            coerceText(row.invoice_line_id),
            coerceText(row.bill_period),
            coerceText(row.line_description),
            coerceNumber(row.amount),
            coerceText(row.charge_type),
            coerceNumber(row.billed_quantity),
            coerceText(row.service_id),
            coerceText(row.site_id),
            coerceText(row.supplier_id),
            coerceText(row.payment_status),
            coerceText(row.source_file),
            coerceText(row.source_sheet),
            coerceText(row.source_reference),
            coerceBoolean(row.duplicate_charge),
          ],
        );
      }
      uploaded.push({ kind: "invoices", count: rows.length });
    }

    const apFile = formData.get("ap");
    if (apFile instanceof File && apFile.size > 0) {
      const rows = await readRows(apFile, "ap_records");
      await run(conn, "DELETE FROM ap_records");
      for (const row of rows) {
        await run(
          conn,
          "INSERT INTO ap_records VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            coerceText(row.voucher_number),
            coerceNumber(row.paid_amount),
            coerceText(row.payment_date),
            coerceText(row.cost_center),
            coerceText(row.duplicate_check_key),
            coerceText(row.gl_mapping),
            coerceText(row.project_mapping),
            coerceText(row.invoice_id),
            coerceText(row.site_id),
            coerceText(row.supplier_id),
          ],
        );
      }
      uploaded.push({ kind: "ap", count: rows.length });
    }

    await run(conn, "COMMIT");
    resetDatabaseCache();
    const snapshot = await getDashboardSnapshot();

    return NextResponse.json({
      ok: true,
      uploaded,
      totals: {
        annualized_savings: snapshot.kpis[0]?.value ?? "$0",
        one_time_recovery: snapshot.kpis[1]?.value ?? "$0",
      },
    });
  } catch (error) {
    await run(conn, "ROLLBACK").catch(() => undefined);
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
