-- CreateTable
CREATE TABLE "ServiceCancelRequest" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceCancelRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceCancelRequest_serviceId_idx" ON "ServiceCancelRequest"("serviceId");

-- CreateIndex
CREATE INDEX "ServiceCancelRequest_requesterId_idx" ON "ServiceCancelRequest"("requesterId");

-- AddForeignKey
ALTER TABLE "ServiceCancelRequest" ADD CONSTRAINT "ServiceCancelRequest_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceCancelRequest" ADD CONSTRAINT "ServiceCancelRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
