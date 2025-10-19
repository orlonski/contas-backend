# Guia Rápido: Rodar Local (Sem Docker)

## 1️⃣ Instalar PostgreSQL

### Windows

**Opção A: Instalador Oficial**
1. Baixe: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Durante instalação:
   - Porta: **5432** (padrão)
   - Senha: defina uma senha (ex: **postgres**)
   - Marque: **pgAdmin 4**
4. Finalize a instalação

**Opção B: Chocolatey** (se tiver instalado)
```bash
choco install postgresql
```

### Verificar Instalação

```bash
# Verificar se está rodando
psql --version

# Deve mostrar algo como: psql (PostgreSQL) 15.x
```

## 2️⃣ Criar Banco de Dados

### Via pgAdmin (Interface Gráfica)

1. Abra o **pgAdmin 4**
2. Conecte ao servidor PostgreSQL (use a senha que definiu)
3. Clique com botão direito em "**Databases**"
4. Selecione "**Create**" → "**Database**"
5. Nome: `contas_db`
6. Clique em "**Save**"

### Via Linha de Comando (Terminal)

```bash
# Abrir psql
psql -U postgres

# Criar banco
CREATE DATABASE contas_db;

# Verificar
\l

# Sair
\q
```

## 3️⃣ Configurar Variáveis de Ambiente

Edite o arquivo `.env` na raiz do projeto:

```env
# Database - AJUSTE A SENHA SE NECESSÁRIO!
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/contas_db?schema=public"

# JWT
JWT_SECRET="contas-secret-key-change-this-in-production-use-a-strong-random-string"
JWT_EXPIRES_IN="7d"

# Application
PORT=3000
NODE_ENV="development"
```

**⚠️ IMPORTANTE:** Troque `SUA_SENHA` pela senha que você definiu no PostgreSQL!

## 4️⃣ Instalar Dependências

```bash
npm install
```

Isso vai instalar todas as dependências do projeto (pode demorar 1-2 minutos).

## 5️⃣ Gerar Prisma Client

```bash
npm run prisma:generate
```

Isso gera o cliente TypeScript do Prisma baseado no schema.

## 6️⃣ Executar Migrations

```bash
npm run prisma:migrate
```

Isso cria todas as tabelas no banco de dados.

Quando perguntar o nome da migration, pode digitar: `init`

## 7️⃣ Popular Banco com Dados (Opcional)

```bash
npm run prisma:seed
```

Isso cria:
- Usuário demo: `demo@example.com` / `password123`
- 3 contas (corrente, poupança, cartão)
- Várias categorias
- Algumas transações de exemplo

## 8️⃣ Iniciar Servidor

```bash
npm run start:dev
```

Aguarde aparecer:
```
Application is running on: http://localhost:3000
Swagger documentation: http://localhost:3000/api
```

## 9️⃣ Testar

Abra no navegador:

**Swagger (Documentação Interativa):**
```
http://localhost:3000/api
```

**API:**
```
http://localhost:3000
```

## ✅ Pronto!

Agora você pode:
1. Explorar os endpoints no Swagger
2. Fazer login com: `demo@example.com` / `password123`
3. Testar as APIs
4. Desenvolver o frontend

---

## 🔧 Comandos Úteis

### Durante Desenvolvimento

```bash
# Iniciar servidor com hot-reload
npm run start:dev

# Ver banco de dados visualmente
npm run prisma:studio
# Abre em http://localhost:5555
```

### Gerenciar Banco

```bash
# Resetar banco (CUIDADO! Apaga tudo)
npm run prisma:migrate reset

# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Popular novamente
npm run prisma:seed
```

### Qualidade de Código

```bash
# ESLint
npm run lint

# Prettier
npm run format

# Build
npm run build
```

---

## ❌ Problemas Comuns

### "Can't reach database server"

**Causa:** PostgreSQL não está rodando ou senha errada

**Solução:**
1. Verifique se PostgreSQL está rodando:
   - Windows: Services → PostgreSQL deve estar "Running"
2. Confirme a senha no `.env`
3. Teste a conexão:
   ```bash
   psql -U postgres -d contas_db
   ```

### "Port 3000 is already in use"

**Causa:** Já tem algo rodando na porta 3000

**Solução:**
```bash
# Matar processo na porta 3000
npx kill-port 3000

# Ou mude a porta no .env
PORT=3001
```

### "prisma.client did not initialize"

**Causa:** Prisma Client não foi gerado

**Solução:**
```bash
npm run prisma:generate
```

### "Migration failed"

**Causa:** Banco não existe ou já tem dados conflitantes

**Solução:**
```bash
# Opção 1: Reset completo
npm run prisma:migrate reset

# Opção 2: Drop manual do banco e recrie
# Via pgAdmin ou:
psql -U postgres
DROP DATABASE contas_db;
CREATE DATABASE contas_db;
\q

# Depois execute migrations novamente
npm run prisma:migrate
```

---

## 📱 Testar a API

### Via Swagger (Recomendado)

1. Acesse: http://localhost:3000/api
2. Expanda "**auth**" → "**POST /auth/login**"
3. Clique em "**Try it out**"
4. Preencha:
   ```json
   {
     "email": "demo@example.com",
     "password": "password123"
   }
   ```
5. Clique em "**Execute**"
6. Copie o `access_token` da resposta
7. No topo da página, clique em "**Authorize**"
8. Cole o token e clique em "**Authorize**"
9. Agora você pode testar todos os outros endpoints!

### Via cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"password123"}'

# Copie o access_token e use nos próximos requests:

# Listar contas
curl http://localhost:3000/accounts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🚀 Próximos Passos

1. ✅ Backend rodando local
2. ⏭️ Desenvolver frontend
3. ⏭️ Integrar frontend com backend
4. ⏭️ Deploy no EasyPanel (veja [EASYPANEL_DEPLOY.md](EASYPANEL_DEPLOY.md))

---

## 💡 Dicas

- Use o **Prisma Studio** para ver os dados visualmente: `npm run prisma:studio`
- Use o **Swagger** para testar endpoints sem precisar de Postman
- Use o **pgAdmin** para gerenciar o banco de dados visualmente
- Sempre rode `npm run prisma:generate` após mudar o `schema.prisma`
- Leia [API_EXAMPLES.md](API_EXAMPLES.md) para ver exemplos de uso
