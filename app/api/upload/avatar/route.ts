// app/api/upload/avatar/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { userId, url, publicId } = await req.json();
    console.log("🧩 Dados recebidos (avatar):", { userId, url, publicId });

    console.log("Recebido request de avatar com userId:", userId);
    
    const session = await getServerSession(authOptions);
    console.log("Sessão:", session?.user?.id);
    
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });

    // Tenta remover avatar antigo do Cloudinary se existir
    if (user.image && user.image.includes("res.cloudinary.com") {
      try {
        const segments = user.image.split('/');
        const fileName = segments.pop();
        const folder = segments.pop();
        const oldPublicId = folder && fileName ? `${folder}/${fileName.split('.')[0]}` : fileName?.split('.')[0];
        if (oldPublicId) await cloudinary.uploader.destroy(oldPublicId);
      } catch (error) {
        console.error("Erro ao remover avatar antigo:", error);
        // Continua mesmo se falhar ao remover o avatar antigo
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { image: url },
    });

    console.log("Avatar atualizado:", updated);

    return NextResponse.json({ image: updated.image, success: true });
  } catch (error) {
    console.error("Erro no processamento do avatar:", error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
}
