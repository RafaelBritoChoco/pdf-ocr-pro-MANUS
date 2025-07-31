import { textProcessor } from '../services/textProcessor';

// Test cases for the improved textProcessor
describe('TextProcessor Tests', () => {
  
  describe('joinParagraphs', () => {
    test('should handle multilingual structural elements', () => {
      const input = `CAPÍTULO I
Este é um parágrafo em português
que deve ser unido.

CHAPTER II
This is an English paragraph
that should be joined.`;
      
      const result = textProcessor.reorganizeContent(input);
      expect(result).toContain('CAPÍTULO I\nEste é um parágrafo em português que deve ser unido.');
    });

    test('should preserve structural elements', () => {
      const input = `1. First item
This continues the first item.

2. Second item
This continues the second item.`;
      
      const result = textProcessor.reorganizeContent(input);
      expect(result).toContain('1. First item This continues the first item.');
    });

    test('should handle Unicode line separators', () => {
      const input = 'Line 1\u2028Line 2\u2029Line 3';
      const result = textProcessor.reorganizeContent(input);
      expect(result).toBe('Line 1 Line 2 Line 3');
    });
  });

  describe('processFootnotes', () => {
    test('should extract and move footnotes', () => {
      const input = 'Text with footnote[1] Some footnote content here.';
      const result = textProcessor.processFootnotes(input);
      expect(result).toContain('--- FOOTNOTES ---');
      expect(result).toContain('[1] Some footnote content here.');
    });

    test('should handle multiple footnote formats', () => {
      const input = 'Text with [1] footnote and (2) another footnote.';
      const result = textProcessor.processFootnotes(input);
      expect(result).toContain('--- FOOTNOTES ---');
    });
  });

  describe('alignText', () => {
    test('should fix spacing around punctuation', () => {
      const input = 'Text ,with bad spacing . More text!Bad spacing.';
      const result = textProcessor.alignText(input);
      expect(result).toBe('Text, with bad spacing. More text! Bad spacing.');
    });

    test('should handle Unicode punctuation', () => {
      const input = 'Texto em português ,com espaçamento ruim . Más texto!';
      const result = textProcessor.alignText(input);
      expect(result).toBe('Texto em português, com espaçamento ruim. Más texto!');
    });
  });

  describe('formatText', () => {
    test('should apply all processing steps', () => {
      const input = `CHAPTER 1
This is a paragraph
that should be joined.

Text with footnote[1] Some footnote content.

Bad spacing , and punctuation .`;
      
      const result = textProcessor.formatText(input);
      expect(result).toContain('CHAPTER 1\nThis is a paragraph that should be joined.');
      expect(result).toContain('--- FOOTNOTES ---');
      expect(result).toContain('Bad spacing, and punctuation.');
    });
  });
});

// Integration test example
describe('Integration Tests', () => {
  test('should process a complete PDF text sample', () => {
    const samplePdfText = `
ACORDO DE LIVRE COMÉRCIO
ENTRE O PAQUISTÃO E O SRI LANKA

CAPÍTULO 1
Disposições Gerais

Artigo 1
Objetivos

Este Acordo tem os seguintes
objetivos principais:

a) Promover o comércio bilateral;
b) Facilitar o investimento[1] Conforme definido no Artigo 15.

CAPÍTULO 2
Comércio de Mercadorias
`;

    const result = textProcessor.formatText(samplePdfText);
    
    // Verify structure is preserved
    expect(result).toContain('ACORDO DE LIVRE COMÉRCIO ENTRE O PAQUISTÃO E O SRI LANKA');
    expect(result).toContain('CAPÍTULO 1\nDisposições Gerais');
    
    // Verify paragraphs are joined
    expect(result).toContain('Este Acordo tem os seguintes objetivos principais:');
    
    // Verify footnotes are processed
    expect(result).toContain('--- FOOTNOTES ---');
    expect(result).toContain('[1] Conforme definido no Artigo 15.');
  });
});
