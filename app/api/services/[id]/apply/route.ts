import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/apply - Candidatar-se diretamente para um serviço (aceitar termos originais)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const serviceId = params.id;
    const userId = session.user.id;
    
    // Verificar se o serviço existe e está aberto
    const service = await prisma.service.findUnique({
      where: { 
        id: serviceId,
        status: "OPEN" // Apenas serviços abertos podem receber candidaturas
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        bids: {
          where: {
            providerId: userId
          }
        }
      }
    });
    
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado ou não está disponível para candidaturas" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário não é o criador do serviço
    if (service.creatorId === userId) {
      return NextResponse.json(
        { error: "Você não pode se candidatar ao seu próprio serviço" },
        { status: 400 }
      );
    }
    
    // Verificar se o usuário já tem uma proposta para este serviço
    if (service.bids.length > 0) {
      return NextResponse.json(
        { error: "Você já enviou uma proposta para este serviço" },
        { status: 400 }
      );
    }
    
    // Buscar informações do prestador
    const provider = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true
      }
    });
    
    if (!provider) {
      return NextResponse.json(
        { error: "Perfil de prestador não encontrado" },
        { status: 404 }
      );
    }
    
    // Criar uma proposta (bid) com os termos originais do serviço
    const bid = await prisma.bid.create({
      data: {
        providerId: userId,
        serviceId: serviceId,
        status: "PENDING",
        price: service.price, // Aceita o preço original
        proposedDate: service.date, // Aceita a data original
        message: "Aceito realizar o serviço conforme solicitado." // Mensagem padrão
      }
    });
    
    // Criar notificação para o criador do serviço
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "BID_RECEIVED",
        title: "Nova Candidatura para seu Serviço",
        message: `${provider.name || "Um prestador"} aceitou realizar seu serviço "${service.title}" com os termos originais.`,
        receiverId: service.creatorId,
        senderId: userId,
        serviceId: serviceId,
        bidId: bid.id
      }
    });
    
    return NextResponse.json({
      message: "Candidatura enviada com sucesso",
      bid: {
        id: bid.id,
        status: bid.status,
        price: bid.price,
        proposedDate: bid.proposedDate
      }
    });
    
  } catch (error: any) {
    console.error("Erro ao processar candidatura:", error);
    return NextResponse.json(
      { error: "Erro ao processar a candidatura: " + error.message },
      { status: 500 }
    );
  }
}
