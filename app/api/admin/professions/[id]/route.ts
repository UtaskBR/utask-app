import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";
import { createAuditLog, AuditActions, AuditEntityTypes } from "@/app/lib/auditLog"; // Import audit log helper

interface RouteParams {
  params: { id: string };
}

// PUT: Editar uma profissão existente
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN || !token.id || !token.email) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID da profissão não fornecido" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, icon } = body;

    if (!name) {
      return NextResponse.json({ error: "O nome da profissão é obrigatório" }, { status: 400 });
    }

    // Verificar se a profissão existe
    const existingProfessionById = await prisma.profession.findUnique({
      where: { id },
    });

    if (!existingProfessionById) {
      return NextResponse.json({ error: "Profissão não encontrada" }, { status: 404 });
    }

    // Verificar se já existe outra profissão com o mesmo nome (e ID diferente)
    const existingProfessionByName = await prisma.profession.findFirst({
      where: {
        name: { equals: name, mode: 'insensitive' },
        id: { not: id },
 अरब},
    });

    if (existingProfessionByName) {
      return NextResponse.json({ error: "Uma profissão com este nome já existe" }, { status: 409 });
    }

    const updatedProfession = await prisma.profession.update({
      where: { id },
      data: {
        name,
        icon, // O ícone é opcional
      },
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.PROFESSION_UPDATE,
      targetEntityType: AuditEntityTypes.PROFESSION,
      targetEntityId: updatedProfession.id,
      details: { old: existingProfessionById, new: updatedProfession },
    });

    return NextResponse.json(updatedProfession);
  } catch (error) {
    console.error(`Erro ao atualizar profissão ${id}:`, error);
    return NextResponse.json(
      { error: `Erro interno do servidor ao atualizar profissão ${id}` },
      { status: 500 }
    );
  }
}

// DELETE: Deletar uma profissão
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN || !token.id || !token.email) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: "ID da profissão não fornecido" }, { status: 400 });
  }

  try {
    // Verificar se a profissão existe
    const professionToDelete = await prisma.profession.findUnique({
      where: { id },
      include: { services: { take: 1 } }, // Inclui um serviço para verificar se há algum associado
    });

    if (!professionToDelete) {
      return NextResponse.json({ error: "Profissão não encontrada" }, { status: 404 });
    }

    // Validação para evitar exclusão de profissões com serviços associados
    if (professionToDelete.services && professionToDelete.services.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir a profissão pois existem serviços associados a ela." },
        { status: 400 } // Bad Request ou 409 Conflict
      );
    }

    // Também verificar se existem usuários associados diretamente a esta profissão
    // (Relação ProfessionToUser)
    const usersWithProfession = await prisma.user.count({
        where: { professions: { some: { id: id } } }
    });

    if (usersWithProfession > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir a profissão pois existem usuários associados a ela." },
        { status: 400 }
      );
    }

    await prisma.profession.delete({
      where: { id },
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.PROFESSION_DELETE,
      targetEntityType: AuditEntityTypes.PROFESSION,
      targetEntityId: id, // o ID da profissão deletada
      details: { name: professionToDelete.name, icon: professionToDelete.icon }, // Log dos dados da profissão deletada
    });

    return NextResponse.json({ message: "Profissão deletada com sucesso" }, { status: 200 }); // Ou 204 No Content
  } catch (error) {
    console.error(`Erro ao deletar profissão ${id}:`, error);
    // Prisma P2014: "The change you are trying to make would violate the required relation '{relation_name}' between the {model_a_name} and {model_b_name} models."
    // Prisma P2003: Foreign key constraint failed on the field: `Service_professionId_fkey (index)`
    // Esses erros podem ocorrer se houver relações não tratadas (ex: usuários com essa profissão)
    // A verificação acima deve ajudar, mas é bom estar ciente.
    return NextResponse.json(
      { error: `Erro interno do servidor ao deletar profissão ${id}` },
      { status: 500 }
    );
  }
}
