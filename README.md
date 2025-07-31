# PDF OCR Pro - MANUS

Sistema avançado de processamento de PDFs com OCR e melhorias de formatação de texto.

## ⚡ **INÍCIO RÁPIDO - 3 COMANDOS**

```powershell
# 1. Instalar
npm install

# 2. Frontend (Terminal 1)
npx vite

# 3. Backend (Terminal 2) 
npm run dev:server

# 🌐 Acessar: http://localhost:5173
```

> 📖 **Instruções ainda mais detalhadas:** Veja o arquivo `INICIO-RAPIDO.md`

---

## 🌐 **APLICAÇÃO EM PRODUÇÃO**
**🚀 Acesse online**: https://spiffy-pastelito-c7db3d.netlify.app

### Deploy Informações
- **Plataforma**: Netlify
- **Status**: ✅ Online e funcionando
- **Build**: Frontend otimizado (348.92 kB JS + 60.05 kB CSS)
- **Última atualização**: 31 de Janeiro de 2025

## 🚀 Funcionalidades Implementadas

### ✅ Melhorias Recentes (2025-01-31)
- **🌐 DEPLOY EM PRODUÇÃO** no Netlify (https://spiffy-pastelito-c7db3d.netlify.app)
- **CORS configurado** para requisições cross-origin
- **PDF.js Legacy Build** configurado para compatibilidade com Node.js
- **TextProcessor Avançado** com suporte multilíngue (português, inglês, espanhol, francês)
- **Sistema de Testes** completo com Jest e TypeScript
- **Configuração TypeScript** otimizada com tsconfig separados
- **Scripts npm melhorados** com cross-env para compatibilidade Windows
- **Build configurado** para produção com Vite + esbuild

### 🔧 Sistema de Processamento de Texto
- **joinParagraphs()**: Reorganiza parágrafos respeitando elementos estruturais
- **processFootnotes()**: Extrai e reorganiza notas de rodapé
- **alignText()**: Corrige espaçamentos e formatação
- **Suporte Multilíngue**: Detecta CAPÍTULO, CHAPTER, CHAPITRE, etc.

### 📊 Infraestrutura
- **Backend**: Express + TypeScript + PDF.js + Tesseract.js
- **Frontend**: React + Vite + Tailwind CSS
- **Testes**: Jest com 14/18 testes passando
- **Build**: esbuild para produção

## � **GUIA COMPLETO DE INSTALAÇÃO E DEPLOY**

### 📋 **Pré-requisitos**
Antes de começar, certifique-se de ter instalado:
- **Node.js** (versão 18 ou superior) - [Download aqui](https://nodejs.org/)
- **Git** - [Download aqui](https://git-scm.com/)
- **Conta no Netlify** (para deploy) - [Criar conta](https://netlify.com/)

### 🖥️ **1. EXECUÇÃO LOCAL (Desenvolvimento) - MÉTODO SIMPLES**

#### ⚡ **INICIALIZAÇÃO RÁPIDA** (3 comandos apenas):

```powershell
# 1. Instalar dependências
npm install

# 2. Abrir DOIS terminais e executar:
# Terminal 1 - Frontend (Vite):
npx vite

# Terminal 2 - Backend (Express):
npm run dev:server
```

#### 🌐 **Acessar:**
- **Aplicação**: http://localhost:5173 
- **API**: http://localhost:3000

#### ⚠️ **IMPORTANTE - Se der erro de porta ocupada:**
```powershell
# Verificar processo na porta 3000:
netstat -ano | findstr :3000

# Matar processo (substitua PID pelo número mostrado):
taskkill /PID [NÚMERO_DO_PID] /F

# Depois rodar novamente os comandos acima
```

---

### 🔧 **MÉTODO ALTERNATIVO (se o acima não funcionar):**

#### Passo 1: Clone o repositório
```bash
git clone https://github.com/RafaelBritoChoco/pdf-ocr-pro-MANUS.git
cd pdf-ocr-pro-MANUS
```

#### Passo 2: Instalar dependências
```bash
npm install
```

#### Passo 3: Executar o projeto
```bash
# ❌ EVITE: npm run dev:both (pode dar conflito de porta)

# ✅ USE ESTE MÉTODO:
# Terminal 1:
npx vite

# Terminal 2: 
npm run dev:server
```

#### Passo 4: Acessar a aplicação
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:3000
- **Aplicação completa**: Use a URL do frontend

#### 🔧 **Comandos Úteis de Desenvolvimento**
```bash
# Rodar apenas testes
npm test

# Verificar TypeScript
npm run check

# Build de produção (se necessário)
npm run build:client

# ⚠️ Se houver problemas com porta ocupada:
# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F

# ⚠️ Se houver erro "exec is not defined" - JÁ CORRIGIDO:
# Foi removida a importação problemática do PDF.js no pdfProcessor.ts
```

### 🌐 **2. DEPLOY EM PRODUÇÃO (Netlify)**

#### **Método 1: Deploy Automático via GitHub (Recomendado)**
1. **Fork o repositório** no GitHub
2. **Conecte o Netlify ao GitHub**:
   - Acesse [Netlify](https://app.netlify.com/)
   - Clique em "New site from Git"
   - Selecione GitHub e autorize
   - Escolha o repositório `pdf-ocr-pro-MANUS`

3. **Configurações do Build**:
   ```
   Build command: npm run build:client
   Publish directory: dist/public
   Node version: 18
   ```

4. **Deploy automático**: Qualquer push na branch `main` fará deploy automaticamente

#### **Método 2: Deploy Manual via CLI**
```bash
# 1. Fazer build de produção
npm run build:client

# 2. Instalar Netlify CLI (se não tiver)
npm install -g netlify-cli

# 3. Login no Netlify
netlify login

# 4. Deploy
netlify deploy --prod --dir=dist/public
```

#### **Método 3: Deploy via Interface Web**
1. Execute `npm run build:client`
2. Acesse [Netlify](https://app.netlify.com/)
3. Arraste a pasta `dist/public` para a área de deploy

### ⚙️ **3. CONFIGURAÇÕES IMPORTANTES**

#### **Variáveis de Ambiente** (se necessário)
Crie um arquivo `.env` na raiz:
```env
NODE_ENV=development
PORT=3000
```

#### **Arquivos de Configuração Principais**
- `netlify.toml` - Configurações de deploy
- `tsconfig.json` - TypeScript config
- `vite.config.ts` - Build config do frontend
- `package.json` - Scripts e dependências

### 🐛 **4. SOLUÇÃO DE PROBLEMAS COMUNS**

#### **❌ Erro: "address already in use" (Porta 3000 ocupada)**
```powershell
# 1. Verificar qual processo está usando:
netstat -ano | findstr :3000

# 2. Matar o processo:
taskkill /PID [NÚMERO_DO_PID] /F

# 3. Rodar novamente:
npx vite  # Terminal 1
npm run dev:server  # Terminal 2
```

#### **❌ Erro: "exec is not defined" - JÁ CORRIGIDO**
- ✅ **Solucionado**: Importação problemática do PDF.js foi removida do `pdfProcessor.ts`

#### **❌ Erro: "Cannot find module"**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### **❌ Erro de build do frontend**
```bash
# Build apenas do frontend
npm run build:client
```

#### **❌ Erro: npm run dev:both não funciona**
```bash
# ❌ EVITE: npm run dev:both (pode causar conflito)
# ✅ USE: Dois terminais separados
# Terminal 1: npx vite
# Terminal 2: npm run dev:server
```

### 📊 **5. VERIFICAÇÃO DE FUNCIONAMENTO**

#### **✅ Checklist Rápido para Testes**
```powershell
# 1. Instalar dependências
npm install

# 2. Abrir dois terminais:
# Terminal 1:
npx vite
# ➜ Deve mostrar: Local: http://localhost:5173/

# Terminal 2:
npm run dev:server  
# ➜ Deve mostrar: [express] serving on port 3000

# 3. Acessar: http://localhost:5173
# ➜ Interface do PDF OCR deve carregar
```

#### **✅ Checklist Completo**
- [ ] `npm install` executado sem erros
- [ ] `npx vite` inicia frontend na porta 5173
- [ ] `npm run dev:server` inicia backend na porta 3000
- [ ] Frontend acessível em http://localhost:5173
- [ ] Upload de PDF funciona
- [ ] Testes passam: `npm test`

#### **✅ URLs de Acesso**
- **Desenvolvimento**: http://localhost:5173
- **Produção**: https://spiffy-pastelito-c7db3d.netlify.app
- [ ] Deploy no Netlify sem erros
- [ ] Aplicação acessível na URL do Netlify
- [ ] Upload de PDF funciona em produção

### 🎯 **6. URLS IMPORTANTES**

| Ambiente | URL | Observações |
|----------|-----|-------------|
| **🌐 Produção** | https://spiffy-pastelito-c7db3d.netlify.app | Aplicação live |
| **🖥️ Local Frontend** | http://localhost:5173 | Vite dev server |
| **🖥️ Local Backend** | http://localhost:3000 | Express API |
| **📊 Admin Netlify** | https://app.netlify.com/projects/spiffy-pastelito-c7db3d | Configurações |
| **📁 Repositório** | https://github.com/RafaelBritoChoco/pdf-ocr-pro-MANUS | Código fonte |

## 📁 Estrutura do Projeto

```
├── server/                  # Backend Express
│   ├── services/
│   │   ├── textProcessor.ts # 🔥 Processamento avançado de texto
│   │   ├── pdfProcessor.ts  # Extração de PDF com OCR
│   │   └── geminiService.ts # IA para melhorias
│   ├── routes.ts           # API endpoints
│   └── index.ts           # Servidor principal
├── client/                 # Frontend React
├── shared/                 # Tipos compartilhados
├── tests/                  # Testes Jest
└── .vscode/               # Configuração VS Code
```

## 🐛 Issues Conhecidos (Precisam ser Corrigidos)

### ❌ Testes Falhando (4/18)
1. **joinParagraphs** - Problema com quebras de linha após elementos estruturais
2. **Testes Multilíngues** - "CAPÍTULO I" não está sendo separado corretamente
3. **formatText** - Integração entre funções não preserva quebras
4. **PDF Text Sample** - Teste de integração completa falhando

**Causa**: O algoritmo `joinParagraphs` está juntando headings com texto seguinte sem `\n\n` adequado.

### ⚠️ PDF.js Loop Error
- **Problema**: "em loop com erro" no processamento de PDF
- **Causa Provável**: Import incorreto do worker legacy
- **Localização**: `server/services/pdfProcessor.ts`

### 🔧 Melhorias Pendentes
- [ ] **Finalizar correção dos testes de quebra de linha**
- [ ] **Resolver loop error do PDF.js**
- [ ] **Implementar cache de processamento**
- [ ] **Adicionar suporte a mais formatos de export**
- [ ] **Otimizar performance para PDFs grandes**

## 🚦 Status dos Sistemas

| Sistema | Status | Observações |
|---------|--------|-------------|
| **🌐 Aplicação em Produção** | ✅ **ONLINE** | https://spiffy-pastelito-c7db3d.netlify.app |
| **Servidor Backend** | ✅ Funcionando | Porta 3000, CORS ok |
| **Frontend React** | ✅ Funcionando | Vite dev server |
| **Upload de PDF** | ✅ Funcionando | Até 50MB |
| **OCR Tesseract** | ✅ Funcionando | Extração de texto |
| **TextProcessor** | ⚠️ Parcial | 14/18 testes passando |
| **PDF.js Legacy** | ⚠️ Problemas | Loop error intermitente |
| **Testes Jest** | ⚠️ Parcial | 4 testes falhando |
| **Deploy Netlify** | ✅ **LIVE** | Build automático configurado |

## ⚡ **INÍCIO RÁPIDO (TL;DR)**

### Para desenvolvedores experientes:
```bash
# 1. Clone e instale
git clone https://github.com/RafaelBritoChoco/pdf-ocr-pro-MANUS.git
cd pdf-ocr-pro-MANUS && npm install

# 2. Execute local
npm run dev:both

# 3. Acesse: http://localhost:5173

# 4. Deploy
npm run build:client
netlify deploy --prod --dir=dist/public
```

### Para usuários finais:
- **Use diretamente**: https://spiffy-pastelito-c7db3d.netlify.app
- Faça upload de um PDF e processe com OCR

## 🔄 Próximos Passos

1. **Corrigir algoritmo joinParagraphs** - Resolver problema de quebras de linha
2. **Debugar PDF.js worker** - Eliminar loop error
3. **Completar cobertura de testes** - 100% dos testes passando
4. **✅ Deploy em produção** - ~~Configurar para Replit/Vercel~~ **CONCLUÍDO: Netlify**
5. **Documentação completa** - API endpoints e arquitetura

## 📈 Melhorias Implementadas Hoje

- ✅ **🚀 DEPLOY EM PRODUÇÃO NO NETLIFY** (https://spiffy-pastelito-c7db3d.netlify.app)
- ✅ Configuração completa do ambiente de desenvolvimento
- ✅ CORS e compatibilidade cross-origin
- ✅ TypeScript otimizado com tsconfig.server.json
- ✅ Sistema de testes Jest configurado
- ✅ TextProcessor avançado com suporte multilíngue
- ✅ Scripts npm melhorados para Windows
- ✅ PDF.js legacy build configurado
- ✅ Servidor rodando estável na porta 3000
- ✅ **Build de produção configurado** (348.92 kB otimizado)
- ✅ **Correção de erros de TypeScript** no arquivo testTesseract.ts

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Rode os testes: `npm test`
4. Commit suas mudanças
5. Abra um Pull Request

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

**🌐 Aplicação em Produção**: https://spiffy-pastelito-c7db3d.netlify.app  
**🖥️ Servidor local**: http://localhost:3000  
**📊 Admin Netlify**: https://app.netlify.com/projects/spiffy-pastelito-c7db3d  
**📁 Repositório**: https://github.com/RafaelBritoChoco/pdf-ocr-pro-MANUS  
**📅 Última atualização**: 31 de Janeiro de 2025  
**🚦 Status**: ✅ **EM PRODUÇÃO** | 🚧 Desenvolvimento ativo
