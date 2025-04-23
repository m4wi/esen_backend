-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('usuario', 'admin');

-- CreateTable
CREATE TABLE "Usuario" (
    "usuario_id" SERIAL NOT NULL,
    "nombre" VARCHAR(70) NOT NULL,
    "apellido" VARCHAR(70) NOT NULL,
    "correo" VARCHAR(254) NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "contrasenia" CHAR(60) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'usuario',

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuario_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");
