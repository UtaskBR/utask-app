-- DropForeignKey
ALTER TABLE "DisputeResolution" DROP CONSTRAINT "DisputeResolution_adminId_fkey";

-- AddForeignKey
ALTER TABLE "DisputeResolution" ADD CONSTRAINT "DisputeResolution_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
