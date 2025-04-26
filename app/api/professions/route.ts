import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/professions - Listar todas as profissões
export async function GET(request: NextRequest) {
  try {
    const professions = await prisma.profession.findMany({
      orderBy: {
        name: "asc"
      }
    });
    
    return NextResponse.json(professions);
  } catch (error) {
    console.error("Erro ao buscar profissões:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// POST /api/professions - Criar uma nova profissão
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name } = body;
    
    // Validação básica
    if (!name) {
      return NextResponse.json(
        { error: "Nome da profissão não fornecido" },
        { status: 400 }
      );
    }
    
    // Verificar se a profissão já existe
    const existingProfession = await prisma.profession.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive"
        }
      }
    });
    
    if (existingProfession) {
      return NextResponse.json(
        { error: "Profissão já existe" },
        { status: 400 }
      );
    }
    
    // Criar a profissão
    const profession = await prisma.profession.create({
      data: {
        name
      }
    });
    
    return NextResponse.json(profession, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar profissão:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
