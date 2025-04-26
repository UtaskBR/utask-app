import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/api/auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request) {
  try {
    console.log('API de fotos: Iniciando processamento');
    
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('API de fotos: Usuário não autenticado');
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Verificar se a requisição é multipart/form-data
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.log('API de fotos: Tipo de conteúdo inválido', contentType);
      return NextResponse.json({ error: 'Tipo de conteúdo inválido' }, { status: 400 });
    }

    // Processar o FormData
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      console.error('API de fotos: Erro ao processar FormData', error);
      return NextResponse.json({ error: 'Erro ao processar dados do formulário' }, { status: 400 });
    }
    
    const serviceId = formData.get('serviceId');
    const photos = formData.getAll('photos');

    console.log(`API de fotos: Recebido ${photos.length} fotos para o serviço ${serviceId}`);

    if (!serviceId) {
      console.log('API de fotos: ID do serviço não fornecido');
      return NextResponse.json({ error: 'ID do serviço é obrigatório' }, { status: 400 });
    }

    if (!photos || photos.length === 0) {
      console.log('API de fotos: Nenhuma foto fornecida');
      return NextResponse.json({ error: 'Nenhuma foto fornecida' }, { status: 400 });
    }

    // Verificar se o serviço existe e pertence ao usuário
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      console.log('API de fotos: Serviço não encontrado');
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 });
    }

    if (service.creatorId !== session.user.id) {
      console.log('API de fotos: Usuário não é o criador do serviço');
      return NextResponse.json({ error: 'Você não tem permissão para adicionar fotos a este serviço' }, { status: 403 });
    }

    // Criar diretório de uploads se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadDir)) {
      console.log('API de fotos: Criando diretório de uploads', uploadDir);
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        console.error('API de fotos: Erro ao criar diretório de uploads', err);
        return NextResponse.json({ error: 'Erro ao criar diretório de uploads' }, { status: 500 });
      }
    }

    // Processar cada foto
    const savedPhotos = [];
    for (const photo of photos) {
      try {
        if (!photo || typeof photo.arrayBuffer !== 'function') {
          console.error('API de fotos: Objeto de foto inválido', photo);
          continue;
        }

        // Gerar nome de arquivo único
        const bytes = await photo.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
        const filePath = join(uploadDir, fileName);
        
        // Salvar arquivo
        console.log('API de fotos: Salvando arquivo', filePath);
        await writeFile(filePath, buffer);
        
        // Criar registro no banco de dados
        const savedPhoto = await prisma.photo.create({
          data: {
            url: `/uploads/${fileName}`,
            serviceId: serviceId,
          },
        });
        
        savedPhotos.push(savedPhoto);
      } catch (err) {
        console.error('API de fotos: Erro ao processar foto', err);
        // Continuar processando outras fotos mesmo se uma falhar
      }
    }

    if (savedPhotos.length === 0) {
      console.log('API de fotos: Nenhuma foto foi salva com sucesso');
      return NextResponse.json({ error: 'Não foi possível salvar nenhuma foto' }, { status: 500 });
    }

    console.log(`API de fotos: ${savedPhotos.length} fotos salvas com sucesso`);
    return NextResponse.json({ photos: savedPhotos });
  } catch (error) {
    console.error('API de fotos: Erro não tratado', error);
    return NextResponse.json({ error: 'Erro ao processar upload de fotos: ' + (error.message || 'Erro desconhecido') }, { status: 500 });
  }
}
