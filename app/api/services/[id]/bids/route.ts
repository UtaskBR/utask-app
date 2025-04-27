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

// GET /api/services/[id]/bids - Listar todas as propostas para um serviço
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const serviceId = params.id;
    
    const bids = await prisma.serviceBid.findMany({
      where: { serviceId },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            image: true,
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    
    return NextResponse.json(bids);
  } catch (error) {
    console.error("Erro ao buscar propostas:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}

// POST /api/services/[id]/bids - Criar uma nova proposta para um serviço
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
    
    const serviceId = params.id;
    const body = await request.json();
    const { value, message, proposedDate } = body;
    
    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { 
        id: true,
        creatorId: true,
        status: true
      }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário não está fazendo proposta para seu próprio serviço
    if (service.creatorId === session.user.id) {
      return NextResponse.json(
        { error: "Não é possível fazer proposta para seu próprio serviço" },
        { status: 400 }
      );
    }
    
    // Verificar se o serviço está aberto para propostas
    if (service.status !== "OPEN") {
      return NextResponse.json(
        { error: "Este serviço não está aberto para propostas" },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário já fez uma proposta para este serviço
    const existingBid = await prisma.serviceBid.findFirst({
      where: {
        serviceId,
        providerId: session.user.id
      }
    });
    
    if (existingBid) {
      return NextResponse.json(
        { error: "Você já fez uma proposta para este serviço" },
        { status: 400 }
      );
    }
    
    // Criar a proposta
    const bid = await prisma.serviceBid.create({
      data: {
        value,
        message,
        proposedDate: proposedDate ? new Date(proposedDate) : null,
        service: {
          connect: {
            id: serviceId
          }
        },
        provider: {
          connect: {
            id: session.user.id
          }
        }
      }
    });
    
    // Criar notificação para o criador do serviço
    await prisma.notification.create({
      data: {
        type: "BID",
        message: `Nova proposta para seu serviço: ${service.id}`,
        receiver: {
          connect: {
            id: service.creatorId
          }
        },
        sender: {
          connect: {
            id: session.user.id
          }
        }
      }
    });
    
    return NextResponse.json(bid, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar proposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
