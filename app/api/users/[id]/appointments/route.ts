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

// GET /api/users/[id]/appointments - Obter serviços para a agenda do usuário
export async function GET(
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
    
    const userId = params.id;
    
    // Verificar se o usuário está tentando acessar sua própria agenda
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado a acessar agenda de outro usuário" },
        { status: 403 }
      );
    }
    
    // Buscar serviços criados pelo usuário que estão em andamento (aceitos)
    const createdServices = await prisma.service.findMany({
      where: {
        creatorId: userId,
        status: 'IN_PROGRESS'
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        profession: true,
        bids: {
          where: {
            status: 'ACCEPTED'
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Buscar serviços onde o usuário é o prestador aceito
    const providedServices = await prisma.service.findMany({
      where: {
        status: 'IN_PROGRESS',
        bids: {
          some: {
            providerId: userId,
            status: 'ACCEPTED'
          }
        }
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        profession: true,
        bids: {
          where: {
            providerId: userId,
            status: 'ACCEPTED'
          },
          include: {
            provider: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });
    
    // Combinar os dois conjuntos de serviços
    const allAppointments = [
      ...createdServices,
      ...providedServices
    ];
    
    // Remover duplicatas (embora isso não deva acontecer neste caso)
    const uniqueAppointments = Array.from(
      new Map(allAppointments.map(appointment => [appointment.id, appointment])).values()
    );
    
    return NextResponse.json(uniqueAppointments);
  } catch (error) {
    console.error("Erro ao buscar agenda do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
