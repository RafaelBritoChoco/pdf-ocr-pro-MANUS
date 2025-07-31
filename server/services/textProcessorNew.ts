// FILE: server/services/textProcessor.ts

/**
 * Advanced text processing utilities for PDF content extraction and formatting
 * Handles multilingual content, complex structures, and various document types
 */

interface TextProcessingOptions {
    preserveOriginalLineBreaks?: boolean;
    detectLanguage?: boolean;
    strictStructuralDetection?: boolean;
    minLineLength?: number;
    customStructuralPatterns?: RegExp[];
}

interface FootnoteProcessingOptions {
    moveToEnd?: boolean;
    preserveInline?: boolean;
    customFootnotePattern?: RegExp;
}

/**
 * Improved paragraph joining with enhanced multilingual support and better structure detection
 * @param rawText The raw text extracted from the PDF, with its original line breaks.
 * @param options Configuration options for text processing
 * @returns A string with paragraphs correctly joined.
 */
export function joinParagraphs(rawText: string, options: TextProcessingOptions = {}): string {
    if (!rawText || typeof rawText !== 'string') return '';

    const {
        preserveOriginalLineBreaks = false,
        strictStructuralDetection = false,
        minLineLength = 3,
        customStructuralPatterns = []
    } = options;

    // Normalize line endings and handle various encodings
    const normalizedText = rawText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\u2028|\u2029/g, '\n'); // Unicode line separators

    const lines = normalizedText.split('\n');
    if (lines.length === 0) return '';

    let result = '';
    let buffer: string[] = [];

    // Enhanced structural patterns supporting multiple languages
    const structuralPatterns = [
        // English patterns
        /^(CHAPTER|ARTICLE|SECTION|ANNEX|APPENDIX|PREAMBLE|PART\s|TITLE\s|SCHEDULE\s)/i,
        
        // Portuguese patterns
        /^(CAPÍTULO|ARTIGO|SEÇÃO|SEÇÃO|ANEXO|APÊNDICE|PREÂMBULO|PARTE\s|TÍTULO\s)/i,
        
        // Spanish patterns
        /^(CAPÍTULO|ARTÍCULO|SECCIÓN|ANEXO|APÉNDICE|PREÁMBULO|PARTE\s|TÍTULO\s)/i,
        
        // French patterns
        /^(CHAPITRE|ARTICLE|SECTION|ANNEXE|APPENDICE|PRÉAMBULE|PARTIE\s|TITRE\s)/i,
        
        // Numbered lists and bullet points
        /^\s*(\d+\.|\([a-z]\)|\([ivx]+\)|[a-z]\)|\d+\))/i,
        
        // Roman numerals
        /^\s*[IVXLCDM]+\.\s/i,
        
        // Custom user patterns
        ...customStructuralPatterns
    ];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        const nextLine = i < lines.length - 1 ? lines[i + 1]?.trim() : '';

        // Skip overly short lines unless they're clearly structural
        if (trimmedLine.length < minLineLength && !isStructuralElement(trimmedLine, structuralPatterns)) {
            if (trimmedLine === '') {
                // Blank line - end current paragraph
                if (buffer.length > 0) {
                    result += (result ? '\n\n' : '') + buffer.join(' ');
                    buffer = [];
                }
            }
            continue;
        }

        const isStructural = isStructuralElement(trimmedLine, structuralPatterns);
        const isEndOfSentence = /[.!?]\s*$/.test(trimmedLine);
        const nextIsStructural = nextLine ? isStructuralElement(nextLine, structuralPatterns) : false;

        if (trimmedLine === '') {
            // Blank line always signals end of paragraph
            if (buffer.length > 0) {
                result += (result ? '\n\n' : '') + buffer.join(' ');
                buffer = [];
            }
        } else if (isStructural) {
            // Structural element starts new paragraph
            if (buffer.length > 0) {
                result += (result ? '\n\n' : '') + buffer.join(' ');
            }
            buffer = [trimmedLine];
        } else if (preserveOriginalLineBreaks || (isEndOfSentence && nextIsStructural)) {
            // Preserve line break for sentences ending before structural elements
            buffer.push(trimmedLine);
            if (buffer.length > 0) {
                result += (result ? '\n\n' : '') + buffer.join(' ');
                buffer = [];
            }
        } else {
            // Regular text line - add to current paragraph
            buffer.push(trimmedLine);
        }
    }

    // Add remaining buffered content
    if (buffer.length > 0) {
        result += (result ? '\n\n' : '') + buffer.join(' ');
    }

    return result.trim();
}

/**
 * Determines if a line is a structural element based on patterns
 */
function isStructuralElement(line: string, patterns: RegExp[]): boolean {
    return patterns.some(pattern => pattern.test(line));
}

export class TextProcessor {
    reorganizeContent(text: string, options: TextProcessingOptions = {}): string {
        // Use the improved joinParagraphs function
        return joinParagraphs(text, options);
    }
    
    /**
     * Enhanced footnote processing with better pattern matching
     */
    processFootnotes(text: string, options: FootnoteProcessingOptions = {}): string {
        const {
            moveToEnd = true,
            preserveInline = false,
            customFootnotePattern
        } = options;

        // Enhanced footnote patterns supporting various formats
        const footnotePatterns = [
            customFootnotePattern,
            /\[\d+\]\s*([^[\n]*(?:\n(?![[\d+\]])[^\n]*)*)/g, // [1] format
            /\(\d+\)\s*([^(\n]*(?:\n(?!\(\d+\))[^\n]*)*)/g,   // (1) format
            /\*+\s*([^*\n]*(?:\n(?!\*+)[^\n]*)*)/g,           // * format
            /†+\s*([^†\n]*(?:\n(?!†+)[^\n]*)*)/g,            // † format
        ].filter(Boolean) as RegExp[];

        if (preserveInline) {
            return text; // Return as-is if preserving inline footnotes
        }

        const footnotes: string[] = [];
        let footnoteIndex = 1;
        let processedText = text;

        // Process each footnote pattern
        footnotePatterns.forEach(pattern => {
            processedText = processedText.replace(pattern, (match, content) => {
                if (content && content.trim()) {
                    footnotes.push(`[${footnoteIndex}] ${content.trim()}`);
                    return `[${footnoteIndex++}]`;
                }
                return match;
            });
        });

        // Add footnotes section at the end if any were found
        if (moveToEnd && footnotes.length > 0) {
            processedText += '\n\n--- FOOTNOTES ---\n\n' + footnotes.join('\n\n');
        }

        return processedText;
    }

    /**
     * Enhanced text alignment with better Unicode support
     */
    alignText(text: string): string {
        return text
            // Fix spacing around punctuation (supports Unicode punctuation)
            .replace(/\s+([,.;:!?¿¡。，、；：！？])/g, '$1')
            .replace(/([,.;:!?¿¡。，、；：！？])([A-Za-zÀ-ÿ\u0100-\u017F\u0180-\u024F\u4e00-\u9fff])/g, '$1 $2')
            
            // Fix spacing around parentheses and brackets (Unicode variants)
            .replace(/\s+([)\]】〉》」』）])/g, '$1')
            .replace(/([(\[【〈《「『（])\s+/g, '$1')
            
            // Fix paragraph spacing
            .replace(/\n\s*\n\s*\n+/g, '\n\n')
            
            // Fix list formatting (enhanced for international lists)
            .replace(/^\s*(\d+[.)]\s*|\-\s*|\*\s*|[•·]\s*)/gm, '$1')
            
            // Fix chapter/section headings (supports accented characters)
            .replace(/^([A-ZÀ-ÿ\u0100-\u017F][A-ZÀ-ÿ\u0100-\u017F\s]+)$/gm, '\n$1\n')
            
            // Remove excessive whitespace
            .replace(/[ \t]+/g, ' ')
            .trim();
    }

    /**
     * Advanced text formatting with comprehensive options
     */
    formatText(text: string, options: TextProcessingOptions & FootnoteProcessingOptions = {}): string {
        let processedText = text;

        // Step 1: Join paragraphs
        processedText = this.reorganizeContent(processedText, options);

        // Step 2: Process footnotes
        processedText = this.processFootnotes(processedText, options);

        // Step 3: Align text
        processedText = this.alignText(processedText);

        return processedText;
    }

    /**
     * Generate processing log with detailed information
     */
    generateProcessingLog(step: string, startTime: Date, endTime: Date, details?: string): string {
        const duration = endTime.getTime() - startTime.getTime();
        const timestamp = endTime.toISOString().replace('T', ' ').substring(0, 19);
        const durationStr = duration < 1000 ? `${duration}ms` : `${Math.floor(duration / 1000)}s`;
        
        return `[${timestamp}] ${step} completed${details ? ': ' + details : ''} (${durationStr})`;
    }
}

// Export singleton instance
export const textProcessor = new TextProcessor();

// Export default for CommonJS compatibility
export default textProcessor;
