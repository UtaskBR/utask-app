import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// POST /api/services/[id]/bids/[bidId]/reject-provider - Prestador rejeita contraproposta do contratante
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    console.log('API reject-provider: Iniciando processamento de rejeição de contraproposta pelo prestador');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API reject-provider: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = await params;
    console.log(`API reject-provider: Prestador rejeitando contraproposta ${bidId} para serviço ${serviceId}`);
    
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
      console.log('API reject-provider: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    const bid = (bids as any[])[0];
    
    // Verificar se o usuário é o prestador de serviço que fez a proposta
    const isProvider = bid.providerId === session.user.id;
    
    if (!isProvider) {
      console.log('API reject-provider: Usuário não é o prestador que fez a proposta');
      return NextResponse.json(
        { error: "Apenas o prestador que fez a proposta pode rejeitá-la" },
        { status: 403 }
      );
    }
    
    // Verificar se a proposta está no status de contraproposta
    // Usando 'COUNTER_OFFER' em vez de 'COUNTER_OFFERED' conforme corrigido anteriormente
    if (bid.status !== 'COUNTER_OFFER') {
      console.log('API reject-provider: Proposta não está no status de contraproposta');
      return NextResponse.json(
        { error: "Apenas contrapropostas podem ser rejeitadas pelo prestador" },
        { status: 400 }
      );
    }
    
    console.log('API reject-provider: Atualizando status da proposta para REJECTED');
    
    // Atualizar o status da proposta usando SQL bruto
    const now = new Date();
    await prisma.$executeRaw`
      UPDATE "ServiceBid"
      SET status = 'REJECTED', "updatedAt" = ${now}
      WHERE id = ${bidId}
    `;
    
    // Buscar a proposta atualizada
    const updatedBids = await prisma.$queryRaw`
      SELECT * FROM "ServiceBid" WHERE id = ${bidId}
    `;
    
    console.log('API reject-provider: Criando notificação');
    
    // Gerar um ID único para a notificação
    const notificationId = crypto.randomUUID();
    
    // Criar notificação para o contratante usando SQL bruto
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
        'REJECTION', 
        'O prestador rejeitou sua contraproposta.', 
        ${bid.service_creator_id}, 
        ${session.user.id}, 
        ${now}, 
        ${now},
        false
      )
    `;
    
    console.log('API reject-provider: Contraproposta rejeitada com sucesso');
    return NextResponse.json((updatedBids as any[])[0]);
  } catch (error) {
    console.error("API reject-provider: Erro ao rejeitar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
