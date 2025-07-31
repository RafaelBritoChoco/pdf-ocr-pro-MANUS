# PDF OCR Pro - Manual de Desenvolvimento Local

## Configuração Inicial

1. **Instalar dependências:**
   ```bash
   npm install
   cd client && npm install
   cd ..
   ```

2. **Rodar apenas o servidor backend:**
   ```bash
   npm run dev:server
   ```
   - Servidor estará disponível em http://localhost:3000

3. **Rodar apenas o cliente frontend:**
   ```bash
   npm run dev:client
   ```
   - Cliente estará disponível em http://localhost:5173

4. **Rodar ambos simultaneamente (recomendado):**
   ```bash
   npm run dev:both
   ```

## Estrutura do Projeto

- `server/` - Backend Express/Node.js
- `client/` - Frontend React/Vite
- `shared/` - Tipos e esquemas compartilhados

## Funcionalidades Implementadas

### ✅ Função joinParagraphs
- Localizada em `server/services/textProcessor.ts`
- Reformata parágrafos de PDFs respeitando elementos estruturais
- Integrada no pipeline de processamento

### ✅ Sistema de Upload
- Upload de PDFs até 50MB
- Processamento assíncrono
- Status em tempo real

## Para Deploy

1. **Build para produção:**
   ```bash
   npm run build
   ```

2. **Iniciar em produção:**
   ```bash
   npm start
   ```

## Testando Localmente

1. Acesse http://localhost:5173 (frontend)
2. Faça upload de um PDF
3. Verifique se os parágrafos estão sendo formatados corretamente
4. Use o PDF de exemplo disponível no próprio site

## Logs e Debug

- Logs do servidor aparecem no terminal onde rodou `npm run dev:server`
- Erros de processamento são logados no console
- Status de processamento disponível na interface

## Próximos Passos

- [ ] Implementar processamento de notas de rodapé (Missão 2)
- [ ] Melhorar formatação de listas e estruturas
- [ ] Adicionar mais formatos de export
- [ ] Otimizar performance para PDFs grandes
