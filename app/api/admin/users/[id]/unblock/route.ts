import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";
import { createAuditLog, AuditActions, AuditEntityTypes } from "@/app/lib/auditLog";

interface RouteParams {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN || !token.id || !token.email) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  const { id: userId } = params;
  if (!userId) {
    return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
  }

  try {
    const userToUnblock = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUnblock) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    if (!userToUnblock.isBlocked) {
      // Similar ao block, não registraremos se não houver mudança de estado.
      return NextResponse.json({ message: "Usuário não está bloqueado" }, { status: 200 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
      select: { id: true, name: true, email: true, isBlocked: true, role: true },
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.USER_UNBLOCK,
      targetEntityType: AuditEntityTypes.USER,
      targetEntityId: updatedUser.id,
      details: { userEmail: updatedUser.email, userName: updatedUser.name },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Erro ao desbloquear usuário ${userId}:`, error);
    return NextResponse.json(
      { error: `Erro interno do servidor ao desbloquear usuário ${userId}` },
      { status: 500 }
    );
  }
}
