-- Add new structured address columns to the "Service" table
ALTER TABLE "Service"
ADD COLUMN "cep" TEXT,
ADD COLUMN "logradouro" TEXT,
ADD COLUMN "numero" TEXT,
ADD COLUMN "complemento" TEXT,
ADD COLUMN "bairro" TEXT,
ADD COLUMN "cidade" TEXT,
ADD COLUMN "uf" TEXT;
