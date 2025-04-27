import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, about, city, state } = body;
    
    // Validação básica
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário já existe usando SQL bruto
    const existingUsers = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE email = ${email}
    `;
    
    if (existingUsers && (existingUsers as any[]).length > 0) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }
    
    // Hash da senha
    const hashedPassword = await hash(password, 10);
    
    // Gerar um ID único para o usuário
    const userId = crypto.randomUUID();
    const walletId = crypto.randomUUID();
    const now = new Date();
    
    // Criar o usuário usando SQL bruto
    await prisma.$executeRaw`
      INSERT INTO "User" (
        id, 
        name, 
        email, 
        password, 
        about, 
        city, 
        state, 
        "createdAt", 
        "updatedAt"
      )
      VALUES (
        ${userId}, 
        ${name}, 
        ${email}, 
        ${hashedPassword}, 
        ${about || null}, 
        ${city || null}, 
        ${state || null}, 
        ${now}, 
        ${now}
      )
    `;
    
    // Criar a carteira para o usuário
    await prisma.$executeRaw`
      INSERT INTO "Wallet" (
        id,
        balance,
        "userId",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${walletId},
        0,
        ${userId},
        ${now},
        ${now}
      )
    `;
    
    // Buscar o usuário recém-criado
    const users = await prisma.$queryRaw`
      SELECT 
        id, 
        name, 
        email, 
        about, 
        city, 
        state, 
        image, 
        "createdAt", 
        "updatedAt"
      FROM "User" 
      WHERE id = ${userId}
    `;
    
    if (!users || (users as any[]).length === 0) {
      throw new Error("Erro ao criar usuário");
    }
    
    const user = (users as any[])[0];
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
