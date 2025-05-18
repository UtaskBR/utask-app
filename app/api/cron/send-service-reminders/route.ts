import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// This is a protected route, ideally triggered by a cron job or an admin action.
// For now, it can be called manually. Consider adding authentication/authorization if exposing publicly.
// GET /api/cron/send-service-reminders
export async function GET(request: NextRequest) {
  try {
    console.log("Attempting to send service reminders...");

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    tomorrow.setHours(0,0,0,0); // Start of tomorrow

    // Find services scheduled for today that are IN_PROGRESS
    const servicesToRemind = await prisma.service.findMany({
      where: {
        status: "IN_PROGRESS",
        date: {
          gte: today,
          lt: tomorrow, // Services that are on `today` (from 00:00:00 to 23:59:59)
        },
      },
      include: {
        creator: { select: { id: true, name: true } },
        bids: {
          where: { status: "ACCEPTED" },
          select: { provider: { select: { id: true, name: true } } },
        },
      },
    });

    if (servicesToRemind.length === 0) {
      console.log("No services found for reminder today.");
      return NextResponse.json({ message: "Nenhum serviço encontrado para lembrete hoje." });
    }

    const notificationsToCreate: any[] = [];
    let remindersSentCount = 0;

    for (const service of servicesToRemind) {
      if (service.bids.length === 0 || !service.bids[0].provider) {
        console.warn(`Serviço ${service.id} em progresso mas sem prestador aceito definido. Pulando lembrete.`);
        continue;
      }

      const creatorId = service.creatorId;
      const providerId = service.bids[0].provider.id;
      const serviceTitle = service.title;
      const serviceDate = service.date ? new Date(service.date).toLocaleDateString("pt-BR") : "hoje";

      const reminderMessageCreator = `Lembrete: O serviço "${serviceTitle}" que você contratou está agendado para ${serviceDate}.`;
      const reminderMessageProvider = `Lembrete: O serviço "${serviceTitle}" que você irá prestar está agendado para ${serviceDate}.`;

      // Notification for Creator
      notificationsToCreate.push({
        id: crypto.randomUUID(),
        type: "SERVICE_REMINDER_TODAY",
        title: "Lembrete de Serviço Agendado",
        message: reminderMessageCreator,
        receiverId: creatorId,
        serviceId: service.id,
        read: false,
      });

      // Notification for Provider
      notificationsToCreate.push({
        id: crypto.randomUUID(),
        type: "SERVICE_REMINDER_TODAY",
        title: "Lembrete de Serviço Agendado",
        message: reminderMessageProvider,
        receiverId: providerId,
        serviceId: service.id,
        read: false,
      });
      remindersSentCount++;
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });
      console.log(`${remindersSentCount} pares de lembretes de serviço enviados.`);
      return NextResponse.json({ message: `${remindersSentCount} pares de lembretes de serviço enviados com sucesso.` });
    }

    return NextResponse.json({ message: "Nenhum lembrete de serviço precisou ser enviado." });

  } catch (error: any) {
    console.error("Erro ao enviar lembretes de serviço:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar lembretes: " + error.message },
      { status: 500 }
    );
  }
}
