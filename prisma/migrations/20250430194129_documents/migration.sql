/*
  Warnings:

  - A unique constraint covering the columns `[codigo_usuario]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('egresado', 'titulado', 'desconocido');

-- CreateEnum
CREATE TYPE "TipoProcedimiento" AS ENUM ('egresado', 'titulado');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Rol" ADD VALUE 'secretaria';
ALTER TYPE "Rol" ADD VALUE 'desconocido';

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "codigo_usuario" VARCHAR(10),
ADD COLUMN     "drive_folder" VARCHAR(255),
ADD COLUMN     "tipo_documento" "TipoUsuario" NOT NULL DEFAULT 'desconocido';

-- CreateTable
CREATE TABLE "Observacion" (
    "id_observacion" INTEGER NOT NULL,
    "fk_emisor" INTEGER NOT NULL,
    "fk_receptor" INTEGER NOT NULL,
    "contenido" VARCHAR(1024),
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" VARCHAR(100),

    CONSTRAINT "Observacion_pkey" PRIMARY KEY ("id_observacion","fk_emisor","fk_receptor")
);

-- CreateTable
CREATE TABLE "Documento" (
    "id_documento" INTEGER NOT NULL,
    "nombre_documento" VARCHAR(100) NOT NULL,
    "tipo_procedimiento" "TipoProcedimiento" NOT NULL,

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "UsuarioDocumento" (
    "id_udoc" SERIAL NOT NULL,
    "drive_link" VARCHAR(100),
    "fk_documento" INTEGER NOT NULL,
    "fk_usuario" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioDocumento_pkey" PRIMARY KEY ("id_udoc")
);

-- CreateIndex
CREATE INDEX "Observacion_fk_receptor_idx" ON "Observacion"("fk_receptor");

-- CreateIndex
CREATE INDEX "Observacion_fk_emisor_idx" ON "Observacion"("fk_emisor");

-- CreateIndex
CREATE INDEX "UsuarioDocumento_fk_usuario_idx" ON "UsuarioDocumento"("fk_usuario");

-- CreateIndex
CREATE INDEX "UsuarioDocumento_fk_documento_idx" ON "UsuarioDocumento"("fk_documento");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioDocumento_fk_documento_fk_usuario_key" ON "UsuarioDocumento"("fk_documento", "fk_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_codigo_usuario_key" ON "Usuario"("codigo_usuario");

-- AddForeignKey
ALTER TABLE "Observacion" ADD CONSTRAINT "Observacion_fk_emisor_fkey" FOREIGN KEY ("fk_emisor") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observacion" ADD CONSTRAINT "Observacion_fk_receptor_fkey" FOREIGN KEY ("fk_receptor") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioDocumento" ADD CONSTRAINT "UsuarioDocumento_fk_usuario_fkey" FOREIGN KEY ("fk_usuario") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "UsuarioDocumento" ADD CONSTRAINT "UsuarioDocumento_fk_documento_fkey" FOREIGN KEY ("fk_documento") REFERENCES "Documento"("id_documento") ON DELETE RESTRICT ON UPDATE CASCADE;
