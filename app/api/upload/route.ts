import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/app/lib/auth";

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }
    
    // Converter o arquivo para um buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Fazer upload para o Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'servicos-app',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      
      uploadStream.write(buffer);
      uploadStream.end();
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao fazer upload da imagem:', error);
    return NextResponse.json({ error: 'Falha ao fazer upload da imagem' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');
    
    if (!publicId) {
      return NextResponse.json({ error: 'ID público não fornecido' }, { status: 400 });
    }
    
    // Excluir a imagem do Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao excluir imagem:', error);
    return NextResponse.json({ error: 'Falha ao excluir imagem' }, { status: 500 });
  }
}
