# 🚀 INÍCIO RÁPIDO - PDF OCR Pro

## ⚡ **3 COMANDOS PARA RODAR**

### Passo 1: Instalar dependências
```powershell
npm install
```

### Passo 2: Abrir 2 terminais

**Terminal 1 - Frontend:**
```powershell
npx vite
```
✅ Deve mostrar: `Local: http://localhost:5173/`

**Terminal 2 - Backend:**  
```powershell
npm run dev:server
```
✅ Deve mostrar: `[express] serving on port 3000`

### Passo 3: Acessar
🌐 **Abrir navegador em:** http://localhost:5173

---

## 🔧 **Se der erro de porta ocupada:**

```powershell
# Ver qual processo está na porta 3000:
netstat -ano | findstr :3000

# Matar o processo (substitua XXXX pelo PID):
taskkill /PID XXXX /F

# Rodar novamente os comandos do Passo 2
```

---

## ✅ **Pronto para testar!**
- Interface do PDF OCR deve carregar
- Faça upload de um PDF para testar
- Aplicação online: https://spiffy-pastelito-c7db3d.netlify.app
