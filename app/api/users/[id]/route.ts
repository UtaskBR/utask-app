import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Buscando usuário com ID: ${params.id}`);
    
    // Usar findUnique em vez de SQL bruto para evitar problemas com tabelas inexistentes
    const user = await prisma.user.findUnique({
      where: {
        id: params.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        about: true,
        city: true,
        state: true,
        image: true,
        emailVerified: true,
        createdAt: true,
        // Remover referências a tabelas ou colunas que podem não existir
        // profession: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("[USER_GET_ERROR]", error);
    return NextResponse.json(
      { error: `Erro ao buscar usuário: ${error.message}` },
      { status: 500 }
    );
  }
}
