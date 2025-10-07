import bcrypt from 'bcryptjs';
import { articlesDB, usersDB } from './database.js';

// Dados do artigo padrão
const defaultArticle = {
  slug: 'direitos-servidores-publicos-2024',
  title: 'Direitos dos Servidores Públicos em 2024: O Que Mudou?',
  excerpt: 'Análise completa das principais alterações na legislação que impactam os servidores públicos e como se adequar às novas regras.',
  content: `
    <p>A legislação brasileira referente aos servidores públicos passou por importantes atualizações em 2024, trazendo mudanças significativas que impactam diretamente os direitos e deveres desta categoria.</p>
    
    <h3>Principais Alterações Legislativas</h3>
    <p>Entre as principais mudanças, destacam-se as novas regras sobre progressão funcional, licenças médicas e aposentadoria. É fundamental que os servidores estejam atentos a essas modificações para garantir o pleno exercício de seus direitos.</p>
    
    <h3>Progressão na Carreira</h3>
    <p>As novas diretrizes estabelecem critérios mais claros para a progressão funcional, incluindo avaliações de desempenho periódicas e requisitos de capacitação continuada.</p>
    
    <h3>Licenças e Afastamentos</h3>
    <p>Foram implementadas novas modalidades de licença, incluindo licença para tratamento de saúde de familiar e licença para capacitação profissional.</p>
    
    <h3>Como Proceder</h3>
    <p>Recomendamos que todos os servidores públicos busquem orientação jurídica especializada para entender como essas mudanças afetam sua situação específica e quais medidas devem ser tomadas.</p>
  `,
  category: 'Direito Administrativo',
  type: 'Artigo',
  author: 'Dr. Mário Melo',
  readTime: '8 min',
  tags: ['Servidores Públicos', 'Legislação', 'Direitos', 'Atualização'],
  featured: true,
  date: '2024-01-15'
};

// Dados do usuário admin padrão
const defaultUser = {
  name: 'Mário Melo',
  email: 'mario.melo@mariomelo.adv.br',
  password: 'MarioNeto2134!', // Será hasheado
  role: 'admin'
};

const initDatabase = async () => {
  console.log('🔧 Inicializando banco de dados...\n');

  try {
    // Verificar se já existe artigo
    const existingArticles = articlesDB.getAll();
    
    if (existingArticles.length === 0) {
      console.log('📰 Criando artigo padrão...');
      articlesDB.create(defaultArticle);
      console.log('✅ Artigo padrão criado!\n');
    } else {
      console.log(`ℹ️  Já existem ${existingArticles.length} artigo(s) no banco\n`);
    }

    // Verificar se já existe usuário admin
    const existingUser = usersDB.getByEmail(defaultUser.email);
    
    if (!existingUser) {
      console.log('👤 Criando usuário admin padrão...');
      const hashedPassword = await bcrypt.hash(defaultUser.password, 10);
      usersDB.create({
        ...defaultUser,
        password: hashedPassword
      });
      console.log('✅ Usuário admin criado!');
      console.log('\n📧 Email: mario.melo@mariomelo.adv.br');
      console.log('🔑 Senha: MarioNeto2134!');
      console.log('\n⚠️  IMPORTANTE: Mantenha esta senha segura!\n');
    } else {
      console.log('ℹ️  Usuário admin já existe\n');
    }

    console.log('✅ Banco de dados inicializado com sucesso!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao inicializar banco:', error);
    process.exit(1);
  }
};

initDatabase();
