import type { ProcessingSettings } from "@shared/schema";
import { createWorker } from "tesseract.js";
import { exec } from "child_process";
import { promises as fs } from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

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
      
      // Convert PDF to images using pdftoppm
      const outputImageBase = path.join(tempDir, `page`);
      const pdftoppmCommand = `pdftoppm -png ${inputPdfPath} ${outputImageBase}`;
      console.log(`Executing: ${pdftoppmCommand}`);
      await new Promise<void>((resolve, reject) => {
        exec(pdftoppmCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`pdftoppm error: ${error.message}`);
            return reject(error);
          }
          if (stderr) {
            console.warn(`pdftoppm stderr: ${stderr}`);
          }
          resolve();
        });
      });

      let extractedText = "";
      let pageCount = 0;
      
      // Initialize Tesseract worker with language
      worker = await createWorker("eng");

      // Process each generated image with Tesseract.js
      let pageIndex = 1;
      while (true) {
        const imagePath = `${outputImageBase}-${pageIndex}.png`;
        try {
          await fs.access(imagePath);
          console.log(`Processing image: ${imagePath}`);
          const { data: { text } } = await worker.recognize(imagePath);
          extractedText += text + "\n";
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

      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error("Unable to extract readable text from PDF");
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


