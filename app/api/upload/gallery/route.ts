// app/api/upload/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import cloudinary from '@/lib/cloudinary';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{  }> }
) {
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
    const users = await prisma.$queryRaw`
      SELECT id FROM "User" WHERE id = ${userId}
    `;
    
    if (!users || (users as any[]).length === 0) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }
    
    // Criar a foto usando SQL bruto
    const photoId = crypto.randomUUID();
    const now = new Date();
    
    await prisma.$executeRaw`
      INSERT INTO "Photo" (id, url, "publicId", "userId", "createdAt", "updatedAt")
      VALUES (${photoId}, ${url}, ${publicId}, ${userId}, ${now}, ${now})
    `;
    
    // Buscar a foto recém-criada
    const newPhotos = await prisma.$queryRaw`
      SELECT * FROM "Photo" WHERE id = ${photoId}
    `;
    
    const newPhoto = (newPhotos as any[])[0];
    console.log("Foto adicionada à galeria:", newPhoto);
    
    return NextResponse.json({ photo: newPhoto, success: true });
  } catch (error: unknown) {
    console.error("Erro no processamento da foto de galeria:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro interno do servidor', details: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{  }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const photoId = searchParams.get("id");
    
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    
    // Buscar a foto usando SQL bruto
    const photos = await prisma.$queryRaw`
      SELECT id, "publicId", "userId" FROM "Photo" WHERE id = ${photoId}
    `;
    
    if (!photos || (photos as any[]).length === 0 || session.user.id !== (photos as any[])[0].userId) {
      return NextResponse.json({ error: "Acesso negado ou foto inexistente" }, { status: 403 });
    }
    
    const photo = (photos as any[])[0];
    
    if (photo.publicId) {
      try {
        await cloudinary.uploader.destroy(photo.publicId);
      } catch (error) {
        console.error("Erro ao excluir imagem do Cloudinary:", error);
        // Continua mesmo se falhar ao remover a imagem do Cloudinary
      }
    }
    
    // Excluir a foto usando SQL bruto
    await prisma.$executeRaw`
      DELETE FROM "Photo" WHERE id = ${photo.id}
    `;
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao excluir foto:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: 'Erro interno do servidor', details: errorMessage }, { status: 500 });
  }
}
