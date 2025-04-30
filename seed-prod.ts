// seed-prod.ts
import { PrismaClient } from '@prisma/client';
import { professions } from './prisma/seed/professions';

const prisma = new PrismaClient();

async function main() {
  for (const profession of professions) {
    await prisma.profession.upsert({
      where: { name: profession.name },
      update: {},
      create: { name: profession.name, icon: profession.icon },
    });
  }
}

main()
  .then(async () => {
    console.log("Seed realizado com sucesso!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
