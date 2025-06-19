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
    // LOGGING POINT 1 (File processing start)
    console.log(`[Service ID: ${serviceId}] Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // LOGGING POINT 2 (Before Cloudinary upload attempt)
    console.log(`[Service ID: ${serviceId}] Attempting Cloudinary upload for file: ${file.name}`);
    const result = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "utask/services", upload_preset: "utask-gallery" },
        (error, cloudinaryResult) => { // Renamed 'result' to 'cloudinaryResult'
          if (error) {
            // LOGGING POINT 3 (Error in Cloudinary callback)
            console.error(`[Service ID: ${serviceId}] Cloudinary upload stream error for ${file.name}:`, error);
            return reject(error);
          }
          // LOGGING POINT 4 (Success in Cloudinary callback)
          console.log(`[Service ID: ${serviceId}] Cloudinary upload stream success for ${file.name}. Resolving promise.`);
          return resolve(cloudinaryResult);
        }
      );
      stream.end(buffer);
    });

    // --- BEGIN TEMPORARY CLOUDINARY RESULT LOGGING ---
    console.log(`[Service ID: ${serviceId}] Cloudinary Upload Result (Full):`, JSON.stringify(result, null, 2));
    console.log(`[Service ID: ${serviceId}] Cloudinary result.secure_url:`, result?.secure_url);
    console.log(`[Service ID: ${serviceId}] typeof result.secure_url:`, typeof result?.secure_url);
    console.log(`[Service ID: ${serviceId}] Cloudinary result.url:`, result?.url); // Also log the non-secure url for comparison
    console.log(`[Service ID: ${serviceId}] typeof result.url:`, typeof result?.url);
    // --- END TEMPORARY CLOUDINARY RESULT LOGGING ---

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
