import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { targetUserId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { targetUserId } = params;
    const body = await request.json();
    const { serviceId } = body;

    if (!serviceId) {
      return NextResponse.json(
        { error: "ID do serviço não fornecido" },
        { status: 400 }
      );
    }

    if (targetUserId === session.user.id) {
      return NextResponse.json(
        { error: "Não é possível enviar um serviço para si mesmo" },
        { status: 400 }
      );
    }

    // Verify the serviceId exists, is owned by session.user.id, and its status is "OPEN"
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        creatorId: session.user.id,
        status: 'OPEN',
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado, não pertence ao usuário ou não está aberto" },
        { status: 403 } // Or 404 if preferred for "not found" aspect
      );
    }

    // Verify the targetUser exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: "Usuário de destino não encontrado" },
        { status: 404 }
      );
    }

    // Create the notification
    const notification = await prisma.notification.create({
      data: {
        type: 'DIRECT_SERVICE_OFFER',
        title: 'Oferta de Serviço Direta',
        message: `O usuário ${session.user.name || 'Alguém'} enviou um serviço diretamente para você. Você tem interesse em realizar este serviço?`,
        senderId: session.user.id,
        receiverId: targetUserId,
        serviceId: serviceId,
        read: false, // Default is false, but explicit for clarity
      },
      include: {
        sender: { select: { name: true, image: true } },
        receiver: { select: { name: true } },
      }
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error("Erro ao enviar serviço diretamente:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação" },
      { status: 500 }
    );
  }
}
