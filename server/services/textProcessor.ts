export class TextProcessor {
  processFootnotes(text: string): string {
    // Extract footnotes and move them to the end
    const footnotePattern = /\[\d+\]\s*([^[\n]*(?:\n(?![[\d+\]])[^\n]*)*)/g;
    const footnotes: string[] = [];
    let footnoteIndex = 1;
    
    // Extract footnotes
    let processedText = text.replace(footnotePattern, (match, content) => {
      footnotes.push(`[${footnoteIndex}] ${content.trim()}`);
      return `[${footnoteIndex++}]`;
    });

    // Add footnotes section at the end if any were found
    if (footnotes.length > 0) {
      processedText += '\n\n--- FOOTNOTES ---\n\n' + footnotes.join('\n\n');
    }

    return processedText;
  }

  alignText(text: string): string {
    return text
      // Fix spacing around punctuation
      .replace(/\s+([,.;:!?])/g, '$1')
      .replace(/([,.;:!?])([A-Za-z])/g, '$1 $2')
      // Fix spacing around parentheses and brackets
      .replace(/\s+([)\]])/g, '$1')
      .replace(/([(\[])\s+/g, '$1')
      // Fix paragraph spacing
      .replace(/\n\s*\n\s*\n+/g, '\n\n')
      // Fix list formatting
      .replace(/^\s*(\d+\.|\-|\*)\s*/gm, '$1 ')
      // Fix chapter/section headings
      .replace(/^([A-Z][A-Z\s]+)$/gm, '\n$1\n')
      .trim();
  }

  formatArticles(text: string): string {
    // Detect and format article/section headers
    return text.replace(
      /^(ARTICLE\s+[IVXLC]+.*?|SECTION\s+\d+.*?|CHAPTER\s+\d+.*?)$/gim,
      '\n$1\n'
    );
  }

  reorganizeContent(text: string): string {
    // Process footnotes first
    let processed = this.processFootnotes(text);
    
    // Align text formatting
    processed = this.alignText(processed);
    
    // Format articles and sections
    processed = this.formatArticles(processed);
    
    return processed;
  }

  generateProcessingLog(step: string, startTime: Date, endTime: Date, details?: string): string {
    const duration = endTime.getTime() - startTime.getTime();
    const timestamp = endTime.toISOString().replace('T', ' ').substring(0, 19);
    const durationStr = `${Math.floor(duration / 1000)}ms`;
    
    return `[${timestamp}] ${step} completed${details ? ': ' + details : ''} (${durationStr})`;
  }
}

export const textProcessor = new TextProcessor();
