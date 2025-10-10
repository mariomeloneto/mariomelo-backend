import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Conectar ao banco de dados
const db = new Database(join(__dirname, 'mariomelo.db'));

console.log('🗑️  Removendo todos os artigos do banco de dados...\n');

try {
  const stmt = db.prepare('DELETE FROM articles');
  const result = stmt.run();
  
  console.log(`✅ ${result.changes} artigo(s) removido(s) com sucesso!\n`);
  
  // Verificar se está vazio
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM articles');
  const { count } = countStmt.get();
  
  console.log(`📊 Total de artigos no banco: ${count}\n`);
  
  process.exit(0);
} catch (error) {
  console.error('❌ Erro ao limpar artigos:', error);
  process.exit(1);
}
