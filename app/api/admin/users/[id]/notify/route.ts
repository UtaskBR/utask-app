import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";
import { createAuditLog, AuditActions, AuditEntityTypes } from "@/app/lib/auditLog";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN || !token.id || !token.email) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  const { id: targetUserId } = params;
  if (!targetUserId) {
    return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, message } = body;

    if (!title || !message) {
      return NextResponse.json({ error: "Título e mensagem são obrigatórios" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, email: true, name: true } // Selecionar dados para o log
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário destinatário não encontrado" }, { status: 404 });
    }

    const senderId = adminId; // Admin logado é o remetente

    const notification = await prisma.notification.create({
      data: {
        receiverId: targetUserId,
        senderId: senderId,
        title: title,
        message: message,
        type: "ADMIN_CUSTOM", // Um novo tipo para notificações personalizadas do admin
        read: false,
      },
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.USER_NOTIFY,
      targetEntityType: AuditEntityTypes.USER,
      targetEntityId: targetUser.id,
      details: { notifiedUserEmail: targetUser.email, notificationTitle: title, notificationId: notification.id },
    });

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error(`Erro ao enviar notificação para o usuário ${targetUserId}:`, error);
    return NextResponse.json(
      { error: `Erro interno do servidor ao enviar notificação para o usuário ${targetUserId}` },
      { status: 500 }
    );
  }
}
