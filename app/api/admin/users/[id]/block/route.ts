import prisma from "@/lib/prisma"; // CORRIGIDO
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";
import { createAuditLog, AuditActions, AuditEntityTypes } from "@/lib/auditLog"; // CORRIGIDO

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
    const userToBlock = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToBlock) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Impede que um admin bloqueie a si mesmo ou outro admin (opcional, mas boa prática)
    if (userToBlock.id === token.id) {
      return NextResponse.json({ error: "Você não pode bloquear a si mesmo." }, { status: 400 });
    }
    if (userToBlock.role === Role.ADMIN) {
      return NextResponse.json({ error: "Não é permitido bloquear outro administrador." }, { status: 403 });
    }

    if (userToBlock.isBlocked) {
      // Mesmo que já esteja bloqueado, podemos registrar a tentativa se desejado,
      // mas por ora, apenas retornamos. Ou podemos registrar e retornar.
      // Para simplificar, não registraremos se não houver mudança de estado.
      return NextResponse.json({ message: "Usuário já está bloqueado" }, { status: 200 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: true },
      select: { id: true, name: true, email: true, isBlocked: true, role: true },
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.USER_BLOCK,
      targetEntityType: AuditEntityTypes.USER,
      targetEntityId: updatedUser.id,
      details: { userEmail: updatedUser.email, userName: updatedUser.name },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Erro ao bloquear usuário ${userId}:`, error);
    return NextResponse.json(
      { error: `Erro interno do servidor ao bloquear usuário ${userId}` },
      { status: 500 }
    );
  }
}
