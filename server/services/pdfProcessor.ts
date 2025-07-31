import type { ProcessingSettings } from "@shared/schema";
import { createWorker } from "tesseract.js";
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { createCanvas } from "canvas";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  wordCount: number;
  metadata?: any;
}

export class PdfProcessor {
  async extractText(buffer: Buffer, settings: ProcessingSettings): Promise<PdfExtractionResult> {
    const tempDir = path.join(__dirname, "temp");
    await fs.mkdir(tempDir, { recursive: true });
    const inputPdfPath = path.join(tempDir, `input_${Date.now()}.pdf`);
    await fs.writeFile(inputPdfPath, buffer);

    let worker;
    try {
      console.log("Starting PDF processing with pdftoppm and Tesseract.js...");
      
      // Validate PDF file before processing
      await this.validatePdfFile(inputPdfPath);
      
      // Convert PDF to images using pdftoppm with error handling
      const outputImageBase = path.join(tempDir, `page`);
      const pdftoppmCommand = `pdftoppm -png "${inputPdfPath}" "${outputImageBase}"`;
      console.log(`Executing: ${pdftoppmCommand}`);
      
      await new Promise<void>((resolve, reject) => {
        exec(pdftoppmCommand, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            console.error(`pdftoppm error: ${error.message}`);
            if (stderr.includes("Syntax Error") || stderr.includes("Couldn't find trailer dictionary")) {
              return reject(new Error("PDF file appears to be corrupted or in an unsupported format. Please try with a different PDF file."));
            }
            return reject(new Error(`Failed to convert PDF to images: ${error.message}`));
          }
          if (stderr && stderr.includes("Warning")) {
            console.warn(`pdftoppm warnings: ${stderr}`);
          }
          resolve();
        });
      });

      let extractedText = "";
      let pageCount = 0;
      
      // Initialize Tesseract worker with language and optimized settings
      worker = await createWorker("eng");
      await worker.setParameters({
        tessedit_pageseg_mode: 1 as any, // Automatic page segmentation with OSD
        tessedit_ocr_engine_mode: 1 as any, // LSTM only
      });

      // Process each generated image with Tesseract.js
      let pageIndex = 1;
      while (true) {
        const imagePath = `${outputImageBase}-${pageIndex}.png`;
        try {
          await fs.access(imagePath);
          console.log(`Processing image: ${imagePath}`);
          
          // Apply image preprocessing if needed
          const { data: { text } } = await worker.recognize(imagePath);
          
          if (text && text.trim().length > 0) {
            extractedText += text + "\n";
          }
          pageCount++;
          pageIndex++;
        } catch (e: any) {
          if (e.code === "ENOENT") {
            // No more image files
            break;
          } else {
            console.error(`Error processing image ${imagePath}:`, e);
            throw e;
          }
        }
      }

      if (!extractedText || extractedText.trim().length < 10) {
        throw new Error("Unable to extract readable text from PDF. The document may be image-based, corrupted, or contain unsupported content.");
      }

      const cleanedText = this.cleanText(extractedText);
      const wordCount = this.countWords(cleanedText);

      console.log(`Extracted ${wordCount} words from ${pageCount} pages`);

      return {
        text: cleanedText,
        pageCount,
        wordCount,
        metadata: {
          title: "PDF Document (OCR)",
          processed: new Date().toISOString(),
          extractionMethod: "pdftoppm-tesseract"
        }
      };
    } catch (error) {
      console.error("PDF processing error:", error);
      throw new Error(`Failed to extract text from PDF: ${error}`);
    } finally {
      // Clean up temporary files
      if (worker) {
        await worker.terminate();
      }
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  }

  private async validatePdfFile(filePath: string): Promise<void> {
    try {
      const buffer = await fs.readFile(filePath);
      
      // Check PDF header
      const header = buffer.slice(0, 8).toString();
      if (!header.startsWith('%PDF-')) {
        throw new Error("File does not appear to be a valid PDF (missing PDF header)");
      }
      
      // Check for minimum file size
      if (buffer.length < 1024) {
        throw new Error("PDF file appears to be too small or corrupted");
      }
      
      // Check for PDF trailer
      const trailer = buffer.slice(-1024).toString();
      if (!trailer.includes('%%EOF') && !trailer.includes('trailer')) {
        console.warn("PDF may be incomplete or corrupted (missing trailer)");
      }
      
    } catch (error) {
      throw new Error(`PDF validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ")
      .replace(/\n+/g, "\n")
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  chunkText(text: string, chunkSize: number = 4000): string[] {
    const chunks: string[] = [];
    const words = text.split(" ");

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(" "));
    }

    return chunks;
  }
}

export const pdfProcessor = new PdfProcessor();


