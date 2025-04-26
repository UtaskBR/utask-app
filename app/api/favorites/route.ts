import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

// GET /api/favorites - Obter favoritos do usuário logado
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Buscar os favoritos do usuário
    const favorites = await prisma.favorite.findMany({
      where: {
        userId
      },
      include: {
        service: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true,
                rating: true
              }
            },
            profession: true,
            photos: {
              take: 1
            }
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(favorites);
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Adicionar um serviço aos favoritos
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    const { serviceId } = body;
    
    // Validação básica
    if (!serviceId) {
      return NextResponse.json(
        { error: "ID do serviço não fornecido" },
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
    
    // Verificar se o serviço já está nos favoritos
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
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
        user: {
          connect: {
            id: userId
          }
        },
        service: {
          connect: {
            id: serviceId
          }
        }
      }
    });
    
    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
