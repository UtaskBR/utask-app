import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE /api/favorites/[id] - Remover um serviço dos favoritos
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const favoriteId = params.id;
    
    // Verificar se o favorito existe e pertence ao usuário
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
      select: { userId: true }
    });
    
    if (!favorite) {
      return NextResponse.json(
        { error: "Favorito não encontrado" },
        { status: 404 }
      );
    }
    
    if (favorite.userId !== userId) {
      return NextResponse.json(
        { error: "Não autorizado a remover este favorito" },
        { status: 403 }
      );
    }
    
    // Remover dos favoritos
    await prisma.favorite.delete({
      where: { id: favoriteId }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
