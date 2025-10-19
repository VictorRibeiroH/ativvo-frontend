# Ativvo Frontend

Frontend da aplicação Ativvo - Sistema de gerenciamento de treinos e fitness.

## 🚀 Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Linguagem tipada
- **Tailwind CSS** - Estilização
- **Framer Motion** - Animações
- **Shadcn/ui** - Componentes UI
- **Sonner** - Notificações toast

## 📁 Estrutura

```
ativvo-frontend/
├── app/
│   ├── (public)/          # Páginas públicas
│   │   ├── home/          # Landing page
│   │   ├── sign-in/       # Login
│   │   └── sign-up/       # Registro
│   ├── dashboard/         # Dashboard (protegido)
│   ├── layout.tsx         # Layout raiz
│   └── globals.css        # Estilos globais
├── components/
│   └── ui/                # Componentes Shadcn
├── services/
│   └── api.ts             # Serviço de comunicação com backend
├── lib/
│   └── utils.ts           # Utilitários
└── public/                # Assets estáticos
```

## ⚙️ Setup

### 1. Instalar dependências

```bash
pnpm install
```

### 2. Configurar variáveis de ambiente

O arquivo `.env.local` já está configurado com:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

**Importante:** Certifique-se de que o backend está rodando na porta 8080!

### 3. Rodar o servidor de desenvolvimento

```bash
pnpm dev
```

O app estará rodando em `http://localhost:3000` 🎉

## 🔗 Integração com Backend

O frontend está integrado com o backend Go através do serviço `services/api.ts`:

### Funções disponíveis:

- `register(email, password, name)` - Criar conta
- `login(email, password)` - Fazer login
- `logout()` - Fazer logout
- `getCurrentUser()` - Pegar usuário atual do localStorage
- `getToken()` - Pegar token JWT
- `isAuthenticated()` - Verificar se está autenticado
- `getMyProfile()` - Buscar perfil (protegido)
- `updateProfile(updates)` - Atualizar perfil (protegido)

### Autenticação:

O sistema usa **JWT (JSON Web Tokens)** para autenticação:

1. Ao fazer login/registro, o token é salvo no `localStorage`
2. O token é enviado automaticamente nas requisições protegidas via header `Authorization: Bearer <token>`
3. Se o token expirar ou for inválido, o usuário é deslogado automaticamente

## 📄 Páginas

### Públicas

- `/` - Landing page com animações
- `/sign-in` - Login
- `/sign-up` - Registro em 3 etapas
  - Etapa 1: Email, senha e nome
  - Etapa 2: Dados físicos (altura, peso, etc)
  - Etapa 3: Objetivos e metas

### Protegidas (requer autenticação)

- `/dashboard` - Dashboard principal

## 🎨 Features

- ✅ Design moderno com glassmorphism
- ✅ Animações suaves com Framer Motion
- ✅ Transições entre páginas
- ✅ Formulários multi-step
- ✅ Validação de formulários
- ✅ Loading states
- ✅ Error handling
- ✅ Responsivo (mobile-first)
- ✅ Dark mode nativo

## 🚧 Próximos passos

- [ ] Proteção de rotas (middleware)
- [ ] Página de dashboard funcional
- [ ] Listagem e criação de treinos
- [ ] Gráficos e estatísticas
- [ ] Upload de foto de perfil
- [ ] Recuperação de senha
- [ ] Notificações em tempo real

## 📦 Scripts

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Rodar produção localmente
pnpm start

# Lint
pnpm lint
```

## 🔧 Desenvolvimento

### Adicionar novos componentes UI

Este projeto usa [Shadcn/ui](https://ui.shadcn.com/). Para adicionar novos componentes:

```bash
npx shadcn@latest add [component-name]
```

### Estrutura de pastas recomendada

- Páginas vão em `app/`
- Componentes reutilizáveis em `components/`
- Serviços e API em `services/`
- Utils e helpers em `lib/`
- Tipos TypeScript em `types/`

## 📝 Licença

MIT

---

Desenvolvido com ❤️ usando Next.js e TypeScript
