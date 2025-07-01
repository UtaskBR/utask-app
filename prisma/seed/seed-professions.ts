// prisma/seed/seed-all.ts
import { PrismaClient, Role } from '@prisma/client';
import { professions } from './professions.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedProfessions() {
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
      console.log(`Profissão já existe: ${profession.name}`);
    }
  }
  console.log('Seed de profissões concluído.');
}

async function seedAdminUser() {
  console.log('Iniciando seed do usuário administrador...');
  const adminEmail = 'leonardo.ferreira@utask.com.br';
  const adminCpf = '41740372808'; // Ensure this is unique or handle conflicts

  const existingAdmin = await prisma.user.findFirst({
    where: { OR: [{ email: adminEmail }, { cpf: adminCpf }] },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('SenhaPadrao123!', 10); // Use a strong default password
    await prisma.user.create({
      data: {
        email: adminEmail,
        cpf: adminCpf,
        name: 'Administrador Utask',
        password: hashedPassword,
        role: Role.ADMIN,
        emailIsVerified: true, // Admin email is considered verified
      },
    });
    console.log(`Usuário administrador criado: ${adminEmail}`);
  } else {
    console.log(`Usuário administrador já existe: ${adminEmail} ou CPF ${adminCpf}`);
    // Optionally, update the existing user to ensure it has ADMIN role
    if (existingAdmin.role !== Role.ADMIN) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: Role.ADMIN, emailIsVerified: true }, // Also ensure email is verified
      });
      console.log(`Usuário ${adminEmail} atualizado para ADMIN.`);
    }
  }
}

async function seedPlatformWallet() {
  console.log('Iniciando seed da carteira da plataforma...');
  const platformName = "UTASK_PLATFORM"; // Unique identifier for the platform

  let platform = await prisma.platform.findUnique({
    where: { name: platformName },
  });

  if (!platform) {
    platform = await prisma.platform.create({
      data: {
        name: platformName,
        description: "Carteira principal da plataforma Utask",
      },
    });
    console.log(`Plataforma ${platformName} criada.`);
  } else {
    console.log(`Plataforma ${platformName} já existe.`);
  }

  // Ensure the platform has a wallet
  const existingWallet = await prisma.wallet.findUnique({
    where: { platformId: platform.id },
  });

  if (!existingWallet) {
    await prisma.wallet.create({
      data: {
        platformId: platform.id,
        balance: 0,
        reservedBalance: 0,
      },
    });
    console.log(`Carteira criada para a plataforma ${platformName}.`);
  } else {
    console.log(`Carteira já existe para a plataforma ${platformName}.`);
  }
}

async function main() {
  await seedProfessions();
  await seedAdminUser();
  await seedPlatformWallet();
  console.log('Seed completo!');
}

main()
  .catch((e) => {
    console.error('Erro no processo de seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
