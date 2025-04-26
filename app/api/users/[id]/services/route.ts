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

// GET /api/users/[id]/services - Obter todos os serviços relacionados ao usuário
export async function GET(
  request: NextRequest,
  context: RouteParams
)
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = context.params.id;
    
    // Verificar se o usuário está tentando acessar seus próprios serviços
    if (userId !== session.user.id) {
      return NextResponse.json(
        { error: "Não autorizado a acessar serviços de outro usuário" },
        { status: 403 }
      );
    }
    
    // Buscar serviços criados pelo usuário
    const createdServices = await prisma.service.findMany({
      where: {
        creatorId: userId
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
        createdAt: 'desc'
      }
    });
    
    // Buscar serviços onde o usuário fez propostas (candidaturas)
    const servicesWithUserBids = await prisma.service.findMany({
      where: {
        bids: {
          some: {
            providerId: userId
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
            providerId: userId
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
        createdAt: 'desc'
      }
    });
    
    // Adicionar a proposta do usuário como uma propriedade separada para facilitar o acesso no frontend
    const servicesWithUserBidsFormatted = servicesWithUserBids.map(service => ({
      ...service,
      userBid: service.bids[0] // A consulta já filtra apenas as propostas do usuário
    }));
    
    // Combinar os dois conjuntos de serviços e remover duplicatas
    const allServices = [
      ...createdServices,
      ...servicesWithUserBidsFormatted
    ];
    
    // Remover duplicatas (serviços que o usuário criou e também fez proposta)
    const uniqueServices = Array.from(
      new Map(allServices.map(service => [service.id, service])).values()
    );
    
    return NextResponse.json(uniqueServices);
  } catch (error) {
    console.error("Erro ao buscar serviços do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
