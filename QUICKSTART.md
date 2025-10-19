# Guia de Início Rápido

Este guia vai te ajudar a rodar o projeto em menos de 5 minutos.

## Pré-requisitos

- Node.js v18+
- PostgreSQL v14+ (se não usar Docker)
- Git

## 📚 Escolha seu Guia

- **Rodar Local SEM Docker** → Leia: [START_LOCAL.md](START_LOCAL.md) ⭐
- **Rodar Local COM Docker** → Continue abaixo
- **Deploy no EasyPanel** → Leia: [EASYPANEL_DEPLOY.md](EASYPANEL_DEPLOY.md) 🚀

---

## Opção 1: Setup com Docker

### 1. Clone o repositório
```bash
git clone <url-do-repo>
cd contas-backend
```

### 2. Configure o ambiente
```bash
cp .env.example .env
```

O `.env` já vem configurado para usar o PostgreSQL do Docker:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/contas_db?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### 3. Suba o banco de dados
```bash
docker-compose up -d
```

Isso vai subir:
- PostgreSQL na porta 5432
- PgAdmin na porta 5050 (opcional)

### 4. Instale as dependências
```bash
npm install
```

### 5. Execute as migrations
```bash
npm run prisma:migrate
```

### 6. (Opcional) Popule o banco com dados de exemplo
```bash
npm run prisma:seed
```

Isso criará:
- Usuário demo: `demo@example.com` / `password123`
- 3 contas (corrente, poupança, cartão)
- Várias categorias organizadas
- Algumas transações de exemplo

### 7. Inicie o servidor
```bash
npm run start:dev
```

### 8. Acesse a aplicação

- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- PgAdmin: http://localhost:5050 (login: `admin@admin.com` / `admin`)

## Opção 2: Setup sem Docker

### 1. Clone o repositório
```bash
git clone <url-do-repo>
cd contas-backend
```

### 2. Instale o PostgreSQL

**Windows:**
- Baixe e instale: https://www.postgresql.org/download/windows/

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Crie o banco de dados
```bash
# Acesse o PostgreSQL
psql -U postgres

# No console do psql
CREATE DATABASE contas_db;
\q
```

### 4. Configure o ambiente
```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais do PostgreSQL:
```env
DATABASE_URL="postgresql://SEU_USUARIO:SUA_SENHA@localhost:5432/contas_db?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

### 5. Instale as dependências
```bash
npm install
```

### 6. Execute as migrations
```bash
npm run prisma:migrate
```

### 7. (Opcional) Popule o banco
```bash
npm run prisma:seed
```

### 8. Inicie o servidor
```bash
npm run start:dev
```

## Testando a API

### 1. Via Swagger (Recomendado)

Acesse http://localhost:3000/api e você terá uma interface interativa para testar todos os endpoints.

### 2. Via cURL

**Registrar usuário:**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Copie o `access_token` da resposta e use nos próximos requests:

**Criar conta:**
```bash
curl -X POST http://localhost:3000/accounts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Minha Conta",
    "initialBalance": 1000,
    "type": "CHECKING"
  }'
```

### 3. Com dados de seed

Se você executou `npm run prisma:seed`, pode fazer login com:
- Email: `demo@example.com`
- Senha: `password123`

E terá acesso a dados já criados para explorar a API.

## Prisma Studio

Para visualizar e editar dados no banco de forma visual:

```bash
npm run prisma:studio
```

Acesse: http://localhost:5555

## Scripts Úteis

```bash
# Desenvolvimento
npm run start:dev         # Inicia com hot-reload

# Build e Produção
npm run build            # Compila o projeto
npm run start:prod       # Inicia versão de produção

# Prisma
npm run prisma:generate  # Gera Prisma Client
npm run prisma:migrate   # Executa migrations
npm run prisma:studio    # Abre Prisma Studio
npm run prisma:seed      # Popula banco com dados

# Qualidade de Código
npm run lint             # Executa linter
npm run format           # Formata código

# Testes
npm run test             # Testes unitários
npm run test:e2e         # Testes E2E
npm run test:cov         # Coverage
```

## Estrutura do Projeto

```
contas-backend/
├── src/
│   ├── auth/              # Autenticação JWT
│   ├── users/             # Gestão de usuários
│   ├── accounts/          # Contas bancárias
│   ├── categories/        # Categorias de transações
│   ├── transactions/      # Transações financeiras
│   ├── invoices/          # Faturas de cartão
│   ├── dashboard/         # Métricas e resumos
│   ├── prisma/            # Prisma service
│   ├── app.module.ts      # Módulo raiz
│   └── main.ts            # Entry point
├── prisma/
│   ├── schema.prisma      # Schema do banco
│   └── seed.ts            # Dados de exemplo
├── .env                   # Variáveis de ambiente
├── docker-compose.yml     # Docker setup
└── package.json
```

## Próximos Passos

1. Explore a documentação Swagger: http://localhost:3000/api
2. Leia os exemplos de uso em [API_EXAMPLES.md](API_EXAMPLES.md)
3. Entenda a arquitetura em [ARCHITECTURE.md](ARCHITECTURE.md)
4. Leia o README completo em [README.md](README.md)

## Problemas Comuns

### Erro de conexão com o banco

**Sintoma:** `Can't reach database server`

**Solução:**
1. Verifique se o PostgreSQL está rodando: `docker-compose ps` ou `sudo systemctl status postgresql`
2. Confirme as credenciais no `.env`
3. Teste a conexão: `psql -U postgres -h localhost`

### Erro ao executar migrations

**Sintoma:** `Migration failed`

**Solução:**
1. Reset o banco: `npm run prisma:migrate reset`
2. Execute novamente: `npm run prisma:migrate`

### Porta 3000 já em uso

**Sintoma:** `Port 3000 is already in use`

**Solução:**
1. Mate o processo: `npx kill-port 3000`
2. Ou mude a porta no `.env`: `PORT=3001`

### Erro ao gerar Prisma Client

**Sintoma:** `@prisma/client did not initialize yet`

**Solução:**
```bash
npm run prisma:generate
```

## Suporte

Para mais detalhes, consulte:
- [README.md](README.md) - Documentação completa
- [API_EXAMPLES.md](API_EXAMPLES.md) - Exemplos de uso
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitetura do sistema

## Credenciais de Demo

Se você executou o seed:
- **Email:** demo@example.com
- **Senha:** password123

PgAdmin (se usando Docker):
- **URL:** http://localhost:5050
- **Email:** admin@admin.com
- **Senha:** admin
