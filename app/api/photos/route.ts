import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { Prisma } from "@prisma/client";

export async function POST(request: NextRequest) {
  try {
    console.log("Iniciando upload de fotos para o Cloudinary");
    
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log("Usuário não autenticado");
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }
    
    // Obter dados do formulário
    const formData = await request.formData();
    const serviceId = formData.get("serviceId") as string;
    const files = formData.getAll("files") as File[];
    
    console.log(`Recebido ${files.length} arquivos para o serviço ${serviceId}`);
    
    if (!serviceId) {
      console.log("ID do serviço não fornecido");
      return NextResponse.json(
        { error: "ID do serviço é obrigatório" },
        { status: 400 }
      );
    }
    
    if (files.length === 0) {
      console.log("Nenhum arquivo enviado");
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }
    
    // Verificar se o serviço existe e pertence ao usuário usando SQL bruto
    const services = await prisma.$queryRaw`
      SELECT * FROM "Service" WHERE id = ${serviceId}
    `;
    
    if (!services || (services as any[]).length === 0) {
      console.log("Serviço não encontrado");
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
    const service = (services as any[])[0];
    
    if (service.creatorId !== session.user.id) {
      console.log("Usuário não é o criador do serviço");
      return NextResponse.json(
        { error: "Você não tem permissão para adicionar fotos a este serviço" },
        { status: 403 }
      );
    }
    
    // Array para armazenar as fotos salvas
    const savedPhotos = [];
    
    // Processar cada arquivo
    for (const file of files) {
      try {
        // Converter o arquivo para um buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Converter o buffer para base64
        const base64 = buffer.toString('base64');
        const base64File = `data:${file.type};base64,${base64}`;
        
        // Fazer upload para o Cloudinary
        const result = await cloudinary.uploader.upload(base64File, {
          folder: "utask",
          resource_type: "auto"
        });
        
        console.log(`Arquivo enviado para o Cloudinary: ${result.secure_url}`);
        
        // Gerar um ID único para a foto
        const photoId = crypto.randomUUID();
        
        // Salvar a referência no banco de dados usando SQL bruto
        await prisma.$executeRaw`
          INSERT INTO "Photo" (id, url, "publicId", "serviceId", "createdAt", "updatedAt")
          VALUES (${photoId}, ${result.secure_url}, ${result.public_id}, ${serviceId}, ${new Date()}, ${new Date()})
        `;
        
        // Buscar a foto recém-criada
        const photos = await prisma.$queryRaw`
          SELECT * FROM "Photo" WHERE id = ${photoId}
        `;
        
        if (photos && (photos as any[]).length > 0) {
          savedPhotos.push((photos as any[])[0]);
        }
      } catch (error) {
        console.error(`Erro ao processar arquivo: ${error}`);
      }
    }
    
    console.log(`${savedPhotos.length} fotos salvas com sucesso`);
    
    return NextResponse.json(savedPhotos, { status: 201 });
  } catch (error) {
    console.error("Erro ao fazer upload de fotos:", error);
    return NextResponse.json(
      { error: "Erro ao processar a solicitação: " + (error instanceof Error ? error.message : String(error)) },
      { status: 500 }
    );
  }
}
