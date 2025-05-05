import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const formData = await request.formData();
  const serviceId = formData.get("serviceId")?.toString();

  if (!serviceId) {
    return NextResponse.json({ error: "ID do serviço ausente" }, { status: 400 });
  }

  // ⚠️ Verificar se o serviço existe e pertence ao usuário logado
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    select: { creatorId: true },
  });

  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado" }, { status: 404 });
  }

  if (service.creatorId !== session.user.id) {
    return NextResponse.json({ error: "Você não tem permissão para alterar este serviço" }, { status: 403 });
  }

  const files = formData.getAll("photos") as File[];

  if (!files.length) {
    return NextResponse.json({ error: "Nenhuma foto enviada" }, { status: 400 });
  }

  const uploadedPhotos = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "utask/services", upload_preset: "utask-gallery" },
        (error, result) => (error ? reject(error) : resolve(result))
      );
      stream.end(buffer);
    });

    const createdPhoto = await prisma.photo.create({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        serviceId,
      },
    });

    uploadedPhotos.push(createdPhoto);
  }

  return NextResponse.json(uploadedPhotos);
}
