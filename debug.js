// debug.js - Simulação do joinParagraphs com logs para debug

function joinParagraphs(rawText) {
  if (!rawText) return '';

  const lines = rawText.replace(/\r\n/g, '\n').split('\n');
  if (lines.length === 0) return '';

  let result = '';
  let buffer = [];
  let lastWasStructural = false;  // Nova flag para rastrear se o último adicionado foi heading

  console.log('Input lines:', lines);  // Log inicial

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    console.log(`\nProcessando linha ${i + 1}: "${trimmedLine}" (original: "${line}")`);

    if (trimmedLine === '') {
      if (buffer.length > 0) {
        const paragraph = buffer.join(' ');
        result += (result ? '\n\n' : '') + paragraph;
        console.log('  - Linha vazia: Finalizando parágrafo ->', paragraph);
        console.log('  - Result atual:', JSON.stringify(result));
        buffer = [];
      }
      lastWasStructural = false;  // Reset após vazia
      console.log('  - lastWasStructural resetado para false');
      continue;
    }

    const isStructural = /^(CHAPTER|ARTICLE|SECTION|ANNEX|APPENDIX|PREAMBLE|PART|CAPÍTULO|ARTIGO|SEÇÃO|ANEXO|APÊNDICE|PREÂMBULO|PARTE)\s/i.test(trimmedLine) || /^\s*(\d+\.|\([a-z]\)|\([ivx]+\))/i.test(trimmedLine);
    console.log('  - É estrutural?', isStructural);
    console.log('  - lastWasStructural:', lastWasStructural);

    if (isStructural) {
      if (buffer.length > 0) {
        const paragraph = buffer.join(' ');
        result += (result ? '\n\n' : '') + paragraph;
        console.log('  - Estrutural: Finalizando buffer anterior ->', paragraph);
        buffer = [];
      }
      // Adiciona heading como standalone e força \n\n
      result += (result ? '\n\n' : '') + trimmedLine;
      console.log('  - Adicionando heading diretamente ao result:', JSON.stringify(result));
      lastWasStructural = true;
      console.log('  - lastWasStructural definido como true');
      continue;  // Não adiciona ao buffer; heading é finalizado imediatamente
    } else {
      // Se último foi heading e agora é texto normal, inicia novo buffer com separação implícita
      if (lastWasStructural) {
        buffer = [trimmedLine];
        console.log('  - Texto após heading: Iniciando novo buffer ->', buffer);
        lastWasStructural = false;
      } else {
        buffer.push(trimmedLine);
        console.log('  - Adicionando ao buffer existente:', buffer);
      }
    }
  }

  if (buffer.length > 0) {
    const finalParagraph = buffer.join(' ');
    result += (result ? '\n\n' : '') + finalParagraph;
    console.log('\nFinalizando último buffer ->', finalParagraph);
  }
  
  console.log('\nResult final:', JSON.stringify(result));
  return result;
}

// Teste com o input problemático
const testInput = 'Linha 1\nLinha 2\n\nCHAPTER 1\nTexto.';
console.log('\n=== DEBUG EXECUÇÃO ===');
const output = joinParagraphs(testInput);
console.log('\nOutput final:', JSON.stringify(output));
console.log('Esperado:    ', JSON.stringify('Linha 1 Linha 2\n\nCHAPTER 1\n\nTexto.'));
console.log('Match?', output === 'Linha 1 Linha 2\n\nCHAPTER 1\n\nTexto.');
