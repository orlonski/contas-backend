# Deploy no EasyPanel

Guia completo para fazer deploy do backend no EasyPanel.

## Pré-requisitos

- Conta no EasyPanel
- Projeto no GitHub/GitLab
- Acesso ao painel do EasyPanel

## Método 1: Deploy Direto (Recomendado)

### Passo 1: Preparar o Repositório

1. Inicialize o git (se ainda não fez):
```bash
git init
git add .
git commit -m "Initial commit - Backend completo"
```

2. Crie um repositório no GitHub e faça push:
```bash
git remote add origin https://github.com/SEU_USUARIO/contas-backend.git
git branch -M main
git push -u origin main
```

### Passo 2: Criar Projeto no EasyPanel

1. Acesse seu painel EasyPanel
2. Clique em "**Create Project**"
3. Dê um nome: `contas-backend`

### Passo 3: Adicionar Banco de Dados PostgreSQL

1. No projeto, clique em "**Add Service**"
2. Selecione "**PostgreSQL**"
3. Configure:
   - **Name:** `contas-db`
   - **Version:** `15`
   - **Database Name:** `contas_db`
   - **Username:** `postgres`
   - **Password:** Gere uma senha forte ou defina uma
4. Clique em "**Create**"
5. **Anote a URL de conexão** que será algo como:
   ```
   postgresql://postgres:SENHA@contas-db:5432/contas_db
   ```

### Passo 4: Adicionar a Aplicação

1. No projeto, clique em "**Add Service**"
2. Selecione "**App**" → "**From Source**"
3. Configure:

**Build:**
- **Source:** GitHub/GitLab
- **Repository:** Selecione seu repositório
- **Branch:** `main`
- **Build Command:**
  ```bash
  npm install && npx prisma generate && npm run build
  ```

**Deploy:**
- **Start Command:**
  ```bash
  npx prisma migrate deploy && npm run start:prod
  ```
- **Port:** `3000`

**Environment Variables:**

Adicione as seguintes variáveis:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:SUA_SENHA@contas-db:5432/contas_db?schema=public
JWT_SECRET=gere-uma-chave-forte-de-32-caracteres-aqui
JWT_EXPIRES_IN=7d
```

**Importante:**
- Substitua `SUA_SENHA` pela senha que você definiu no PostgreSQL
- Gere uma `JWT_SECRET` forte (use um gerador online ou: `openssl rand -base64 32`)

4. Clique em "**Create**"

### Passo 5: Deploy

1. O EasyPanel vai automaticamente:
   - Clonar o repositório
   - Instalar dependências
   - Gerar o Prisma Client
   - Fazer build
   - Executar migrations
   - Iniciar a aplicação

2. Aguarde o deploy finalizar (pode levar 2-5 minutos)

3. Quando finalizar, você terá uma URL como:
   ```
   https://contas-backend-xxx.easypanel.host
   ```

### Passo 6: Testar

Acesse a documentação Swagger:
```
https://sua-url.easypanel.host/api
```

Teste o endpoint de registro:
```bash
curl -X POST https://sua-url.easypanel.host/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

## Método 2: Deploy Manual via Docker

Se preferir mais controle, use este método.

### Passo 1: Build Local

```bash
docker build -t contas-backend .
```

### Passo 2: Push para Registry

```bash
# Tag
docker tag contas-backend seu-registry.com/contas-backend:latest

# Push
docker push seu-registry.com/contas-backend:latest
```

### Passo 3: Deploy no EasyPanel

1. Adicione "**App**" → "**From Registry**"
2. Use a imagem que você fez push
3. Configure as variáveis de ambiente como acima

## Configurações Importantes

### CORS

Se o frontend estiver em outro domínio, você pode precisar configurar CORS.

Edite `src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'https://seu-frontend.com',
    'http://localhost:3001', // desenvolvimento
  ],
  credentials: true,
});
```

### SSL/HTTPS

O EasyPanel já fornece SSL automático via Let's Encrypt. Não precisa configurar nada.

### Domínio Customizado

1. No EasyPanel, vá em "**Domains**"
2. Clique em "**Add Domain**"
3. Digite seu domínio: `api.seusite.com`
4. Configure o DNS apontando para o IP fornecido pelo EasyPanel
5. Aguarde propagação (pode levar até 24h)

## Variáveis de Ambiente no EasyPanel

Certifique-se de configurar todas essas variáveis:

```env
# Banco de Dados
DATABASE_URL=postgresql://postgres:SENHA@contas-db:5432/contas_db?schema=public

# JWT (IMPORTANTE: Use uma chave forte!)
JWT_SECRET=sua-chave-secreta-muito-forte-de-32-caracteres-ou-mais
JWT_EXPIRES_IN=7d

# Aplicação
NODE_ENV=production
PORT=3000

# Opcional: CORS
CORS_ORIGIN=https://seu-frontend.com
```

## Scripts de Deploy Automático

O EasyPanel pode fazer deploy automático quando você faz push no GitHub.

### Configurar Webhook

1. No EasyPanel, vá em "**Settings**" → "**Webhooks**"
2. Copie a URL do webhook
3. No GitHub:
   - Vá em "**Settings**" → "**Webhooks**"
   - Cole a URL
   - Selecione eventos: "**Push**"
   - Salve

Agora, sempre que você fizer push na branch `main`, o EasyPanel fará deploy automaticamente!

## Monitoramento

### Logs

No EasyPanel, vá em "**Logs**" para ver os logs da aplicação em tempo real.

### Health Check

Configure um health check endpoint (opcional):

1. Crie `src/health/health.controller.ts`:
```typescript
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
```

2. No EasyPanel, configure:
   - **Health Check Path:** `/health`
   - **Health Check Interval:** 30 segundos

## Migrations em Produção

Quando você fizer alterações no schema Prisma:

1. Localmente, crie a migration:
```bash
npx prisma migrate dev --name nome_da_migration
```

2. Commit e push:
```bash
git add prisma/migrations
git commit -m "Add migration: nome_da_migration"
git push
```

3. O EasyPanel vai executar automaticamente:
```bash
npx prisma migrate deploy
```

## Backup do Banco

### Backup Manual

No EasyPanel:
1. Vá em "**PostgreSQL**" → "**Backups**"
2. Clique em "**Create Backup**"

### Backup Automático

Configure backups automáticos:
1. EasyPanel → PostgreSQL → Settings
2. Configure "**Automatic Backups**"
3. Frequência: Diária
4. Retenção: 7 dias

## Escala

### Vertical (Mais recursos)

1. No EasyPanel, vá em "**App**" → "**Resources**"
2. Aumente:
   - **CPU:** 1 → 2 cores
   - **RAM:** 512MB → 1GB

### Horizontal (Múltiplas instâncias)

1. Vá em "**Scaling**"
2. Aumente "**Replicas**": 1 → 2

O EasyPanel vai distribuir a carga automaticamente.

## Troubleshooting

### Erro de Conexão com Banco

**Sintoma:** `Can't reach database server`

**Solução:**
1. Verifique se o PostgreSQL está rodando no EasyPanel
2. Confirme a `DATABASE_URL` nas variáveis de ambiente
3. Certifique-se que o hostname é `contas-db` (nome do service)

### Erro ao Executar Migrations

**Sintoma:** `Migration failed`

**Solução:**
1. Verifique os logs no EasyPanel
2. Se necessário, conecte no banco e execute manualmente:
```bash
npx prisma migrate deploy
```

### Aplicação não inicia

**Sintoma:** App fica reiniciando

**Solução:**
1. Verifique os logs
2. Confirme que todas as variáveis de ambiente estão configuradas
3. Teste o build localmente primeiro:
```bash
npm run build
npm run start:prod
```

## Custos Estimados

EasyPanel cobra por recursos utilizados:

**Setup Mínimo:**
- App (512MB RAM, 0.5 CPU): ~$5/mês
- PostgreSQL (1GB storage): ~$3/mês
- **Total:** ~$8/mês

**Setup Recomendado:**
- App (1GB RAM, 1 CPU): ~$10/mês
- PostgreSQL (5GB storage): ~$8/mês
- **Total:** ~$18/mês

## Checklist de Deploy

- [ ] Repositório no GitHub criado e com código
- [ ] PostgreSQL criado no EasyPanel
- [ ] `DATABASE_URL` configurada
- [ ] `JWT_SECRET` forte gerada
- [ ] Variáveis de ambiente configuradas
- [ ] App criada e conectada ao repositório
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Deploy executado com sucesso
- [ ] Migrations executadas
- [ ] Teste de registro/login funcionando
- [ ] Swagger acessível
- [ ] (Opcional) Domínio customizado configurado
- [ ] (Opcional) CORS configurado para frontend
- [ ] (Opcional) Backups automáticos ativados

## Próximos Passos Após Deploy

1. ✅ Teste todos os endpoints via Swagger
2. ✅ Crie um usuário de teste
3. ✅ Configure CORS para seu frontend
4. ✅ Configure domínio customizado (opcional)
5. ✅ Configure backups automáticos
6. ✅ Configure monitoramento/alertas
7. ✅ Documente a URL da API para o time

## Suporte

**EasyPanel Docs:** https://easypanel.io/docs
**Prisma Deployment:** https://www.prisma.io/docs/guides/deployment
**NestJS Deployment:** https://docs.nestjs.com/deployment

---

**Dúvidas?** Consulte os logs no EasyPanel ou teste localmente primeiro.
