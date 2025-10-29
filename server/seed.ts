import { storage } from './storage.js';
import { AGENT_CARDS_DATA } from '../constants.js';
import { hashPassword } from './auth.js';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar cliente padrão
    const existingClients = await storage.getClients();
    let clientId;
    
    if (existingClients.length === 0) {
      const client = await storage.createClient({
        name: 'Groovia Default',
        domain: 'groovia.com',
        isActive: true,
        settings: {}
      });
      clientId = client.id;
      console.log('✅ Cliente criado:', client.id);
    } else {
      clientId = existingClients[0].id;
      console.log('ℹ️  Usando cliente existente:', clientId);
    }

    // Criar usuário admin padrão
    const adminUser = await storage.getUserByEmail('admin@groovia.com');
    if (!adminUser) {
      const hashedPassword = await hashPassword('admin123');
      await storage.createUser({
        name: 'Administrador',
        email: 'admin@groovia.com',
        password: hashedPassword,
        role: 'admin',
        avatar: 'https://i.pravatar.cc/150?img=33',
        clientId: clientId
      });
      console.log('✅ Usuário admin criado com senha criptografada');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    // Criar usuário normal padrão
    const normalUser = await storage.getUserByEmail('usuario@groovia.com');
    if (!normalUser) {
      const hashedPassword = await hashPassword('user123');
      await storage.createUser({
        name: 'João Silva',
        email: 'usuario@groovia.com',
        password: hashedPassword,
        role: 'user',
        avatar: 'https://i.pravatar.cc/150?img=12',
        clientId: clientId
      });
      console.log('✅ Usuário normal criado com senha criptografada');
    } else {
      console.log('ℹ️  Usuário normal já existe');
    }

    // Popular agentes do constants.ts
    const existingAgents = await storage.getAgents(clientId);
    
    if (existingAgents.length === 0) {
      for (const agentData of AGENT_CARDS_DATA) {
        await storage.createAgent({
          internalCode: agentData.internalCode,
          title: agentData.title,
          description: agentData.description,
          agentType: agentData.agentType,
          integrations: agentData.integrations,
          isActive: true,
          clientId: clientId
        });
      }
      console.log(`✅ ${AGENT_CARDS_DATA.length} agentes criados`);
    } else {
      console.log(`ℹ️  ${existingAgents.length} agentes já existem`);
    }

    console.log('🎉 Seed concluído com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    throw error;
  }
}

seedDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
