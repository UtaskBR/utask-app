import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// POST /api/services/[id]/bids/[bidId]/accept-provider - Prestador aceita contraproposta do contratante
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, bidId: string }> }
) {
  try {
    console.log('API accept-provider: Iniciando processamento de aceitação de contraproposta pelo prestador');
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      console.log('API accept-provider: Usuário não autenticado');
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id: serviceId, bidId } = await params;
    console.log(`API accept-provider: Prestador aceitando contraproposta ${bidId} para serviço ${serviceId}`);
    
    // Verificar se a proposta existe usando SQL bruto
    const bids = await prisma.$queryRaw`
      SELECT 
        sb.id, 
        sb."serviceId", 
        sb."providerId", 
        sb.status,
        s.id as service_id,
        s."creatorId" as service_creator_id,
        s.status as service_status,
        p.id as provider_id
      FROM "ServiceBid" sb
      JOIN "Service" s ON sb."serviceId" = s.id
      JOIN "User" p ON sb."providerId" = p.id
      WHERE sb.id = ${bidId}
    `;
    
    if (!bids || (bids as any[]).length === 0 || (bids as any[])[0].serviceId !== serviceId) {
      console.log('API accept-provider: Proposta não encontrada');
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }
    
    const bid = (bids as any[])[0];
    
    // Verificar se o usuário é o prestador de serviço que fez a proposta
    const isProvider = bid.providerId === session.user.id;
    
    if (!isProvider) {
      console.log('API accept-provider: Usuário não é o prestador que fez a proposta');
      return NextResponse.json(
        { error: "Apenas o prestador que fez a proposta pode aceitá-la" },
        { status: 403 }
      );
    }
    
    // Verificar se a proposta está no status de contraproposta
    // Usando comparação de string em vez de enum para evitar problemas de tipagem
    if (bid.status !== 'COUNTER_OFFERED') {
      console.log('API accept-provider: Proposta não está no status de contraproposta');
      return NextResponse.json(
        { error: "Apenas contrapropostas podem ser aceitas pelo prestador" },
        { status: 400 }
      );
    }
    
    console.log('API accept-provider: Atualizando status da proposta para ACCEPTED');
    
    // Atualizar o status da proposta usando SQL bruto
    await prisma.$executeRaw`
      UPDATE "ServiceBid"
      SET status = 'ACCEPTED', "updatedAt" = ${new Date()}
      WHERE id = ${bidId}
    `;
    
    console.log('API accept-provider: Atualizando status do serviço para IN_PROGRESS');
    
    // Atualizar o status do serviço usando SQL bruto
    await prisma.$executeRaw`
      UPDATE "Service"
      SET status = 'IN_PROGRESS', "updatedAt" = ${new Date()}
      WHERE id = ${serviceId}
    `;
    
    console.log('API accept-provider: Rejeitando outras propostas');
    
    // Rejeitar todas as outras propostas usando SQL bruto
    await prisma.$executeRaw`
      UPDATE "ServiceBid"
      SET status = 'REJECTED', "updatedAt" = ${new Date()}
      WHERE "serviceId" = ${serviceId} AND id != ${bidId}
    `;
    
    console.log('API accept-provider: Criando notificação');
    
    // Gerar um ID único para a notificação
    const notificationId = crypto.randomUUID();
    const now = new Date();
    
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
        'ACCEPTANCE', 
        'O prestador aceitou sua contraproposta!', 
        ${bid.service_creator_id}, 
        ${session.user.id}, 
        ${now}, 
        ${now},
        false
      )
    `;
    
    // Buscar a proposta atualizada
    const updatedBids = await prisma.$queryRaw`
      SELECT * FROM "ServiceBid" WHERE id = ${bidId}
    `;
    
    console.log('API accept-provider: Contraproposta aceita com sucesso');
    return NextResponse.json((updatedBids as any[])[0]);
  } catch (error) {
    console.error("API accept-provider: Erro ao aceitar contraproposta:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
