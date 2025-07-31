// FILE: server/services/textProcessor.ts

/**
 * Joins lines of text into correctly formatted paragraphs, respecting structural elements.
 * @param rawText The raw text extracted from the PDF, with its original line breaks.
 * @returns A string with paragraphs correctly joined.
 */
export function joinParagraphs(rawText: string): string {
  if (typeof rawText !== 'string' || !rawText.trim()) return '';  // Validação de entrada

  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  let result = '';
  let buffer: string[] = [];
  let lastWasStructural = false;  // Nova flag para rastrear se o último adicionado foi heading

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine === '') {
      if (buffer.length > 0) {
        result += (result ? '\n\n' : '') + buffer.join(' ');
        buffer = [];
      }
      lastWasStructural = false;  // Reset após vazia
      continue;
    }

    // Heurística melhorada: Detecta headings ou listas com suporte a multi-idiomas e maiúsculas
    const isStructural = /^(CHAPTER|ARTICLE|SECTION|ANNEX|APPENDIX|PREAMBLE|PART|CAPÍTULO|ARTIGO|SEÇÃO|ANEXO|APÊNDICE|PREÂMBULO|PARTE)\s/i.test(trimmedLine) ||
                         /^\s*(\d+\.|\([a-zA-Z]\)|\([ivxIVX]+\))/i.test(trimmedLine) ||
                         (trimmedLine === trimmedLine.toUpperCase() && trimmedLine.length < 50);  // Detecção por maiúsculas e comprimento curto

    if (isStructural) {
      if (buffer.length > 0) {
        result += (result ? '\n\n' : '') + buffer.join(' ');
        buffer = [];
      }
      // Adiciona heading como standalone e força \n\n
      result += (result ? '\n\n' : '') + trimmedLine;
      lastWasStructural = true;
      continue;  // Não adiciona ao buffer; heading é finalizado imediatamente
    } else {
      // Se último foi heading e agora é texto normal, inicia novo buffer com separação implícita
      if (lastWasStructural) {
        buffer = [trimmedLine];
        lastWasStructural = false;
      } else {
        buffer.push(trimmedLine);
      }
    }
  }

  if (buffer.length > 0) {
    result += (result ? '\n\n' : '') + buffer.join(' ');
  }

  return result.trim();
}

export class TextProcessor {
  reorganizeContent(text: string): string {
    // Usar nossa nova função de joinParagraphs para reformatar o texto
    return joinParagraphs(text);
  }
  
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

  // Método para encadear tudo (usado em testes de integração)
  processFullText(text: string): string {
    let processed = this.reorganizeContent(text);
    processed = this.processFootnotes(processed);
    processed = this.alignText(processed);
    return processed;
  }

  // Alias para processFullText (compatibilidade com testes)
  formatText(text: string): string {
    return this.processFullText(text);
  }

  formatArticles(text: string): string {
    // Detect and format article/section headers
    return text.replace(
      /^(ARTICLE\s+[IVXLC]+.*?|SECTION\s+\d+.*?|CHAPTER\s+\d+.*?)$/gim,
      '\n$1\n'
    );
  }

  generateProcessingLog(step: string, startTime: Date, endTime: Date, details?: string): string {
    const duration = endTime.getTime() - startTime.getTime();
    const timestamp = endTime.toISOString().replace('T', ' ').substring(0, 19);
    const durationStr = `${Math.floor(duration / 1000)}ms`;
    
    return `[${timestamp}] ${step} completed${details ? ': ' + details : ''} (${durationStr})`;
  }
}

export const textProcessor = new TextProcessor();
