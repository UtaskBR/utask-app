import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// DELETE /api/user-favorites/[favoriteUserId] - Remove a user from favorites
export async function DELETE(
  request: NextRequest,
  { params }: { params: { favoriteUserId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { favoriteUserId } = params;

    if (!favoriteUserId) {
      return NextResponse.json(
        { error: "ID do usuário favorito não fornecido" },
        { status: 400 }
      );
    }

    try {
      await prisma.userFavorite.delete({
        where: {
          unique_user_favorite: {
            favoritedById: session.user.id,
            favoritedUserId: favoriteUserId,
          },
        },
      });
      // Prisma's delete throws an error if the record is not found by default (P2025).
      // If we reach here, it means deletion was successful.
      return new NextResponse(null, { status: 204 }); // No Content
    } catch (error: any) {
      // Check if the error is because the record was not found
      if (error.code === 'P2025') {
        // Not found is acceptable for a DELETE request (idempotency)
        return new NextResponse(null, { status: 204 });
      }
      // For other errors, log and return 500
      console.error("Erro ao remover usuário dos favoritos:", error);
      return NextResponse.json(
        { error: "Erro ao processar a solicitação de exclusão" },
        { status: 500 }
      );
    }
  } catch (error) { // Catch errors from session fetching or param destructuring
    console.error("Erro geral na função DELETE de favoritos:", error);
    return NextResponse.json(
      { error: "Erro geral ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// GET /api/user-favorites/[favoriteUserId] - Check favorite status for a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { favoriteUserId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { favoriteUserId } = params;

    if (!favoriteUserId) {
      return NextResponse.json(
        { error: "ID do usuário favorito não fornecido" },
        { status: 400 }
      );
    }

    // Prevent checking favorite status for oneself
    if (favoriteUserId === session.user.id) {
        return NextResponse.json({ isFavorite: false }); // Or a specific error/status
    }

    const favorite = await prisma.userFavorite.findUnique({
      where: {
        unique_user_favorite: {
          favoritedById: session.user.id,
          favoritedUserId: favoriteUserId,
        },
      },
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error("Erro ao verificar status de favorito:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
