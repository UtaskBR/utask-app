-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COMPLETION_CONFIRMATION';
ALTER TYPE "NotificationType" ADD VALUE 'CANCEL_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'SERVICE_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE 'CANCEL_REJECTED';

-- CreateTable
CREATE TABLE "ServiceCompletionConfirmation" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCompletionConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceCompletionConfirmation_serviceId_idx" ON "ServiceCompletionConfirmation"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceCompletionConfirmation_userId_idx" ON "ServiceCompletionConfirmation"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCompletionConfirmation_serviceId_userId_key" ON "ServiceCompletionConfirmation"("serviceId", "userId");

-- AddForeignKey
ALTER TABLE "ServiceCompletionConfirmation" ADD CONSTRAINT "ServiceCompletionConfirmation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCompletionConfirmation" ADD CONSTRAINT "ServiceCompletionConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
