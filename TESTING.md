# 🧪 Guia de Teste - Ativvo

## Preparação

### 1. Certifique-se de que o backend está rodando

```powershell
cd ativvo-backend
$env:Path += ";C:\Program Files\Go\bin"
go run main.go
```

Você deve ver:
```
✅ Configuration loaded
✅ Connected to PostgreSQL (Supabase)
✅ Database migration completed
🚀 Server starting on port 8080
```

### 2. Inicie o frontend

Em outro terminal:

```powershell
cd ativvo-frontend
pnpm dev
```

Acesse: http://localhost:3000

---

## 🎯 Fluxo de Teste Completo

### 1. **Landing Page** (`/`)
- ✅ Veja as animações das formas flutuantes
- ✅ Clique em "Entrar"
- ✅ Deve redirecionar para `/sign-in` com animação

### 2. **Registro** (`/sign-up`)
- ✅ Clique em "Cadastre-se"
- ✅ Deve ir para a página de registro

#### **Etapa 1 - Dados Básicos:**
- Nome: `Seu Nome`
- Email: `seu@email.com`
- Senha: `senha123` (mínimo 6 caracteres)
- Clique em **Continuar**

#### **Etapa 2 - Dados Físicos:**
- Gênero: Masculino/Feminino/Outro
- Altura: `180` cm
- Peso: `75` kg
- Gordura corporal: `15` %
- Clique em **Continuar**

#### **Etapa 3 - Objetivos:**
- Treinos por semana: `5`
- Tempo de cardio: `30` min
- Objetivo: Ganhar massa muscular
- Clique em **Finalizar**

✅ **Resultado esperado:**
- Ver "Criando conta..." no botão
- Redirecionamento para `/dashboard` com animação
- Usuário criado no banco de dados

### 3. **Login** (`/sign-in`)
- Volte para `/sign-in` (ou faça logout)
- Email: Use o mesmo email do registro
- Senha: Use a mesma senha do registro
- Clique em **Entrar**

✅ **Resultado esperado:**
- Ver "Entrando..." no botão
- Redirecionamento para `/dashboard` com animação
- Token JWT salvo no localStorage

### 4. **Verificar dados salvos**

Abra o DevTools (F12) e vá em:
- **Application > Local Storage > http://localhost:3000**

Você deve ver:
- `ativvo_token`: Token JWT
- `ativvo_user`: Objeto JSON com seus dados

---

## 🔍 Verificar no Backend

### No Supabase:
1. Acesse https://supabase.com
2. Vá em **Table Editor**
3. Selecione a tabela `users`
4. Veja seu usuário criado com UUID!

### Via Terminal:
Carregue o script de testes:
```powershell
cd ativvo-backend
. .\test-api.ps1
Login-User -Email "seu@email.com" -Password "senha123"
Get-MyProfile
```

---

## 🐛 Troubleshooting

### Erro: "Failed to fetch"
- ✅ Certifique-se de que o backend está rodando
- ✅ Verifique se a URL está correta em `.env.local`
- ✅ Verifique CORS no backend

### Erro: "Invalid credentials"
- ✅ Verifique se o email/senha estão corretos
- ✅ Tente registrar um novo usuário

### Erro: "Email already exists"
- ✅ Esse email já foi usado
- ✅ Use outro email ou faça login

### Backend não inicia:
- ✅ Verifique se Go está instalado: `go version`
- ✅ Verifique se o `.env` tem a `DATABASE_URL` correta
- ✅ Verifique conexão com Supabase

### Frontend não carrega:
- ✅ Rode `pnpm install` novamente
- ✅ Limpe o cache: Delete `.next/` e rode `pnpm dev` novamente
- ✅ Verifique erros no terminal

---

## ✅ Checklist de Funcionalidades

- [ ] Landing page carrega com animações
- [ ] Navegação entre páginas funciona
- [ ] Registro de usuário funciona (3 etapas)
- [ ] Login funciona
- [ ] Token JWT é salvo no localStorage
- [ ] Dados do usuário são salvos
- [ ] Redirecionamento para dashboard funciona
- [ ] Mensagens de erro aparecem quando necessário
- [ ] Loading states funcionam
- [ ] Animações de transição funcionam

---

## 🎉 Próximo Passo

Após todos os testes passarem, você pode commitar:

```bash
cd ativvo-frontend
git add .
git commit -m "feat: integração frontend com backend - auth completa"
git push
```

**Tudo funcionando?** Agora podemos implementar o dashboard! 🚀
