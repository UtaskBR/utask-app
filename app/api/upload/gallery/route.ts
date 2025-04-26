// app/api/upload/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/lib/auth";
import prisma from '@/app/lib/prisma';
import cloudinary from '@/app/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const { userId, url, publicId } = await req.json();
    console.log("🧩 Dados recebidos (galeria):", { userId, url, publicId });

    console.log("Recebido request de galeria com userId:", userId);
    
    const session = await getServerSession(authOptions);
    console.log("Sessão:", session?.user?.id);
    
    if (!session || session.user.id !== userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const newPhoto = await prisma.photo.create({
      data: {
        url,
        publicId,
        user: { connect: { id: userId } },
      },
    });

    console.log("Foto adicionada à galeria:", newPhoto);

    return NextResponse.json({ photo: newPhoto, success: true });
  } catch (error) {
    console.error("Erro no processamento da foto de galeria:", error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const photo = await prisma.photo.findUnique({
      where: { id: photoId || undefined },
      select: { id: true, publicId: true, userId: true },
    });

    if (!photo || session.user.id !== photo.userId) {
      return NextResponse.json({ error: "Acesso negado ou foto inexistente" }, { status: 403 });
    }

    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (error) {
        console.error("Erro ao excluir imagem do Cloudinary:", error);
        // Continua mesmo se falhar ao remover a imagem do Cloudinary
      }
    }
    
    await prisma.photo.delete({ where: { id: photo.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir foto:", error);
    return NextResponse.json({ error: 'Erro interno do servidor', details: error.message }, { status: 500 });
  }
}
