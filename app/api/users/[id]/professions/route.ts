import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";


// Tipo correto para os parâmetros no Next.js 15
type RouteParams = {
  params: {
    id: string;
  };
};

// GET /api/users/[id]/professions - Listar profissões de um usuário
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = params;
    
    // Buscar profissões do usuário
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        professions: true,
      },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(user.professions);
  } catch (error) {
    console.error("Erro ao buscar profissões do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id]/professions - Atualizar profissões do usuário
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Verificar autenticação
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário está tentando modificar seu próprio perfil
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Não autorizado a modificar este perfil" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { professionIds } = body;
    
    // Validação básica
    if (!professionIds || !Array.isArray(professionIds) {
      return NextResponse.json(
        { error: "Lista de IDs de profissões não fornecida ou inválida" },
        { status: 400 }
      );
    }
    
    // Verificar se todas as profissões existem
    const professions = await prisma.profession.findMany({
      where: {
        id: {
          in: professionIds,
        },
      },
    });
    
    if (professions.length !== professionIds.length) {
      return NextResponse.json(
        { error: "Uma ou mais profissões não foram encontradas" },
        { status: 404 }
      );
    }
    
    // Atualizar profissões do usuário (substituir todas)
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        professions: {
          set: professionIds.map(profId => ({ id: profId })),
        },
      },
      include: {
        professions: true,
      },
    });
    
    return NextResponse.json(updatedUser.professions);
  } catch (error) {
    console.error("Erro ao atualizar profissões do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// POST /api/users/[id]/professions - Adicionar profissão ao usuário
export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    
    // Verificar autenticação
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário está tentando modificar seu próprio perfil
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Não autorizado a modificar este perfil" },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { professionId } = body;
    
    // Validação básica
    if (!professionId) {
      return NextResponse.json(
        { error: "ID da profissão não fornecido" },
        { status: 400 }
      );
    }
    
    // Verificar se a profissão existe
    const profession = await prisma.profession.findUnique({
      where: { id: professionId },
    });
    
    if (!profession) {
      return NextResponse.json(
        { error: "Profissão não encontrada" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário já tem esta profissão
    const userWithProfession = await prisma.user.findFirst({
      where: {
        id,
        professions: {
          some: {
            id: professionId,
          },
        },
      },
    });
    
    if (userWithProfession) {
      return NextResponse.json(
        { error: "Usuário já possui esta profissão" },
        { status: 400 }
      );
    }
    
    // Adicionar profissão ao usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        professions: {
          connect: {
            id: professionId,
          },
        },
      },
      include: {
        professions: true,
      },
    });
    
    return NextResponse.json(updatedUser.professions);
  } catch (error) {
    console.error("Erro ao adicionar profissão ao usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id]/professions - Remover profissão do usuário
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const professionId = url.searchParams.get("professionId");
    
    // Verificar autenticação
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Verificar se o usuário está tentando modificar seu próprio perfil
    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Não autorizado a modificar este perfil" },
        { status: 403 }
      );
    }
    
    // Validação básica
    if (!professionId) {
      return NextResponse.json(
        { error: "ID da profissão não fornecido" },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário tem esta profissão
    const userWithProfession = await prisma.user.findFirst({
      where: {
        id,
        professions: {
          some: {
            id: professionId,
          },
        },
      },
    });
    
    if (!userWithProfession) {
      return NextResponse.json(
        { error: "Usuário não possui esta profissão" },
        { status: 400 }
      );
    }
    
    // Remover profissão do usuário
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        professions: {
          disconnect: {
            id: professionId,
          },
        },
      },
      include: {
        professions: true,
      },
    });
    
    return NextResponse.json(updatedUser.professions);
  } catch (error) {
    console.error("Erro ao remover profissão do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
