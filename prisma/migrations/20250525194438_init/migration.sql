-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('usuario', 'admin', 'secretaria', 'desconocido');

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('egresado', 'titulado', 'desconocido');

-- CreateEnum
CREATE TYPE "TipoProcedimiento" AS ENUM ('egresado', 'titulado');

-- CreateEnum
CREATE TYPE "EstadoDocumento" AS ENUM ('observacion', 'aceptado', 'rechazado', 'vacio');

-- CreateTable
CREATE TABLE "AppConfig" (
    "id_appconfig" SERIAL NOT NULL,
    "rootDriveId" VARCHAR(100),
    "token" JSONB,
    "credentials" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id_appconfig")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "usuario_id" SERIAL NOT NULL,
    "nombre" VARCHAR(70) NOT NULL,
    "apellido" VARCHAR(70) NOT NULL,
    "correo" VARCHAR(254) NOT NULL,
    "telefono" VARCHAR(15) NOT NULL,
    "codigo_usuario" VARCHAR(70),
    "contrasenia" CHAR(60) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'usuario',
    "tipo_usuario" "TipoUsuario" NOT NULL DEFAULT 'desconocido',
    "drive_folder" VARCHAR(255),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("usuario_id")
);

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
    "nombre_documento" VARCHAR(255) NOT NULL,
    "tipo_procedimiento" "TipoProcedimiento" NOT NULL,
    "descripcion_requisito" VARCHAR(500),

    CONSTRAINT "Documento_pkey" PRIMARY KEY ("id_documento")
);

-- CreateTable
CREATE TABLE "UsuarioDocumento" (
    "id_udoc" SERIAL NOT NULL,
    "drive_link" VARCHAR(100),
    "fk_documento" INTEGER NOT NULL,
    "fk_usuario" INTEGER NOT NULL,
    "estado" "EstadoDocumento" NOT NULL DEFAULT 'vacio',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioDocumento_pkey" PRIMARY KEY ("id_udoc")
);

-- CreateTable
CREATE TABLE "SubDescripcion" (
    "id_subdescripcion" INTEGER NOT NULL,
    "fk_documento" INTEGER NOT NULL,
    "nombre_subdescripcion" VARCHAR(500),

    CONSTRAINT "SubDescripcion_pkey" PRIMARY KEY ("id_subdescripcion","fk_documento")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_correo_key" ON "Usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_codigo_usuario_key" ON "Usuario"("codigo_usuario");

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
CREATE UNIQUE INDEX "SubDescripcion_id_subdescripcion_key" ON "SubDescripcion"("id_subdescripcion");

-- AddForeignKey
ALTER TABLE "Observacion" ADD CONSTRAINT "Observacion_fk_emisor_fkey" FOREIGN KEY ("fk_emisor") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Observacion" ADD CONSTRAINT "Observacion_fk_receptor_fkey" FOREIGN KEY ("fk_receptor") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioDocumento" ADD CONSTRAINT "UsuarioDocumento_fk_usuario_fkey" FOREIGN KEY ("fk_usuario") REFERENCES "Usuario"("usuario_id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "UsuarioDocumento" ADD CONSTRAINT "UsuarioDocumento_fk_documento_fkey" FOREIGN KEY ("fk_documento") REFERENCES "Documento"("id_documento") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubDescripcion" ADD CONSTRAINT "SubDescripcion_fk_documento_fkey" FOREIGN KEY ("fk_documento") REFERENCES "Documento"("id_documento") ON DELETE CASCADE ON UPDATE CASCADE;
