import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/favorites - Obter todos os favoritos do usuário
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{}> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        service: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            profession: true,
            images: {
              select: {
                url: true
              },
              take: 1
            }
          }
        }
      }
    });
    
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Adicionar um serviço aos favoritos
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{}> }
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
    const { serviceId } = body;
    
    if (!serviceId) {
      return NextResponse.json(
        { error: "ID do serviço é obrigatório" },
        { status: 400 }
      );
    }
    
    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se já está nos favoritos
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: session.user.id,
        serviceId
      }
    });
    
    if (existingFavorite) {
      return NextResponse.json(
        { error: "Serviço já está nos favoritos" },
        { status: 400 }
      );
    }
    
    // Adicionar aos favoritos
    const favorite = await prisma.favorite.create({
      data: {
        user: { connect: { id: session.user.id } },
        service: { connect: { id: serviceId } }
      }
    });
    
    return NextResponse.json(favorite);
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
