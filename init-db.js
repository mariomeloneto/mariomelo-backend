/* eslint-env node */
import bcrypt from 'bcryptjs';
import { usersDB } from './database.js';

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
