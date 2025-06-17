import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Buscando serviços do usuário com ID: ${params.id}`);
    
    // Usar findMany e o campo correto "creatorId" do schema
    const services = await prisma.service.findMany({
      where: {
        creatorId: params.id, // Corrigido para usar creatorId
      },
      select: {
        id: true,
        title: true,
        description: true,
        price: true, // Adicionado price
        date: true, // Adicionado date
        status: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true, // Corrigido para usar creatorId
        // Incluir apenas campos que existem com certeza
        creator: { // Corrigido para usar a relação correta "creator"
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
      },
    });

    return NextResponse.json(services);
  } catch (error: any) {
    console.error("Erro ao buscar serviços do usuário:", error);
    return NextResponse.json(
      { error: `Erro ao buscar serviços do usuário: ${error.message}` },
      { status: 500 }
    );
  }
}
