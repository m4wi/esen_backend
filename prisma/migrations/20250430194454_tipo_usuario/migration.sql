/*
  Warnings:

  - You are about to drop the column `tipo_documento` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "tipo_documento",
ADD COLUMN     "tipo_usuario" "TipoUsuario" NOT NULL DEFAULT 'desconocido';
