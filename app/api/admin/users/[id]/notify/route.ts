import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const { id: targetUserId } = params;
  if (!targetUserId) {
    return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
  }

  try {
    const { title, message } = await req.json();

    if (!title || !message) {
      return NextResponse.json({ error: "Título e mensagem são obrigatórios" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuário destinatário não encontrado" }, { status: 404 });
    }

    // O senderId pode ser o ID do admin que está enviando, ou pode ser nulo/sistema.
    // Por ora, vamos assumir que o admin logado é o remetente.
    const senderId = token.id as string;

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

    return NextResponse.json(notification, { status: 201 });
  } catch (error) {
    console.error(`Erro ao enviar notificação para o usuário ${targetUserId}:`, error);
    return NextResponse.json(
      { error: `Erro interno do servidor ao enviar notificação para o usuário ${targetUserId}` },
      { status: 500 }
    );
  }
}
