import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

// GET: Listar todas as profissões
export async function GET(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  try {
    const professions = await prisma.profession.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(professions);
  } catch (error) {
    console.error("Erro ao listar profissões:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao listar profissões" },
      { status: 500 }
    );
  }
}

import { createAuditLog, AuditActions, AuditEntityTypes } from "@/app/lib/auditLog"; // Import audit log helper

// POST: Adicionar uma nova profissão
export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN || !token.id || !token.email) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  try {
    const body = await req.json();
    const { name, icon } = body;

    if (!name) {
      return NextResponse.json({ error: "O nome da profissão é obrigatório" }, { status: 400 });
    }

    // Verificar se a profissão já existe (case-insensitive)
    const existingProfession = await prisma.profession.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });

    if (existingProfession) {
      return NextResponse.json({ error: "Uma profissão com este nome já existe" }, { status: 409 }); // 409 Conflict
    }

    const newProfession = await prisma.profession.create({
      data: {
        name,
        icon, // O ícone é opcional
      },
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.PROFESSION_CREATE,
      targetEntityType: AuditEntityTypes.PROFESSION,
      targetEntityId: newProfession.id,
      details: { name: newProfession.name, icon: newProfession.icon },
    });

    return NextResponse.json(newProfession, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar profissão:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao criar profissão" },
      { status: 500 }
    );
  }
}
