#!/bin/bash

# Script de deploy automático para VPS
# Execute este script na VPS após fazer git pull

echo "🚀 Iniciando deploy do backend..."

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Diretório do projeto
PROJECT_DIR="/var/www/mariomelo-backend"

# Navegar para o diretório do projeto
cd $PROJECT_DIR || exit

echo -e "${BLUE}📦 Instalando dependências...${NC}"
npm install --production

# Nota: NÃO executar init-db em deploy para preservar dados existentes
# O banco de dados já está criado e contém os artigos
# Se precisar recriar o banco, execute manualmente: npm run init-db

echo -e "${BLUE}🔄 Reiniciando aplicação com PM2...${NC}"
pm2 restart mariomelo-backend || pm2 start ecosystem.config.cjs

echo -e "${BLUE}💾 Salvando configuração do PM2...${NC}"
pm2 save

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${BLUE}📊 Status da aplicação:${NC}"
pm2 status
