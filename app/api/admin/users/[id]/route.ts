import prisma from "@/lib/prisma"; // CORRIGIDO
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";
import { createAuditLog, AuditActions, AuditEntityTypes } from "@/lib/auditLog"; // CORRIGIDO

interface RouteParams {
  params: { id: string };
}

// DELETE: Deletar um usuário
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN || !token.id || !token.email) {
    return NextResponse.json({ error: "Acesso não autorizado ou token inválido" }, { status: 403 });
  }
  const adminId = token.id as string;
  const adminEmail = token.email as string;

  const { id: userIdToDelete } = params;
  if (!userIdToDelete) {
    return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      // Selecionar dados para o log antes da deleção
      select: { id: true, email: true, name: true, role: true, cpf: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Impedir que um admin delete a si mesmo
    if (userToDelete.id === token.id) {
      return NextResponse.json({ error: "Você não pode deletar a si mesmo." }, { status: 400 });
    }

    // Impedir que um admin delete outro admin
    if (userToDelete.role === Role.ADMIN) {
      return NextResponse.json({ error: "Não é permitido deletar outro administrador." }, { status: 403 });
    }

    // Considerações sobre deleção em cascata (mantidas do código original)
    // ... (o schema já define onDelete: Cascade para a maioria das relações diretas)

    // Limpeza manual de notificações (se não totalmente coberto por cascade ou para ser explícito)
    // Note: Se Notification.senderId ou receiverId forem opcionais e onDelete: SetNull,
    // eles se tornariam null. Se forem obrigatórios e onDelete: Restrict (ou padrão),
    // a deleção do usuário falharia se existissem notificações.
    // O schema atual tem onDelete: Cascade para Notification.receiver e Notification.sender.
    // Então, a linha abaixo pode não ser estritamente necessária se a cascata funcionar como esperado.
    // No entanto, para garantir, ou se a cascata não for desejada para todos os casos, pode-se manter.
    // await prisma.notification.deleteMany({
    //   where: { OR: [{ senderId: userIdToDelete }, { receiverId: userIdToDelete }] },
    // });

    // A deleção em cascata deve cuidar das outras relações conforme definido no schema.
    // Por exemplo, Wallet, Bid, Service (como creator), Review (giver/receiver), etc.

    await prisma.user.delete({
      where: { id: userIdToDelete },
    });

    await createAuditLog({
      adminId,
      adminEmail,
      action: AuditActions.USER_DELETE,
      targetEntityType: AuditEntityTypes.USER,
      targetEntityId: userToDelete.id, // ID do usuário deletado
      details: { deletedUserEmail: userToDelete.email, deletedUserName: userToDelete.name, deletedUserCpf: userToDelete.cpf },
    });

    return NextResponse.json({ message: "Usuário deletado com sucesso" }, { status: 200 });
  } catch (error: any) {
    console.error(`Erro ao deletar usuário ${userIdToDelete}:`, error);
    if (error.code === 'P2003' || error.message?.includes('Foreign key constraint failed')) {
        // P2003: Foreign key constraint failed
        return NextResponse.json(
            { error: `Não é possível deletar o usuário pois ele está referenciado em outros registros (ex: serviços ativos, propostas, etc.) que precisam ser tratados ou removidos primeiro.` },
            { status: 409 } // Conflict
        );
    }
    return NextResponse.json(
      { error: `Erro interno do servidor ao deletar usuário ${userIdToDelete}` },
      { status: 500 }
    );
  }
}
