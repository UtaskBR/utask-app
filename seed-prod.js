const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Caminho absoluto até professions.js na pasta prisma/seed
const { professions } = require(path.join(__dirname, 'prisma', 'seed', 'professions.js'));

const prisma = new PrismaClient();
console.log("Profissões carregadas:", professions);

async function main() {
  await prisma.profession.createMany({
    data: professions,
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    console.log("✅ Seed realizado com sucesso!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro no seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
