import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

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
      return NextResponse.json({ message: "Usuário não está bloqueado" }, { status: 200 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isBlocked: false },
      select: { id: true, name: true, email: true, isBlocked: true, role: true },
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
