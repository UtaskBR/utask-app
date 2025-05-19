import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids/[bidId]/accept
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; bidId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: serviceId, bidId } = params;

    const bid = await prisma.bid.findUnique({
      where: { id: bidId },
      include: {
        service: {
          select: {
            id: true,
            creatorId: true,
            status: true,
            title: true
          }
        },
        provider: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!bid || bid.serviceId !== serviceId) {
      return NextResponse.json({ error: "Proposta não encontrada" }, { status: 404 });
    }

    if (bid.service.creatorId !== session.user.id) {
      return NextResponse.json({ error: "Apenas o criador do serviço pode aceitar propostas" }, { status: 403 });
    }

    // Formatar valores para exibição
    const formattedPrice = bid.price ? `R$ ${bid.price.toFixed(2)}` : "valor não especificado";
    
    // Formatar datas para exibição
    let formattedDate = "data não especificada";
    if (bid.proposedDate) {
      const date = new Date(bid.proposedDate);
      formattedDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Atualizar status da proposta aceita
    const updatedBid = await prisma.bid.update({
      where: { id: bidId },
      data: { status: "ACCEPTED" }
    });

    // Atualizar o status do serviço
    await prisma.service.update({
      where: { id: serviceId },
      data: { 
        status: "IN_PROGRESS",
        price: bid.price, // <-- valor aceito
        date: bid.proposedDate // <-- data combinada
      }
    });

    // Rejeitar todas as outras propostas
    await prisma.bid.updateMany({
      where: {
        serviceId,
        id: { not: bidId }
      },
      data: { status: "REJECTED" }
    });

    // Notificação para o prestador com detalhes completos
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "ACCEPTANCE",
        title: "Proposta Aceita",
        message: `Sua proposta para o serviço "${bid.service.title}" foi aceita! Valor: ${formattedPrice}. Data/hora: ${formattedDate}. O serviço está agora em andamento.`,
        receiverId: bid.provider.id,
        senderId: session.user.id,
        bidId: bid.id,
        serviceId: bid.service.id,
        read: false
      }
    });

    return NextResponse.json(updatedBid);
  } catch (error) {
    console.error("Erro ao aceitar proposta:", error);
    return NextResponse.json(
      { error: "Erro interno: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
