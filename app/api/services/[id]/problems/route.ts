import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";

// POST /api/services/[id]/problem - Reportar um problema com o serviço
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    const { id } = await params;
    const body = await request.json();
    
    // Verificar se o serviço existe
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        bids: {
          where: {
            status: "ACCEPTED"
          },
          include: {
            provider: true
          }
        },
        creator: {
          include: {
            wallet: true
          }
        }
      }
    });
    
    if (!existingService) {
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    // Verificar se o usuário é o criador do serviço ou o prestador aceito
    const isCreator = existingService.creatorId === session.user.id;
    const isAcceptedProvider = existingService.bids.some(
      bid => bid.status === "ACCEPTED" && bid.providerId === session.user.id
    );
    
    if (!isCreator && !isAcceptedProvider) {
      return NextResponse.json(
        { error: "Não autorizado a reportar problemas neste serviço" },
        { status: 403 }
      );
    }
    
    // Verificar se o serviço está em andamento
    if (existingService.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Apenas serviços em andamento podem ter problemas reportados" },
        { status: 400 }
      );
    }

    // Formatar valores para exibição
    const formattedPrice = existingService.price 
      ? `R$ ${existingService.price.toFixed(2)}` 
      : "valor não especificado";
    
    // Formatar datas para exibição
    let formattedDate = "data não especificada";
    if (existingService.date) {
      const date = new Date(existingService.date);
      formattedDate = date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    // Within a transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // 1. Record the problem
      await tx.problem.create({
        data: {
          description: body.reason || "Problema não especificado",
          reporterId: session.user.id as string,
          serviceId: id,
        },
      });

      // 2. Update the service status to DISPUTED
      // IMPORTANT: Do NOT change reservedBalance or balance here. Funds remain reserved.
      await tx.service.update({
        where: { id },
        data: { status: "DISPUTED", updatedAt: new Date() },
      });

      // 3. Send notifications
      const acceptedBid = existingService.bids[0]; // Assuming there's always one for IN_PROGRESS
      const providerId = acceptedBid?.providerId;
      const creatorId = existingService.creatorId;
      const reporterName = session.user.id === creatorId 
        ? existingService.creator.name || "O contratante" 
        : acceptedBid?.provider?.name || "O prestador";

      const notificationMessage = `Um problema foi reportado por ${reporterName} no serviço "${existingService.title}" (${formattedPrice}, ${formattedDate}). O serviço está agora em disputa. Os fundos permanecem reservados até a resolução. Motivo: ${body.reason || "Não especificado"}`;
      
      // Notify Creator
      await tx.notification.create({
        data: {
          id: crypto.randomUUID(),
          type: "SERVICE_DISPUTED",
          title: "Serviço em Disputa",
          message: notificationMessage,
          receiverId: creatorId,
          senderId: session.user.id,
          serviceId: id,
          read: false,
        },
      });

      // Notify Provider (if provider exists)
      if (providerId && providerId !== creatorId) { // Avoid double notification if creator is also provider (unlikely scenario but safe)
        await tx.notification.create({
          data: {
            id: crypto.randomUUID(),
            type: "SERVICE_DISPUTED",
            title: "Serviço em Disputa",
            message: notificationMessage,
            receiverId: providerId,
            senderId: session.user.id,
            serviceId: id,
            read: false,
          },
        });
      }
      // TODO: Consider notifying admins if an admin system/role exists
    });
    
    // const acceptedBid = existingService.bids[0]; // This is already fetched and available as existingService.bids[0]
    // const providerId = existingService.bids[0]?.providerId; // Use optional chaining

    // Note: Notifications are now created inside the transaction.
    // The `requesterName` logic is also inside the transaction.

    return NextResponse.json({
      message: "Problema reportado com sucesso. O serviço está agora em disputa.",
      serviceStatus: "DISPUTED" // Reflect the new status
    });
  } catch (error) {
    console.error("Erro ao reportar problema:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
