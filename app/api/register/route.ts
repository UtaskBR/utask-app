import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hash } from "bcryptjs";

// Função simples para gerar um ID único
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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
    
    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: "Email já cadastrado" },
        { status: 400 }
      );
    }
    
    // Hash da senha
    const hashedPassword = await hash(password, 10);
    
    // Gerar IDs sem dependências externas
    const userId = generateId();
    
    // Criar o usuário usando Prisma Client
    const user = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        password: hashedPassword,
        about: about || null,
        city: city || null,
        state: state || null,
        wallet: {
          create: {
            balance: 0
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        city: true,
        state: true,
        image: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
