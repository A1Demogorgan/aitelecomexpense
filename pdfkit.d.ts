declare module "pdfkit" {
  import { EventEmitter } from "node:events";

  type PdfKitOptions = {
    size?: string | number[] | { width: number; height: number };
    layout?: "portrait" | "landscape";
    margin?: number;
    bufferPages?: boolean;
  };

  class PDFDocument extends EventEmitter {
    constructor(options?: PdfKitOptions);
    pipe<T>(destination: T): T;
    end(): void;
    text(text: string, options?: Record<string, unknown>): this;
    fillColor(color: string): this;
    font(fontName: string): this;
    fontSize(size: number): this;
    moveDown(lines?: number): this;
    addPage(): this;
    page: {
      height: number;
      margins: { bottom: number };
    };
    y: number;
  }

  export default PDFDocument;
}
