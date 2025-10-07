# 🚀 Backend API - Mário Melo Advocacia

Backend Node.js com Express e SQLite para gerenciamento de artigos.

## 📦 Instalação

```bash
cd backend
npm install
```

## ⚙️ Configuração

1. Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
```

2. Edite o `.env` e configure:
```env
PORT=3001
JWT_SECRET=sua_chave_secreta_super_segura_aqui
NODE_ENV=production
FRONTEND_URL=https://www.mariomelo.adv.br
```

## 🏃 Executar

### Desenvolvimento:
```bash
npm run dev
```

### Produção:
```bash
npm start
```

## 📡 Endpoints da API

### Públicos (sem autenticação):

- `GET /api/health` - Status da API
- `GET /api/articles` - Listar todos os artigos
- `GET /api/articles/:id` - Buscar artigo por ID
- `GET /api/articles/slug/:slug` - Buscar artigo por slug

### Autenticação:

- `POST /api/auth/login` - Login
  ```json
  {
    "email": "admin@mariomelo.adv.br",
    "password": "sua_senha"
  }
  ```

- `POST /api/auth/register` - Registrar usuário (apenas setup inicial)
  ```json
  {
    "name": "Admin",
    "email": "admin@mariomelo.adv.br",
    "password": "sua_senha"
  }
  ```

### Protegidos (requer token JWT):

- `POST /api/articles` - Criar artigo
- `PUT /api/articles/:id` - Atualizar artigo
- `DELETE /api/articles/:id` - Deletar artigo

**Header necessário:**
```
Authorization: Bearer SEU_TOKEN_JWT
```

## 🔐 Primeiro Acesso

1. Inicie o servidor
2. Registre o primeiro usuário:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@mariomelo.adv.br",
    "password": "sua_senha_segura"
  }'
```

3. Faça login para obter o token:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@mariomelo.adv.br",
    "password": "sua_senha_segura"
  }'
```

## 📁 Estrutura de Arquivos

```
backend/
├── server.js          # Servidor Express
├── database.js        # Configuração SQLite
├── package.json       # Dependências
├── .env              # Variáveis de ambiente (criar)
├── .env.example      # Exemplo de configuração
└── mariomelo.db      # Banco de dados (criado automaticamente)
```

## 🌐 Deploy na Hostinger

1. Faça upload de todos os arquivos do backend
2. Configure o `.env` com as variáveis de produção
3. Instale as dependências: `npm install --production`
4. Inicie o servidor: `npm start`
5. Configure o domínio/subdomínio para apontar para a porta do backend

## 🔧 Tecnologias

- **Express** - Framework web
- **SQLite** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **CORS** - Segurança

## 📝 Notas

- O banco de dados SQLite é criado automaticamente na primeira execução
- Desabilite a rota `/api/auth/register` em produção após criar o usuário admin
- Mantenha o `JWT_SECRET` seguro e nunca compartilhe
