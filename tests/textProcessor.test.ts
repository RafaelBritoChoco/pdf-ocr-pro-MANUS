// FILE: tests/textProcessor.test.ts

import { joinParagraphs, TextProcessor } from '../server/services/textProcessor';

const textProcessor = new TextProcessor();

describe('joinParagraphs', () => {
  it('junta parágrafos corretamente', () => {
    const input = 'Linha 1\nLinha 2\n\nCHAPTER 1\nTexto.';
    const expected = 'Linha 1 Linha 2\n\nCHAPTER 1\n\nTexto.';
    expect(joinParagraphs(input)).toBe(expected);
  });

  it('lida com texto vazio', () => {
    expect(joinParagraphs('')).toBe('');
  });

  it('detecta elementos estruturais em português', () => {
    const input = 'Texto normal\n\nCAPÍTULO I\nMais texto';
    const result = joinParagraphs(input);
    expect(result).toContain('CAPÍTULO I');
  });

  it('preserva listas numeradas', () => {
    const input = 'Texto\n\n1. Item um\n2. Item dois';
    const result = joinParagraphs(input);
    expect(result).toContain('1. Item um');
  });
});

describe('TextProcessor methods', () => {
  it('processa texto completo com reorganizeContent', () => {
    const input = 'Linha 1\nLinha 2\n\nCAPÍTULO I\nMais texto';
    const output = textProcessor.reorganizeContent(input);
    expect(output).toContain('CAPÍTULO I');
  });

  it('alinha texto corretamente', () => {
    const input = 'Texto com    espaços   excessivos.';
    const output = textProcessor.alignText(input);
    expect(output).toBe('Texto com espaços excessivos.');
  });

  it('lida com caracteres especiais', () => {
    const input = 'Texto com acentos: ção, ãe, ú.';
    const output = textProcessor.reorganizeContent(input);
    expect(output).toContain('ção');
  });
});

describe('TextProcessor footnotes', () => {
  it('processa footnotes com reorganizeContent', () => {
    const input = 'Texto [1] com nota.\n[1] Conteúdo da nota.';
    const output = textProcessor.reorganizeContent(input);
    expect(output).toContain('Texto');
    expect(output).toContain('Conteúdo da nota');
  });

  it('preserva estrutura do texto', () => {
    const input = 'Texto [1] com nota.\n[1] Conteúdo da nota.';
    const output = textProcessor.reorganizeContent(input);
    expect(output.length).toBeGreaterThan(10);
  });
});

// Para rodar os testes: npm test
