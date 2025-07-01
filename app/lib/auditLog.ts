import prisma from "@/app/lib/prisma";
import { Prisma } from "@prisma/client"; // Para usar o tipo Json

interface AuditLogData {
  adminId: string;
  adminEmail: string;
  action: string;
  targetEntityType?: string;
  targetEntityId?: string;
  details?: Prisma.JsonValue | any; // Aceita qualquer JsonValue ou 'any' para flexibilidade
}

/**
 * Cria um registro de log de auditoria administrativa.
 * @param logData - Os dados para o log de auditoria.
 */
export async function createAuditLog(logData: AuditLogData): Promise<void> {
  try {
    await prisma.adminAuditLog.create({
      data: {
        adminId: logData.adminId,
        adminEmail: logData.adminEmail,
        action: logData.action,
        targetEntityType: logData.targetEntityType,
        targetEntityId: logData.targetEntityId,
        details: logData.details || Prisma.JsonNull, // Garante que 'details' seja um JsonValue válido ou null
      },
    });
    console.log(`Audit log created: ${logData.action} by ${logData.adminEmail}`);
  } catch (error) {
    console.error("Failed to create audit log:", error);
    // Em um sistema de produção, você pode querer um tratamento de erro mais robusto aqui,
    // como enviar para um serviço de logging externo ou notificar administradores.
    // Por ora, apenas logamos o erro no console. A falha em criar um log de auditoria
    // geralmente não deve impedir a operação principal de ser concluída.
  }
}

// Enumeração de tipos de ação para consistência (opcional, mas recomendado)
export enum AuditActions {
  // Profession Actions
  PROFESSION_CREATE = "PROFESSION_CREATE",
  PROFESSION_UPDATE = "PROFESSION_UPDATE",
  PROFESSION_DELETE = "PROFESSION_DELETE",
  // User Actions
  USER_BLOCK = "USER_BLOCK",
  USER_UNBLOCK = "USER_UNBLOCK",
  USER_DELETE = "USER_DELETE",
  USER_NOTIFY = "USER_NOTIFY",
  // Wallet Actions
  WALLET_WITHDRAWAL_REQUEST = "WALLET_WITHDRAWAL_REQUEST",
  // Dispute Actions
  DISPUTE_RESOLVE = "DISPUTE_RESOLVE",
  // Outras ações admin
  ADMIN_LOGIN_SUCCESS = "ADMIN_LOGIN_SUCCESS", // Exemplo, se quisermos logar logins
  ADMIN_LOGIN_FAILURE = "ADMIN_LOGIN_FAILURE", // Exemplo
}

// Enumeração de tipos de entidade para consistência
export enum AuditEntityTypes {
  PROFESSION = "Profession",
  USER = "User",
  SERVICE = "Service",
  WALLET = "Wallet",
  PLATFORM = "Platform",
  NOTIFICATION = "Notification",
  DISPUTE_RESOLUTION = "DisputeResolution"
}
