/* eslint-env node */
// Configuração do PM2 para gerenciar o processo do backend
// Este arquivo usa CommonJS (.cjs) porque o PM2 requer este formato

module.exports = {
  apps: [{
    name: 'mariomelo-backend',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Variáveis de ambiente (o .env sobrescreve estas)
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    // Logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    
    // Configurações adicionais
    max_restarts: 10,
    min_uptime: '10s',
    listen_timeout: 3000,
    kill_timeout: 5000,
    
    // Merge logs de todas as instâncias
    merge_logs: true,
    
    // Formato de log com timestamp
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
