-- Renomeação de value para price já aplicada diretamente no banco.
-- Esta entrada serve apenas para alinhar o histórico de migrações.
ALTER TABLE "Service" ADD COLUMN "price" DOUBLE PRECISION;
