import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { articlesDB, usersDB } from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware CORS - Configuração para produção
const allowedOrigins = [
  'https://mariomelo.adv.br',
  'https://www.mariomelo.adv.br',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Se FRONTEND_URL estiver definido, adiciona à lista
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Permite requisições sem origin (como Postman, curl, etc)
    if (!origin) return callback(null, true);
    
    // Verifica se a origem está na lista de permitidas
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origem bloqueada por CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de autenticação
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// ==================== ROTAS PÚBLICAS ====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API Mário Melo Advocacia funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota temporária para inicializar banco
app.get('/api/init-database', async (req, res) => {
  try {
    const bcrypt = await import('bcryptjs');
    const existingUser = usersDB.getByEmail('mario.melo@mariomelo.adv.br');
    
    if (!existingUser) {
      const hashedPassword = await bcrypt.default.hash('MarioNeto2134!', 10);
      usersDB.create({
        name: 'Mário Melo',
        email: 'mario.melo@mariomelo.adv.br',
        password: hashedPassword,
        role: 'admin'
      });
      res.json({ success: true, message: 'Usuário criado!' });
    } else {
      res.json({ success: true, message: 'Usuário já existe' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todos os artigos (público)
app.get('/api/articles', (req, res) => {
  try {
    const articles = articlesDB.getAll();
    res.json(articles);
  } catch (error) {
    console.error('Erro ao buscar artigos:', error);
    res.status(500).json({ error: 'Erro ao buscar artigos' });
  }
});

// Buscar artigo por slug (público)
app.get('/api/articles/slug/:slug', (req, res) => {
  try {
    const article = articlesDB.getBySlug(req.params.slug);
    
    if (!article) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    res.status(500).json({ error: 'Erro ao buscar artigo' });
  }
});

// Buscar artigo por ID (público)
app.get('/api/articles/:id', (req, res) => {
  try {
    const article = articlesDB.getById(req.params.id);
    
    if (!article) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Erro ao buscar artigo:', error);
    res.status(500).json({ error: 'Erro ao buscar artigo' });
  }
});

// ==================== AUTENTICAÇÃO ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = usersDB.getByEmail(email);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Registrar usuário (apenas para setup inicial - desabilitar em produção)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    const existingUser = usersDB.getByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = usersDB.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// ==================== ROTAS PROTEGIDAS (ADMIN) ====================

// Criar artigo
app.post('/api/articles', authenticateToken, (req, res) => {
  try {
    const article = articlesDB.create(req.body);
    res.status(201).json(article);
  } catch (error) {
    console.error('Erro ao criar artigo:', error);
    
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Já existe um artigo com este slug' });
    }
    
    res.status(500).json({ error: 'Erro ao criar artigo' });
  }
});

// Atualizar artigo
app.put('/api/articles/:id', authenticateToken, (req, res) => {
  try {
    const article = articlesDB.update(req.params.id, req.body);
    
    if (!article) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }
    
    res.json(article);
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error);
    res.status(500).json({ error: 'Erro ao atualizar artigo' });
  }
});

// Deletar artigo
app.delete('/api/articles/:id', authenticateToken, (req, res) => {
  try {
    const deleted = articlesDB.delete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Artigo não encontrado' });
    }
    
    res.json({ message: 'Artigo deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar artigo:', error);
    res.status(500).json({ error: 'Erro ao deletar artigo' });
  }
});

// ==================== INICIAR SERVIDOR ====================

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health: http://localhost:${PORT}/api/health`);
  console.log(`📰 Artigos: http://localhost:${PORT}/api/articles\n`);
});

export default app;
