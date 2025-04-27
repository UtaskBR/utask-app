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

// POST /api/users/[id]/reviews - Criar uma avaliação para um usuário
export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const receiverId = params.id;
    const giverId = session.user.id;
    
    // Verificar se o usuário não está avaliando a si mesmo
    if (receiverId === giverId) {
      return NextResponse.json(
        { error: "Não é possível avaliar a si mesmo" },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { rating, comment } = body;
    
    // Validação básica
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Avaliação deve ser entre 1 e 5" },
        { status: 400 }
      );
    }
    
    // Criar a avaliação
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        receiver: {
          connect: {
            id: receiverId
          }
        },
        giver: {
          connect: {
            id: giverId
          }
        }
      }
    });
    
    // Atualizar a classificação média do usuário
    const reviews = await prisma.review.findMany({
      where: {
        receiverId
      },
      select: {
        rating: true
      }
    });
    
    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    
    await prisma.user.update({
      where: {
        id: receiverId
      },
      data: {
        rating: averageRating
      }
    });
    
    // Criar notificação
    await prisma.notification.create({
      data: {
        type: "REVIEW",
        message: "Você recebeu uma nova avaliação",
        receiver: {
          connect: {
            id: receiverId
          }
        },
        sender: {
          connect: {
            id: giverId
          }
        }
      }
    });
    
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar avaliação:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// GET /api/users/[id]/reviews - Listar avaliações de um usuário
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const receiverId = params.id;
    
    const reviews = await prisma.review.findMany({
      where: {
        receiverId
      },
      include: {
        giver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
