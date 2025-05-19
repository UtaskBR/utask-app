import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/agenda - Buscar serviços agendados do usuário (como criador ou prestador)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Buscar serviços onde o usuário é o criador e tem uma proposta aceita
    const createdServices = await prisma.service.findMany({
      where: {
        creatorId: userId,
        status: {
          in: ['IN_PROGRESS', 'COMPLETED']
        },
        bids: {
          some: {
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
      }
    });
    
    // Buscar serviços onde o usuário é o prestador aceito
    const providedServices = await prisma.service.findMany({
      where: {
        status: {
          in: ['IN_PROGRESS', 'COMPLETED']
        },
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
      }
    });
    
    // Formatar os serviços criados para incluir informações do prestador
    const formattedCreatedServices = createdServices.map(service => {
      const acceptedBid = service.bids[0]; // Deve haver apenas uma proposta aceita
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        date: service.date,
        address: service.address,
        status: service.status,
        creatorId: service.creatorId,
        creator: service.creator,
        provider: acceptedBid ? acceptedBid.provider : null
      };
    });
    
    // Formatar os serviços prestados para incluir informações do prestador
    const formattedProvidedServices = providedServices.map(service => {
      const acceptedBid = service.bids[0]; // Deve haver apenas uma proposta aceita
      return {
        id: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        date: service.date,
        address: service.address,
        status: service.status,
        creatorId: service.creatorId,
        creator: service.creator,
        provider: acceptedBid ? acceptedBid.provider : null
      };
    });
    
    // Combinar todos os serviços
    const allServices = [...formattedCreatedServices, ...formattedProvidedServices];
    
    return NextResponse.json(allServices);
  } catch (error) {
    console.error("Erro ao buscar serviços agendados:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
