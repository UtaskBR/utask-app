import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    
    // Aguardar a resolução da Promise de params
    const resolvedParams = await params;
    const favoriteId = resolvedParams.id;
    
    const favorite = await prisma.favorite.findUnique({
      where: { id: favoriteId },
      select: { userId: true },
    });
    
    if (!favorite) {
      return NextResponse.json({ error: "Favorito não encontrado" }, { status: 404 });
    }
    
    if (favorite.userId !== session.user.id) {
      return NextResponse.json({ error: "Não autorizado a remover este favorito" }, { status: 403 });
    }
    
    await prisma.favorite.delete({ where: { id: favoriteId } });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
