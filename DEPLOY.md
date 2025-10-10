# 🚀 Guia de Deploy - Backend na VPS

## 📋 Pré-requisitos na VPS

Antes de fazer o deploy, certifique-se de que sua VPS (84.46.244.179) tem:

- ✅ Node.js (versão 18 ou superior)
- ✅ NPM
- ✅ PM2 (gerenciador de processos)
- ✅ Git
- ✅ Nginx (para proxy reverso)

---

## 🔧 Configuração Inicial da VPS (Fazer uma vez)

### 1. Conectar na VPS via SSH

```bash
ssh root@84.46.244.179
# ou
ssh seu_usuario@84.46.244.179
```

### 2. Instalar Node.js e NPM

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version
```

### 3. Instalar PM2

```bash
sudo npm install -g pm2

# Configurar PM2 para iniciar no boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

### 4. Instalar Git

```bash
sudo apt install git -y
git --version
```

### 5. Criar diretório do projeto

```bash
sudo mkdir -p /var/www/mariomelo-backend
sudo chown -R $USER:$USER /var/www/mariomelo-backend
cd /var/www/mariomelo-backend
```

### 6. Clonar o repositório

```bash
# Substitua pelo URL do seu repositório
git clone https://github.com/mariomeloneto/mariomelo-advocacia.git .

# Ou se for apenas o backend
git clone https://github.com/mariomeloneto/mariomelo-advocacia.git temp
mv temp/backend/* .
rm -rf temp
```

### 7. Configurar variáveis de ambiente

```bash
# Criar arquivo .env
nano .env
```

Cole o seguinte conteúdo (ajuste conforme necessário):

```env
PORT=3000
JWT_SECRET=KqiEJNDnci90!@@DNjsjiEWUQIWjhnndeDW
NODE_ENV=production
FRONTEND_URL=https://www.mariomelo.adv.br
```

Salve com `Ctrl+O`, `Enter`, `Ctrl+X`

### 8. Instalar dependências

```bash
npm install --production
```

### 9. Inicializar banco de dados

```bash
npm run init-db
```

### 10. Iniciar aplicação com PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
```

### 11. Configurar Nginx (Proxy Reverso)

```bash
sudo nano /etc/nginx/sites-available/mariomelo-backend
```

Cole a configuração:

```nginx
server {
    listen 80;
    server_name api.mariomelo.adv.br;  # ou use o IP: 84.46.244.179

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Ativar o site:

```bash
sudo ln -s /etc/nginx/sites-available/mariomelo-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 12. Configurar Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### 13. (Opcional) Configurar SSL com Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.mariomelo.adv.br
```

---

## 🔄 Deploy de Atualizações (Processo Regular)

### Opção 1: Deploy Manual

1. **No seu computador local:**

```bash
# Commit e push das mudanças
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

2. **Na VPS:**

```bash
# Conectar na VPS
ssh root@84.46.244.179

# Navegar para o diretório
cd /var/www/mariomelo-backend

# Baixar atualizações
git pull origin main

# Executar script de deploy
chmod +x deploy.sh
./deploy.sh
```

### Opção 2: Deploy Automático com Script

Execute o script de deploy que já está configurado:

```bash
ssh root@84.46.244.179 "cd /var/www/mariomelo-backend && git pull && ./deploy.sh"
```

---

## 📊 Comandos Úteis do PM2

```bash
# Ver status da aplicação
pm2 status

# Ver logs em tempo real
pm2 logs mariomelo-backend

# Ver logs de erro
pm2 logs mariomelo-backend --err

# Reiniciar aplicação
pm2 restart mariomelo-backend

# Parar aplicação
pm2 stop mariomelo-backend

# Remover aplicação do PM2
pm2 delete mariomelo-backend

# Monitorar recursos
pm2 monit
```

---

## 🔍 Verificar se está funcionando

```bash
# Testar localmente na VPS
curl http://localhost:3000/api/health

# Testar externamente
curl http://84.46.244.179/api/health
# ou
curl http://api.mariomelo.adv.br/api/health
```

---

## 🐛 Troubleshooting

### Aplicação não inicia

```bash
# Ver logs de erro
pm2 logs mariomelo-backend --err

# Verificar se a porta está em uso
sudo lsof -i :3000

# Reiniciar PM2
pm2 kill
pm2 start ecosystem.config.cjs
```

### Banco de dados com problemas

```bash
# Recriar banco de dados
rm mariomelo.db
npm run init-db
pm2 restart mariomelo-backend
```

### Nginx não está funcionando

```bash
# Verificar configuração
sudo nginx -t

# Ver logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 📁 Estrutura de Arquivos na VPS

```
/var/www/mariomelo-backend/
├── server.js
├── database.js
├── init-db.js
├── package.json
├── ecosystem.config.cjs
├── deploy.sh
├── .env
├── mariomelo.db
├── logs/
│   ├── err.log
│   ├── out.log
│   └── combined.log
└── node_modules/
```

---

## 🔐 Segurança

1. **Nunca commite o arquivo `.env`** - Ele está no `.gitignore`
2. **Mude o `JWT_SECRET`** para um valor único e seguro
3. **Configure SSL/HTTPS** com Let's Encrypt
4. **Mantenha o sistema atualizado**: `sudo apt update && sudo apt upgrade`
5. **Use senhas fortes** para o usuário admin do sistema

---

## 📞 Suporte

Se tiver problemas:

1. Verifique os logs: `pm2 logs mariomelo-backend`
2. Verifique o status: `pm2 status`
3. Teste a conexão: `curl http://localhost:3000/api/health`

---

## 🎯 Checklist de Deploy

- [ ] VPS configurada com Node.js, PM2, Git e Nginx
- [ ] Repositório clonado em `/var/www/mariomelo-backend`
- [ ] Arquivo `.env` criado com as variáveis corretas
- [ ] Dependências instaladas (`npm install`)
- [ ] Banco de dados inicializado (`npm run init-db`)
- [ ] Aplicação rodando no PM2 (`pm2 start ecosystem.config.cjs`)
- [ ] Nginx configurado como proxy reverso
- [ ] Firewall configurado
- [ ] SSL/HTTPS configurado (opcional mas recomendado)
- [ ] Teste de funcionamento realizado

---

**Última atualização:** 2025-10-10
