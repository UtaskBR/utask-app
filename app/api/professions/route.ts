import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/professions - Listar todas as profissões
export async function GET(request: NextRequest) {
  try {
    // Buscar profissões, incluindo o campo icon
    const professions = await prisma.profession.findMany({
      select: {
        id: true,
        name: true,
        icon: true, // Incluir o campo icon agora que ele deve existir
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc"
      }
    });
    
    return NextResponse.json(professions);
  } catch (error: any) {
    console.error("Erro ao buscar profissões:", error);
    // Verificar se o erro é por coluna inexistente e retornar array vazio como fallback?
    if (error.code === 'P2022') { // Prisma error code for missing column
      console.warn("Coluna 'icon' pode não existir no banco de dados. Retornando profissões sem ícone.");
      const professionsFallback = await prisma.profession.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: {
          name: "asc"
        }
      });
      // Adicionar campo icon vazio para compatibilidade
      const professionsWithEmptyIcon = professionsFallback.map(p => ({ ...p, icon: null }));
      return NextResponse.json(professionsWithEmptyIcon);
    }
    return NextResponse.json(
      { error: `Erro ao processar a solicitação: ${error.message}` },
      { status: 500 }
    );
  }
}

// POST /api/professions - Criar uma nova profissão (mantido como estava)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { name, icon } = body; // Permitir adicionar ícone opcionalmente
    
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
        name,
        icon: icon || null // Adicionar ícone se fornecido
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

