# Configuração de E-mail para Formulário de Contato

## Como configurar o envio de e-mails

### 1. Criar Senha de Aplicativo no Gmail

Como você usa Gmail (`smtp.gmail.com`), precisa criar uma **Senha de Aplicativo**:

1. Acesse: https://myaccount.google.com/security
2. Ative a **Verificação em duas etapas** (se ainda não estiver ativa)
3. Vá em **Senhas de app**: https://myaccount.google.com/apppasswords
4. Selecione:
   - **App**: Outro (nome personalizado)
   - Digite: "Site Mário Melo Advocacia"
5. Clique em **Gerar**
6. Copie a senha de 16 caracteres gerada

### 2. Configurar variáveis de ambiente na VPS

Na VPS, edite o arquivo `.env`:

```bash
cd /var/www/mariomelo-backend
nano .env
```

Adicione estas linhas:

```env
EMAIL_USER=contato@mariomelo.adv.br
EMAIL_PASSWORD=sua_senha_de_aplicativo_aqui
```

**Importante**: Use a senha de aplicativo gerada, não a senha normal da conta!

### 3. Reiniciar o backend

```bash
pm2 restart mariomelo-backend
```

### 4. Testar

Acesse o site e preencha o formulário de contato. O e-mail deve chegar em `contato@mariomelo.adv.br`.

## Verificar logs

Se houver problemas, verifique os logs:

```bash
pm2 logs mariomelo-backend --lines 50
```

## Solução de problemas comuns

### Erro: "Invalid login"
- Verifique se a verificação em duas etapas está ativa
- Certifique-se de usar a senha de aplicativo, não a senha normal
- Confirme que o e-mail está correto

### Erro: "Connection timeout"
- Verifique se a porta 587 está aberta no firewall
- Tente usar porta 465 com `secure: true`

### E-mail não chega
- Verifique a pasta de spam
- Confirme que o e-mail `contato@mariomelo.adv.br` existe e está ativo
- Verifique os logs do backend

## Formato do e-mail enviado

O e-mail será enviado com:
- **De**: contato@mariomelo.adv.br
- **Para**: contato@mariomelo.adv.br
- **Assunto**: [Site] {assunto do formulário}
- **Conteúdo**: HTML formatado com todos os dados do formulário
