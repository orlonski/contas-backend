# Sistema de Controle Financeiro - Backend

API REST completa para sistema de controle financeiro pessoal, desenvolvida com NestJS, TypeScript, Prisma e PostgreSQL.

## Funcionalidades Principais

### 1. Autenticação e Usuários
- Registro de usuários
- Login com JWT
- Gestão de perfil
- Recuperação de senha (TODO)

### 2. Contas
- Conta Corrente
- Conta Poupança
- Cartão de Crédito (com campos específicos)
  - Dia de vencimento
  - Dia de fechamento
  - Limite do cartão
  - Banco emissor
- Consulta de saldo atual

### 3. Categorias
- Categorias e subcategorias (hierárquicas)
- Categorias de despesa e receita
- Ícones customizáveis
- Visualização em árvore

### 4. Transações
- Tipos: Despesa, Receita, Transferência
- Parcelamento com cálculo automático de faturas
- Recorrência avançada (diária, semanal, mensal, anual)
- Vínculo com categorias
- Vínculo com cartões de crédito
- Edição/exclusão individual ou em série

### 5. Faturas de Cartão de Crédito
- Criação automática baseada em dia de fechamento
- Cálculo automático de valores
- Status: Aberta, Fechada, Paga
- Listagem de transações por fatura

### 6. Dashboard
- Saldo consolidado de todas as contas
- Resultado do período (receitas vs despesas)
  - Mês atual até hoje
  - Amanhã até fim do mês
  - Mês completo
- Despesas agrupadas por categoria
- Fluxo de caixa histórico

## Tecnologias Utilizadas

- **NestJS**: Framework Node.js progressivo
- **TypeScript**: Superset tipado do JavaScript
- **Prisma**: ORM moderno para TypeScript
- **PostgreSQL**: Banco de dados relacional
- **JWT**: Autenticação segura
- **Swagger**: Documentação automática da API
- **Bcrypt**: Hash de senhas

## Pré-requisitos

- Node.js (v18+)
- PostgreSQL (v14+)
- npm ou yarn

## Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd contas-backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/contas_db?schema=public"
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
```

4. Execute as migrations do Prisma:
```bash
npm run prisma:migrate
```

5. Gere o Prisma Client:
```bash
npm run prisma:generate
```

## Executando a Aplicação

### Desenvolvimento
```bash
npm run start:dev
```

### Produção
```bash
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`

## Documentação da API

Acesse a documentação Swagger em: `http://localhost:3000/api`

## Estrutura de Pastas

```
src/
├── auth/                 # Módulo de autenticação
│   ├── decorators/      # Decorators customizados
│   ├── dto/             # DTOs de autenticação
│   ├── guards/          # Guards JWT e Local
│   └── strategies/      # Estratégias Passport
├── users/               # Módulo de usuários
├── accounts/            # Módulo de contas
├── categories/          # Módulo de categorias
├── transactions/        # Módulo de transações
├── invoices/            # Módulo de faturas
├── dashboard/           # Módulo de dashboard
├── prisma/              # Módulo Prisma
├── app.module.ts        # Módulo principal
└── main.ts              # Ponto de entrada

prisma/
└── schema.prisma        # Schema do banco de dados
```

## Principais Endpoints

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login

### Contas
- `POST /accounts` - Criar conta
- `GET /accounts` - Listar contas
- `GET /accounts/:id` - Buscar conta
- `GET /accounts/:id/balance` - Obter saldo
- `PATCH /accounts/:id` - Atualizar conta
- `DELETE /accounts/:id` - Remover conta

### Categorias
- `POST /categories` - Criar categoria
- `GET /categories` - Listar categorias
- `GET /categories/tree` - Listar em árvore
- `GET /categories/:id` - Buscar categoria
- `PATCH /categories/:id` - Atualizar categoria
- `DELETE /categories/:id` - Remover categoria

### Transações
- `POST /transactions` - Criar transação
- `GET /transactions` - Listar transações (com filtros)
- `GET /transactions/:id` - Buscar transação
- `GET /transactions/invoice/:invoiceId` - Listar por fatura
- `PATCH /transactions/:id` - Atualizar transação
- `PATCH /transactions/series/:seriesId` - Atualizar série
- `DELETE /transactions/:id` - Remover transação
- `DELETE /transactions/series/:seriesId` - Remover série

### Faturas
- `GET /invoices/card/:creditCardId` - Listar faturas do cartão
- `GET /invoices/:id` - Detalhar fatura
- `PATCH /invoices/:id/pay` - Marcar como paga
- `PATCH /invoices/:id/close` - Fechar fatura
- `PATCH /invoices/:id/recalculate` - Recalcular total

### Dashboard
- `GET /dashboard/summary` - Resumo geral
- `GET /dashboard/consolidated-balance` - Saldo consolidado
- `GET /dashboard/period-result` - Resultado do período
- `GET /dashboard/expenses-by-category` - Despesas por categoria
- `GET /dashboard/cash-flow` - Fluxo de caixa

## Regras de Negócio Importantes

### Transações Parceladas em Cartão de Crédito

Ao criar uma despesa parcelada em cartão de crédito, o sistema:

1. Calcula em qual fatura cada parcela cairá baseado no dia de fechamento
2. Cria uma transação para cada parcela
3. Vincula cada parcela à fatura correspondente
4. Se a transação for feita após o fechamento, a primeira parcela vai para a próxima fatura

**Exemplo:**
- Cartão com fechamento dia 10
- Compra de R$ 1.000 em 10x feita no dia 05/11
- Sistema cria: 10 transações de R$ 100
- Primeira parcela: fatura 11/2025 (venc. 17/11)
- Demais parcelas: uma para cada mês subsequente

### Atualização de Saldos

- **Contas normais**: saldo atualiza imediatamente na data da transação
- **Cartão de crédito**: não altera saldo da conta até pagamento da fatura
- **Transferências**: debita de uma conta e credita em outra simultaneamente

## Scripts Disponíveis

```bash
npm run build          # Compilar projeto
npm run start          # Iniciar aplicação
npm run start:dev      # Iniciar em modo desenvolvimento
npm run start:prod     # Iniciar em modo produção
npm run lint           # Executar linter
npm run format         # Formatar código
npm run test           # Executar testes
npm run prisma:generate # Gerar Prisma Client
npm run prisma:migrate  # Executar migrations
npm run prisma:studio   # Abrir Prisma Studio
```

## Prisma Studio

Para visualizar e editar dados no banco de dados:

```bash
npm run prisma:studio
```

Acesse em `http://localhost:5555`

## Testes

```bash
# Testes unitários
npm run test

# Testes e2e
npm run test:e2e

# Coverage
npm run test:cov
```

## Considerações de Segurança

- Senhas são criptografadas com bcrypt
- Autenticação via JWT
- Validação de dados em todos os endpoints
- Proteção contra SQL injection (Prisma)
- CORS habilitado

## TODO / Melhorias Futuras

- [ ] Recuperação de senha por email
- [ ] Autenticação de dois fatores
- [ ] Notificações de vencimento de faturas
- [ ] Exportação de dados (CSV, Excel)
- [ ] Relatórios avançados
- [ ] Metas de gastos por categoria
- [ ] Comparativo de períodos
- [ ] Gráficos e visualizações
- [ ] Suporte a múltiplas moedas
- [ ] Importação de OFX/CSV de bancos

## Licença

MIT

## Contato

Para dúvidas e sugestões, entre em contato.
