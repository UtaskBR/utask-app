import prisma from "@/app/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { Role } from "@prisma/client";

interface RouteParams {
  params: { id: string };
}

// DELETE: Deletar um usuário
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token || token.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 });
  }

  const { id: userIdToDelete } = params;
  if (!userIdToDelete) {
    return NextResponse.json({ error: "ID do usuário não fornecido" }, { status: 400 });
  }

  try {
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
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

    // Considerações sobre deleção em cascata:
    // O schema do Prisma (`onDelete: Cascade`) em relações como Account, Session, Bid, Service (creator), etc.,
    // cuidará da remoção de registros relacionados.
    // No entanto, é preciso ter MUITO CUIDADO com `onDelete: Cascade`.
    // Por exemplo, se um usuário criou muitos serviços, e esses serviços são importantes,
    // a deleção em cascata pode apagar muita informação.
    //
    // Para uma aplicação real, um "soft delete" (marcar `isDeleted = true` ou similar)
    // ou uma política de anonimização de dados seria mais segura.
    // Como a tarefa pede "Deletar usuários com confirmação", implemento o hard delete.
    // A confirmação deve ser feita no frontend.

    // Antes de deletar, pode ser útil desassociar ou tratar relações específicas
    // que não têm `onDelete: Cascade` ou onde a cascata não é o comportamento desejado.
    // Exemplo: notificações enviadas/recebidas, reviews dados/recebidos.
    // O Prisma vai reclamar se houver foreign key constraints que impedem a deleção.

    // Exemplo: Desassociar ou deletar notificações manualmente se não houver onDelete: Cascade ou SetNull
    await prisma.notification.deleteMany({
      where: { OR: [{ senderId: userIdToDelete }, { receiverId: userIdToDelete }] },
    });

    // Exemplo: Desassociar reviews (ou deletar, dependendo da regra de negócio)
    // Se `onDelete: Cascade` está definido no schema para Review.giver/Review.receiver, isso é automático.
    // Verificando o schema: Review tem onDelete: Cascade para giver e receiver. OK.
    // Service tem onDelete: Cascade para creator. OK.
    // Bid tem onDelete: Cascade para provider. OK.

    // Wallet: user relation is optional and has onDelete: Cascade. OK.
    // Photos: user relation is optional and has onDelete: Cascade. OK.
    // Favorites: user relation has onDelete: Cascade. OK.
    // UserFavorites: user relation has onDelete: Cascade. OK.
    // CompletionConfirmations: user relation has onDelete: Cascade. OK.

    // As profissões associadas (ProfessionToUser) serão desfeitas automaticamente pela remoção do User.

    await prisma.user.delete({
      where: { id: userIdToDelete },
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
