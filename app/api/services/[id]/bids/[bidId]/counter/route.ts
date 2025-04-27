import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// POST /api/services/[id]/bids/[bidId]/counter - Fazer uma contraproposta
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    console.log('API counter: Iniciando processamento de contraproposta');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API counter: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = await params;
    console.log(`API counter: Processando contraproposta para proposta ${bidId} do serviço ${serviceId}`);
    
    const body = await request.json();
    const { value, proposedDate, message } = body;
    
    console.log('API counter: Dados recebidos:', { value, proposedDate, message });
    
    // Verificar se a proposta existe usando SQL bruto
    const bids = await prisma.$queryRaw`
      SELECT 
        sb.id, 
        sb."serviceId", 
        sb."providerId", 
        sb.status,
        s.id as service_id,
        s."creatorId" as service_creator_id,
        s.status as service_status
      FROM "ServiceBid" sb
      JOIN "Service" s ON sb."serviceId" = s.id
      WHERE sb.id = ${bidId}
    `;
    
    if (!bids || (bids as any[]).length === 0 || (bids as any[])[0].serviceId !== serviceId) {
      console.log('API counter: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    const bid = (bids as any[])[0];
    
    // Verificar se o usuário é o criador do serviço
    const isServiceCreator = bid.service_creator_id === session.user.id;
    
    if (!isServiceCreator) {
      console.log('API counter: Usuário não é o criador do serviço');
      return NextResponse.json(
        { error: "Apenas o criador do serviço pode fazer contrapropostas" },
        { status: 403 }
      );
    }
    
    console.log('API counter: Atualizando proposta com contraproposta');
    
    // Preparar os valores para a atualização
    const now = new Date();
    const newValue = value !== undefined ? parseFloat(value) : null;
    const newProposedDate = proposedDate ? new Date(proposedDate) : null;
    const newMessage = message || null;
    
    // Atualizar a proposta com a contraproposta usando SQL bruto
    // Usando 'COUNTER_OFFER' em vez de 'COUNTER_OFFERED' conforme sugerido pelo erro
    await prisma.$executeRaw`
      UPDATE "ServiceBid"
      SET 
        status = 'COUNTER_OFFER', 
        value = COALESCE(${newValue}, value),
        "proposedDate" = COALESCE(${newProposedDate}, "proposedDate"),
        message = COALESCE(${newMessage}, message),
        "updatedAt" = ${now}
      WHERE id = ${bidId}
    `;
    
    // Buscar a proposta atualizada
    const updatedBids = await prisma.$queryRaw`
      SELECT * FROM "ServiceBid" WHERE id = ${bidId}
    `;
    
    console.log('API counter: Criando notificação');
    
    // Gerar um ID único para a notificação
    const notificationId = crypto.randomUUID();
    
    // Criar notificação usando SQL bruto
    await prisma.$executeRaw`
      INSERT INTO "Notification" (
        id, 
        type, 
        message, 
        "receiverId", 
        "senderId", 
        "createdAt", 
        "updatedAt",
        read
      )
      VALUES (
        ${notificationId}, 
        'COUNTER_OFFER', 
        'Você recebeu uma contraproposta.', 
        ${bid.providerId}, 
        ${session.user.id}, 
        ${now}, 
        ${now},
        false
      )
    `;
    
    console.log('API counter: Contraproposta enviada com sucesso');
    return NextResponse.json((updatedBids as any[])[0]);
  } catch (error) {
    console.error("API counter: Erro ao processar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
