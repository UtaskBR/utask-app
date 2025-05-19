import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/bids
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const serviceId = params.id;
    const { price, proposedDate, message } = await request.json();

    // Verificar se o serviço existe
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { id: true, creatorId: true, title: true, status: true, price: true, date: true }
    });

    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
    }

    if (service.creatorId === session.user.id) {
      return NextResponse.json({ error: "Você não pode propor em seu próprio serviço" }, { status: 403 });
    }

    if (service.status !== "OPEN") {
      return NextResponse.json({ error: "Serviço indisponível para propostas" }, { status: 400 });
    }

    // Impedir propostas duplicadas
    const alreadyBid = await prisma.bid.findFirst({
      where: {
        serviceId,
        providerId: session.user.id
      }
    });

    if (alreadyBid) {
      return NextResponse.json({ error: "Você já fez uma proposta para este serviço" }, { status: 400 });
    }

    // Buscar informações do prestador
    const provider = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true }
    });

    // Formatar valores para exibição
    const formattedPrice = price ? `R$ ${parseFloat(price).toFixed(2)}` : "valor não especificado";
    const originalPrice = service.price ? `R$ ${service.price.toFixed(2)}` : "valor não especificado";
    
    // Formatar datas para exibição
    let formattedProposedDate = "data não especificada";
    if (proposedDate) {
      const date = new Date(proposedDate);
      formattedProposedDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    let formattedOriginalDate = "data não especificada";
    if (service.date) {
      const date = new Date(service.date);
      formattedOriginalDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Criar a proposta
    const bid = await prisma.bid.create({
      data: {
        id: crypto.randomUUID(),
        serviceId,
        providerId: session.user.id,
        price: price,
        proposedDate: proposedDate ? new Date(proposedDate) : null,
        message,
        status: "PENDING"
      }
    });

    // Notificar o criador do serviço com detalhes completos
    await prisma.notification.create({
      data: {
        id: crypto.randomUUID(),
        type: "BID",
        title: "Nova proposta recebida",
        message: `Você recebeu uma nova proposta para o serviço "${service.title}" de ${provider?.name || "um prestador"}. 
        Valor proposto: ${formattedPrice} (original: ${originalPrice}). 
        Data proposta: ${formattedProposedDate} (original: ${formattedOriginalDate}).
        Mensagem: "${message || "Nenhuma mensagem adicional"}"`,
        receiverId: service.creatorId,
        senderId: session.user.id,
        serviceId: serviceId,
        bidId: bid.id,
        read: false
      }
    });

    return NextResponse.json(bid, { status: 201 });

  } catch (error: any) {
    console.error("Erro ao criar proposta:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar a proposta" },
      { status: 500 }
    );
  }
}
