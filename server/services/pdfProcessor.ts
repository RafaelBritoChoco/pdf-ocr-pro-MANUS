// PDF processing using custom text extraction for any document
import type { ProcessingSettings } from "@shared/schema";

export interface PdfExtractionResult {
  text: string;
  pageCount: number;
  wordCount: number;
  metadata?: any;
}

export class PdfProcessor {
  async extractText(buffer: Buffer, settings: ProcessingSettings): Promise<PdfExtractionResult> {
    try {
      console.log('Starting custom PDF text extraction...');
      
      // Extract text using multiple approaches for better compatibility
      let extractedText = '';
      let pageCount = 1;
      
      // Try multiple extraction methods
      extractedText = this.extractTextFromBuffer(buffer);
      
      if (!extractedText || extractedText.trim().length < 50) {
        console.log('Primary extraction yielded minimal text, trying alternative methods...');
        extractedText = this.extractBasicText(buffer);
      }
      
      if (!extractedText || extractedText.trim().length < 20) {
        throw new Error('Unable to extract readable text from PDF');
      }
      
      const cleanedText = this.cleanText(extractedText);
      const wordCount = this.countWords(cleanedText);
      
      // Estimate page count based on content length
      pageCount = Math.max(1, Math.ceil(wordCount / 300));
      
      console.log(`Extracted ${wordCount} words from estimated ${pageCount} pages`);
      
      return {
        text: cleanedText,
        pageCount,
        wordCount,
        metadata: { 
          title: 'PDF Document', 
          processed: new Date().toISOString(),
          extractionMethod: 'custom'
        }
      };
    } catch (error) {
      console.error('PDF processing error:', error);
      throw new Error(`Failed to extract text from PDF: ${error}`);
    }
  }

  private extractTextFromBuffer(buffer: Buffer): string {
    // Convert buffer to string using different encodings and extract text
    let results: string[] = [];
    
    // Try UTF-8 first
    try {
      const utf8String = buffer.toString('utf8');
      const utf8Text = this.extractTextFromString(utf8String);
      if (utf8Text.length > 50) results.push(utf8Text);
    } catch (e) {}
    
    // Try Latin1 for binary PDF content
    try {
      const latin1String = buffer.toString('latin1');
      const latin1Text = this.extractTextFromString(latin1String);
      if (latin1Text.length > 50) results.push(latin1Text);
    } catch (e) {}
    
    // Try ASCII
    try {
      const asciiString = buffer.toString('ascii');
      const asciiText = this.extractTextFromString(asciiString);
      if (asciiText.length > 50) results.push(asciiText);
    } catch (e) {}
    
    // Return the longest extracted text
    return results.length > 0 ? results.reduce((a, b) => a.length > b.length ? a : b) : '';
  }

  private extractTextFromString(pdfString: string): string {
    let extractedText = '';
    
    // Method 1: Extract text between parentheses with Tj operators
    const tjMatches = pdfString.match(/\((.*?)\)\s*Tj/g);
    if (tjMatches) {
      extractedText += tjMatches
        .map(match => match.replace(/^\(|\)\s*Tj$/g, ''))
        .filter(text => text.length > 0)
        .join(' ') + ' ';
    }
    
    // Method 2: Extract text between parentheses with TJ operators
    const TJMatches = pdfString.match(/\[(.*?)\]\s*TJ/g);
    if (TJMatches) {
      extractedText += TJMatches
        .map(match => {
          const content = match.replace(/^\[|\]\s*TJ$/g, '');
          return content.replace(/\((.*?)\)/g, '$1');
        })
        .filter(text => text.length > 0)
        .join(' ') + ' ';
    }
    
    // Method 3: Extract text using BT/ET blocks
    const btMatches = pdfString.match(/BT[\s\S]*?ET/g);
    if (btMatches) {
      btMatches.forEach(block => {
        const textInParens = block.match(/\((.*?)\)/g);
        if (textInParens) {
          textInParens.forEach(text => {
            extractedText += text.replace(/[()]/g, '') + ' ';
          });
        }
      });
    }
    
    return extractedText.trim();
  }

  private extractBasicText(buffer: Buffer): string {
    // Fallback method: look for readable text patterns
    const pdfString = buffer.toString('latin1');
    
    // Look for readable text patterns in the PDF stream
    const readableTextPattern = /[A-Za-z][A-Za-z\s,.-]{10,}/g;
    const readableMatches = pdfString.match(readableTextPattern);
    
    if (readableMatches && readableMatches.length > 0) {
      return readableMatches
        .filter(text => text.length > 10)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    
    throw new Error('Unable to extract readable text from PDF');
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter(word => word.length > 0).length;
  }

  chunkText(text: string, chunkSize: number = 4000): string[] {
    const chunks: string[] = [];
    const words = text.split(' ');
    
    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(' '));
    }
    
    return chunks;
  }
}

export const pdfProcessor = new PdfProcessor();