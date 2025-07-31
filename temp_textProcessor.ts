/**
 * Joins lines of text into correctly formatted paragraphs, respecting structural elements.
 * @param rawText The raw text extracted from the PDF, with its original line breaks.
 * @returns A string with paragraphs correctly joined.
 */
export function joinParagraphs(rawText: string): string {
    if (!rawText) return '';

    const lines = rawText.replace(/\r\n/g, '\n').split('\n');
    if (lines.length === 0) return '';

    let result = '';
    let buffer: string[] = [];

    for (const line of lines) {
        const trimmedLine = line.trim();

        // Heuristic: A line is a "structural element" if it starts with a common legal heading,
        // is a list item, or is very short (likely a standalone title).
        const isStructural = /^(CHAPTER|ARTICLE|SECTION|ANNEX|APPENDIX|PREAMBLE|PART\s)/i.test(trimmedLine) || /^\s*(\d+\.|\([a-z]\)|\([ivx]+\))/i.test(trimmedLine);
        
        if (trimmedLine === '') {
            // A blank line always signals the end of the previous paragraph.
            if (buffer.length > 0) {
                result += (result ? '\n\n' : '') + buffer.join(' ');
                buffer = [];
            }
        } else if (isStructural) {
            // A structural element always ends the previous paragraph and starts a new one.
            if (buffer.length > 0) {
                result += (result ? '\n\n' : '') + buffer.join(' ');
            }
            buffer = [trimmedLine];
        } else {
            // It's a regular line of text, add it to the current paragraph buffer.
            buffer.push(trimmedLine);
        }
    }

    // Add the last buffered paragraph to the result.
    if (buffer.length > 0) {
        result += (result ? '\n\n' : '') + buffer.join(' ');
    }

    return result;
}
