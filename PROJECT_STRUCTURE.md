# Estrutura do Projeto

## Visão Geral da Árvore de Arquivos

```
contas-backend/
│
├── 📄 Configuration Files
│   ├── .env.example              # Exemplo de variáveis de ambiente
│   ├── .eslintrc.js              # Configuração ESLint
│   ├── .prettierrc               # Configuração Prettier
│   ├── .gitignore                # Arquivos ignorados pelo Git
│   ├── .dockerignore             # Arquivos ignorados pelo Docker
│   ├── nest-cli.json             # Configuração NestJS CLI
│   ├── tsconfig.json             # Configuração TypeScript
│   ├── package.json              # Dependências e scripts
│   ├── Dockerfile                # Imagem Docker da aplicação
│   └── docker-compose.yml        # Orquestração Docker (PostgreSQL + PgAdmin)
│
├── 📚 Documentation
│   ├── README.md                 # Documentação principal
│   ├── QUICKSTART.md             # Guia de início rápido
│   ├── ARCHITECTURE.md           # Arquitetura detalhada
│   ├── API_EXAMPLES.md           # Exemplos de uso da API
│   └── PROJECT_STRUCTURE.md      # Este arquivo
│
├── 🗄️ prisma/
│   ├── schema.prisma             # Schema do banco de dados
│   └── seed.ts                   # Script de seed (dados iniciais)
│
└── 📦 src/
    │
    ├── 🔐 auth/                  # Módulo de Autenticação
    │   ├── decorators/
    │   │   └── current-user.decorator.ts  # Decorator para pegar usuário atual
    │   ├── dto/
    │   │   └── login.dto.ts      # DTO de login
    │   ├── guards/
    │   │   ├── jwt-auth.guard.ts # Guard JWT
    │   │   └── local-auth.guard.ts # Guard local
    │   ├── strategies/
    │   │   ├── jwt.strategy.ts   # Estratégia JWT
    │   │   └── local.strategy.ts # Estratégia local
    │   ├── auth.controller.ts    # Controller de autenticação
    │   ├── auth.module.ts        # Módulo de autenticação
    │   └── auth.service.ts       # Serviço de autenticação
    │
    ├── 👤 users/                 # Módulo de Usuários
    │   ├── dto/
    │   │   ├── create-user.dto.ts
    │   │   └── update-user.dto.ts
    │   ├── users.controller.ts
    │   ├── users.module.ts
    │   └── users.service.ts
    │
    ├── 🏦 accounts/              # Módulo de Contas
    │   ├── dto/
    │   │   ├── create-account.dto.ts
    │   │   └── update-account.dto.ts
    │   ├── accounts.controller.ts
    │   ├── accounts.module.ts
    │   └── accounts.service.ts
    │
    ├── 🏷️ categories/            # Módulo de Categorias
    │   ├── dto/
    │   │   ├── create-category.dto.ts
    │   │   └── update-category.dto.ts
    │   ├── categories.controller.ts
    │   ├── categories.module.ts
    │   └── categories.service.ts
    │
    ├── 💸 transactions/          # Módulo de Transações
    │   ├── dto/
    │   │   ├── create-transaction.dto.ts
    │   │   └── update-transaction.dto.ts
    │   ├── transactions.controller.ts
    │   ├── transactions.module.ts
    │   └── transactions.service.ts
    │
    ├── 🧾 invoices/              # Módulo de Faturas
    │   ├── invoices.controller.ts
    │   ├── invoices.module.ts
    │   └── invoices.service.ts
    │
    ├── 📊 dashboard/             # Módulo de Dashboard
    │   ├── dashboard.controller.ts
    │   ├── dashboard.module.ts
    │   └── dashboard.service.ts
    │
    ├── 🔌 prisma/                # Módulo Prisma
    │   ├── prisma.module.ts
    │   └── prisma.service.ts
    │
    ├── app.module.ts             # Módulo raiz da aplicação
    └── main.ts                   # Entry point da aplicação
```

## Contagem de Arquivos

- **Total de módulos:** 8
  - auth
  - users
  - accounts
  - categories
  - transactions
  - invoices
  - dashboard
  - prisma

- **Controllers:** 7
- **Services:** 8
- **DTOs:** 12
- **Guards:** 2
- **Strategies:** 2
- **Decorators:** 1

## Fluxo de Dependências entre Módulos

```
AppModule
├── ConfigModule (global)
├── PrismaModule (global)
├── AuthModule
│   └── depends on: UsersModule
├── UsersModule
│   └── depends on: PrismaModule
├── AccountsModule
│   └── depends on: PrismaModule
├── CategoriesModule
│   └── depends on: PrismaModule
├── TransactionsModule
│   ├── depends on: PrismaModule
│   └── depends on: InvoicesModule
├── InvoicesModule
│   └── depends on: PrismaModule
└── DashboardModule
    └── depends on: PrismaModule
```

## Tamanho Estimado dos Arquivos

### Controllers (APIs REST)
- `auth.controller.ts` - ~40 linhas
- `users.controller.ts` - ~35 linhas
- `accounts.controller.ts` - ~70 linhas
- `categories.controller.ts` - ~60 linhas
- `transactions.controller.ts` - ~90 linhas
- `invoices.controller.ts` - ~50 linhas
- `dashboard.controller.ts` - ~70 linhas

### Services (Lógica de Negócio)
- `auth.service.ts` - ~60 linhas
- `users.service.ts` - ~90 linhas
- `accounts.service.ts` - ~140 linhas
- `categories.service.ts` - ~150 linhas
- `transactions.service.ts` - ~350 linhas ⭐ (mais complexo)
- `invoices.service.ts` - ~180 linhas
- `dashboard.service.ts` - ~200 linhas

### DTOs (Validação)
- Cada DTO: ~20-40 linhas

## Complexidade por Módulo

### ⭐⭐⭐ Alta Complexidade
- **Transactions**: Parcelamento, recorrência, faturas, transferências
- **Invoices**: Cálculo de datas, gerenciamento de status
- **Dashboard**: Agregações, cálculos financeiros

### ⭐⭐ Média Complexidade
- **Categories**: Hierarquia, validação de ciclos
- **Accounts**: Tipos diferentes, validações específicas

### ⭐ Baixa Complexidade
- **Auth**: JWT padrão, bcrypt
- **Users**: CRUD básico

## Endpoints por Módulo

### Auth (2 endpoints)
- POST /auth/register
- POST /auth/login

### Users (3 endpoints)
- GET /users/me
- PATCH /users/me
- DELETE /users/me

### Accounts (6 endpoints)
- POST /accounts
- GET /accounts
- GET /accounts/:id
- GET /accounts/:id/balance
- PATCH /accounts/:id
- DELETE /accounts/:id

### Categories (6 endpoints)
- POST /categories
- GET /categories
- GET /categories/tree
- GET /categories/:id
- PATCH /categories/:id
- DELETE /categories/:id

### Transactions (9 endpoints)
- POST /transactions
- GET /transactions
- GET /transactions/:id
- GET /transactions/invoice/:invoiceId
- PATCH /transactions/:id
- PATCH /transactions/series/:seriesId
- DELETE /transactions/:id
- DELETE /transactions/series/:seriesId

### Invoices (5 endpoints)
- GET /invoices/card/:creditCardId
- GET /invoices/:id
- PATCH /invoices/:id/pay
- PATCH /invoices/:id/close
- PATCH /invoices/:id/recalculate

### Dashboard (5 endpoints)
- GET /dashboard/summary
- GET /dashboard/consolidated-balance
- GET /dashboard/period-result
- GET /dashboard/expenses-by-category
- GET /dashboard/cash-flow

**Total: 36 endpoints**

## Modelos do Prisma (Database)

```
User
├── has many → Account
├── has many → Category
└── has many → Transaction

Account
├── belongs to → User
├── has many → Transaction
├── has many → Invoice (if CREDIT_CARD)
└── can be origin/destination of → Transfer

Category
├── belongs to → User
├── belongs to → Category (parent)
├── has many → Category (children)
└── has many → Transaction

Transaction
├── belongs to → User
├── belongs to → Account
├── belongs to → Category (optional)
├── belongs to → Invoice (optional)
├── belongs to → Account (transferFrom - optional)
└── belongs to → Account (transferTo - optional)

Invoice
├── belongs to → Account (CREDIT_CARD)
└── has many → Transaction
```

## Segurança Implementada

✅ **Autenticação**
- JWT com expiração configurável
- Bcrypt para hash de senhas (10 rounds)

✅ **Autorização**
- Guards em todos os endpoints (exceto auth)
- Validação de ownership (userId)

✅ **Validação**
- class-validator em todos os DTOs
- Whitelist e forbidNonWhitelisted
- Transform automático de tipos

✅ **Proteção**
- Prisma protege contra SQL injection
- CORS habilitado
- Senhas nunca retornadas em responses

## Scripts NPM Disponíveis

### Desenvolvimento
```bash
npm run start:dev      # Hot reload
npm run start:debug    # Com debugger
```

### Build & Produção
```bash
npm run build         # Compilar
npm run start:prod    # Produção
```

### Qualidade
```bash
npm run lint          # ESLint
npm run format        # Prettier
```

### Testes
```bash
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage
```

### Prisma
```bash
npm run prisma:generate   # Gerar client
npm run prisma:migrate    # Executar migrations
npm run prisma:studio     # UI visual
npm run prisma:seed       # Popular banco
```

## Dependências Principais

### Runtime
- `@nestjs/common` - Core do NestJS
- `@nestjs/core` - Core do NestJS
- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Passport integration
- `@prisma/client` - Prisma ORM client
- `bcrypt` - Hash de senhas
- `class-validator` - Validação de DTOs
- `passport-jwt` - JWT strategy

### DevDependencies
- `@nestjs/cli` - CLI do NestJS
- `prisma` - Prisma CLI
- `typescript` - TypeScript compiler
- `@typescript-eslint/*` - ESLint para TS
- `prettier` - Code formatter

## Performance

### Otimizações Implementadas
- Índices automáticos (PK, FK, unique)
- Eager loading com `include`
- Select apenas campos necessários
- Connection pooling do Prisma

### Otimizações Futuras
- [ ] Cache (Redis)
- [ ] Paginação
- [ ] Índices customizados
- [ ] Query optimization no dashboard

## Tamanho Total Estimado

- **Linhas de código:** ~3.500 linhas
- **Arquivos TypeScript:** ~50 arquivos
- **Tamanho do projeto:** ~50 MB (com node_modules)
- **Build size:** ~5 MB

## Tempo de Desenvolvimento

Estimativa para recriar o projeto do zero:
- Setup inicial: 1h
- Schema Prisma: 2h
- Módulo Auth: 2h
- Módulo Users: 1h
- Módulo Accounts: 2h
- Módulo Categories: 2h
- Módulo Transactions: 6h ⭐
- Módulo Invoices: 3h
- Módulo Dashboard: 3h
- Documentação: 2h
- **Total: ~24h de desenvolvimento**

## Manutenibilidade

### Fácil de Manter ✅
- Estrutura modular clara
- Separação de responsabilidades
- DTOs bem definidos
- Documentação completa
- Type safety em todo lugar

### Fácil de Estender ✅
- Adicionar novos módulos é direto
- Prisma facilita mudanças no schema
- Guards e decorators reutilizáveis
- Serviços desacoplados

### Fácil de Testar ✅
- Dependency injection facilita mocks
- Services isolados
- DTOs facilitam validações
- Estrutura clara para testes
