import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/user-favorites - Add a user to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { favoriteUserId } = body;

    if (!favoriteUserId) {
      return NextResponse.json(
        { error: "ID do usuário a ser favoritado não fornecido" },
        { status: 400 }
      );
    }

    if (favoriteUserId === session.user.id) {
      return NextResponse.json(
        { error: "Não é possível favoritar a si mesmo" },
        { status: 400 }
      );
    }

    // Check if the user to be favorited exists
    const userToFavorite = await prisma.user.findUnique({
      where: { id: favoriteUserId },
    });
    if (!userToFavorite) {
      return NextResponse.json(
        { error: "Usuário a ser favoritado não encontrado" },
        { status: 404 }
      );
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavorite.findUnique({
      where: {
        unique_user_favorite: {
          favoritedById: session.user.id,
          favoritedUserId: favoriteUserId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: "Usuário já está nos favoritos" },
        { status: 409 } // Conflict
      );
    }

    const newFavorite = await prisma.userFavorite.create({
      data: {
        favoritedById: session.user.id,
        favoritedUserId: favoriteUserId,
      },
      include: {
        favoritedUser: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json(newFavorite, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar usuário aos favoritos:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// GET /api/user-favorites - List current user's favorites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const favorites = await prisma.userFavorite.findMany({
      where: { favoritedById: session.user.id },
      include: {
        favoritedUser: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Erro ao listar usuários favoritos:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
