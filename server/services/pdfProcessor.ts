import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { ProcessingSettings } from "@shared/schema";

// Polyfill DOM globals for Node.js environment
if (typeof global !== 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    constructor() {
      // Simple polyfill for DOMMatrix
    }
  };
  
  // Polyfill other DOM globals that PDF.js might need
  (global as any).window = {};
  (global as any).document = {};
  (global as any).navigator = { userAgent: 'node' };
}

// Configure PDF.js worker for legacy build
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.189/pdf.worker.min.js`;

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  wordCount: number;
  metadata?: any;
}

export class PdfProcessor {
  async extractText(buffer: Buffer, settings: ProcessingSettings): Promise<PdfExtractionResult> {
    try {
      // Convert Buffer to Uint8Array for PDF.js
      const uint8Array = new Uint8Array(buffer);
      const pdfDocument = await pdfjsLib.getDocument({ data: uint8Array }).promise;
      const pageCount = pdfDocument.numPages;
      let fullText = '';

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n\n';
      }

      // Clean up text
      fullText = this.cleanText(fullText);
      
      const wordCount = this.countWords(fullText);

      return {
        text: fullText,
        pageCount,
        wordCount,
        metadata: await this.extractMetadata(pdfDocument)
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to process PDF: ${error}`);
    }
  }

  private cleanText(text: string): string {
    return text
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Fix common OCR issues
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      // Remove page breaks and form feeds
      .replace(/[\f\r]/g, '')
      // Normalize line breaks
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  private async extractMetadata(pdfDocument: any): Promise<any> {
    try {
      const metadata = await pdfDocument.getMetadata();
      return {
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        creator: metadata.info?.Creator,
        producer: metadata.info?.Producer,
        creationDate: metadata.info?.CreationDate,
        modificationDate: metadata.info?.ModDate
      };
    } catch (error) {
      console.error('Metadata extraction error:', error);
      return {};
    }
  }

  chunkText(text: string, maxChunkSize: number = 4000): string[] {
    const chunks: string[] = [];
    const paragraphs = text.split('\n\n');
    let currentChunk = '';

    for (const paragraph of paragraphs) {
      if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
        currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
          currentChunk = paragraph;
        } else {
          // Handle very long paragraphs
          const sentences = paragraph.split('. ');
          for (const sentence of sentences) {
            if (currentChunk.length + sentence.length + 2 <= maxChunkSize) {
              currentChunk += (currentChunk ? '. ' : '') + sentence;
            } else {
              if (currentChunk) {
                chunks.push(currentChunk);
                currentChunk = sentence;
              } else {
                chunks.push(sentence);
              }
            }
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks;
  }
}

export const pdfProcessor = new PdfProcessor();
