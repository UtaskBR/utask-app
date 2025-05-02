
const { PrismaClient } = require('@prisma/client');
const { professions } = require('@/prisma/seed/professions');

const prisma = new PrismaClient();

async function main() {
  await prisma.profession.createMany({
    data: professions,
    skipDuplicates: true,
  });
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
