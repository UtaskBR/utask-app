import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/app/lib/cloudinary";

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
    
    // Verificar se o serviço existe e pertence ao usuário
    const service = await prisma.service.findUnique({
      where: { id: serviceId }
    });
    
    if (!service) {
      console.log("Serviço não encontrado");
      return NextResponse.json(
        { error: "Serviço não encontrado" },
        { status: 404 }
      );
    }
    
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
        
        // Salvar a referência no banco de dados
        const photo = await prisma.photo.create({
          data: {
            url: result.secure_url,
            publicId: result.public_id,
            service: {
              connect: {
                id: serviceId
              }
            }
          }
        });
        
        savedPhotos.push(photo);
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
