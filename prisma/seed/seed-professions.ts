// prisma/seed/seed-professions.ts
import { PrismaClient } from '@prisma/client';
import { professions } from './professions.js';


const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de profissões...');

  for (const profession of professions) {
    const existing = await prisma.profession.findFirst({
      where: {
        name: {
          equals: profession.name,
          mode: 'insensitive',
        },
      },
    });

    if (!existing) {
      await prisma.profession.create({ data: profession });
      console.log(`Profissão criada: ${profession.name}`);
    } else {
      console.log(`Já existe: ${profession.name}`);
    }
  }

  console.log('Seed de profissões concluído!');
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
