-- AlterTable
ALTER TABLE "User" DROP COLUMN "emailVerified",
ADD COLUMN     "cpf" TEXT,
ADD COLUMN     "emailIsVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailVerificationToken" TEXT;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "reservedBalance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "UserFavorite" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "favoritedById" TEXT NOT NULL,
    "favoritedUserId" TEXT NOT NULL,

    CONSTRAINT "UserFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserFavorite_favoritedById_idx" ON "UserFavorite"("favoritedById");

-- CreateIndex
CREATE INDEX "UserFavorite_favoritedUserId_idx" ON "UserFavorite"("favoritedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserFavorite_favoritedById_favoritedUserId_key" ON "UserFavorite"("favoritedById", "favoritedUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailVerificationToken_key" ON "User"("emailVerificationToken");

-- CreateIndex
CREATE INDEX "User_cpf_idx" ON "User"("cpf");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_favoritedById_fkey" FOREIGN KEY ("favoritedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFavorite" ADD CONSTRAINT "UserFavorite_favoritedUserId_fkey" FOREIGN KEY ("favoritedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
