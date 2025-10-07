import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Criar/conectar ao banco de dados SQLite
const db = new Database(join(__dirname, 'mariomelo.db'));

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Criar tabelas
const createTables = () => {
  // Tabela de artigos
  db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT DEFAULT 'Artigo',
      image TEXT,
      author TEXT DEFAULT 'Dr. Mário Melo',
      readTime TEXT DEFAULT '5 min',
      tags TEXT,
      featured INTEGER DEFAULT 0,
      date TEXT NOT NULL,
      updatedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabela de usuários (para autenticação)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tabelas criadas/verificadas com sucesso');
};

// Inicializar banco de dados
createTables();

// Funções de artigos
export const articlesDB = {
  // Listar todos os artigos
  getAll: () => {
    const stmt = db.prepare('SELECT * FROM articles ORDER BY date DESC');
    const articles = stmt.all();
    
    // Converter tags de string para array
    return articles.map(article => ({
      ...article,
      tags: article.tags ? JSON.parse(article.tags) : [],
      featured: Boolean(article.featured)
    }));
  },

  // Buscar artigo por ID
  getById: (id) => {
    const stmt = db.prepare('SELECT * FROM articles WHERE id = ?');
    const article = stmt.get(id);
    
    if (article) {
      article.tags = article.tags ? JSON.parse(article.tags) : [];
      article.featured = Boolean(article.featured);
    }
    
    return article;
  },

  // Buscar artigo por slug
  getBySlug: (slug) => {
    const stmt = db.prepare('SELECT * FROM articles WHERE slug = ?');
    const article = stmt.get(slug);
    
    if (article) {
      article.tags = article.tags ? JSON.parse(article.tags) : [];
      article.featured = Boolean(article.featured);
    }
    
    return article;
  },

  // Criar novo artigo
  create: (article) => {
    const stmt = db.prepare(`
      INSERT INTO articles (
        slug, title, excerpt, content, category, type, image, 
        author, readTime, tags, featured, date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      article.slug,
      article.title,
      article.excerpt,
      article.content,
      article.category,
      article.type || 'Artigo',
      article.image || null,
      article.author || 'Dr. Mário Melo',
      article.readTime || '5 min',
      JSON.stringify(article.tags || []),
      article.featured ? 1 : 0,
      article.date
    );

    return { id: result.lastInsertRowid, ...article };
  },

  // Atualizar artigo
  update: (id, article) => {
    const stmt = db.prepare(`
      UPDATE articles SET
        slug = ?,
        title = ?,
        excerpt = ?,
        content = ?,
        category = ?,
        type = ?,
        image = ?,
        author = ?,
        readTime = ?,
        tags = ?,
        featured = ?,
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      article.slug,
      article.title,
      article.excerpt,
      article.content,
      article.category,
      article.type,
      article.image,
      article.author,
      article.readTime,
      JSON.stringify(article.tags || []),
      article.featured ? 1 : 0,
      id
    );

    return articlesDB.getById(id);
  },

  // Deletar artigo
  delete: (id) => {
    const stmt = db.prepare('DELETE FROM articles WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }
};

// Funções de usuários
export const usersDB = {
  // Buscar usuário por email
  getByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  // Criar usuário
  create: (user) => {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      user.name,
      user.email,
      user.password,
      user.role || 'admin'
    );

    return { id: result.lastInsertRowid, ...user };
  }
};

export default db;
