import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// GET /api/agenda - Buscar serviços para a agenda do usuário
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
    const url = new URL(request.url);
    const filter = url.searchParams.get("filter") || "all"; // all, upcoming, past

    // Construir a consulta base
    const baseQuery = {
      OR: [
        { creatorId: userId }, // Serviços criados pelo usuário
        { 
          bids: {
            some: {
              providerId: userId,
              status: "ACCEPTED"
            }
          }
        } // Serviços onde o usuário é o prestador aceito
      ],
      // Não mostrar serviços cancelados na agenda
      NOT: {
        status: "CANCELLED"
      }
    };

    // Adicionar filtro de data se necessário
    let dateFilter = {};
    const now = new Date();

    if (filter === "upcoming") {
      dateFilter = {
        OR: [
          { date: { gte: now } },
          { date: null }
        ]
      };
    } else if (filter === "past") {
      dateFilter = {
        date: { lt: now }
      };
    }

    // Combinar consultas
    const whereClause = {
      ...baseQuery,
      ...(filter !== "all" ? dateFilter : {})
    };

    // Buscar serviços
    const services = await prisma.service.findMany({
      where: whereClause,
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
            status: "ACCEPTED"
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
        date: "asc"
      }
    });

    // Processar os resultados para incluir o prestador de serviço
    const processedServices = services.map(service => {
      // Encontrar a proposta aceita (se houver)
      const acceptedBid = service.bids.find(bid => bid.status === "ACCEPTED");
      
      // Adicionar informações do prestador
      const provider = acceptedBid?.provider || null;
      
      // Formatar data e valor para exibição
      const formattedDate = service.date 
        ? format(new Date(service.date), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
        : null;
      
      const formattedPrice = service.price !== null
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.price)
        : null;

      return {
        ...service,
        provider,
        formattedDate,
        formattedPrice,
        bids: undefined // Remover bids para simplificar a resposta
      };
    });

    return NextResponse.json(processedServices);
  } catch (error) {
    console.error("Erro ao buscar agenda:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
