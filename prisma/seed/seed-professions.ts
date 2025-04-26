// prisma/seed-professions.ts
import { PrismaClient } from '@prisma/client';
const { professions } = require('./seed/professions');

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de profissões...');

  // Adicionar cada profissão, ignorando se já existir
  for (const profession of professions) {
    try {
      // Verificar se a profissão já existe
      const existing = await prisma.profession.findFirst({
        where: {
          name: {
            equals: profession.name,
            mode: 'insensitive'
          }
        }
      });

      if (!existing) {
        await prisma.profession.create({
          data: profession,
        });
        console.log(`Profissão criada: ${profession.name}`);
      } else {
        console.log(`Profissão já existe: ${profession.name}`);
      }
    } catch (error) {
      console.error(`Erro ao criar profissão ${profession.name}:`, error);
    }
  }

  console.log('Seed de profissões concluído!');
}

main()
  .catch((e) => {
    console.error('Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
