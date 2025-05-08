-- CreateEnum
CREATE TYPE "EstadoDocumento" AS ENUM ('observacion', 'aceptado', 'rechazado', 'vacio');

-- AlterTable
ALTER TABLE "Documento" ADD COLUMN     "descripcion_requisito" VARCHAR(100);

-- AlterTable
ALTER TABLE "UsuarioDocumento" ADD COLUMN     "estado" "EstadoDocumento" NOT NULL DEFAULT 'vacio',
ADD COLUMN     "fk_subdescripcion" INTEGER;

-- CreateTable
CREATE TABLE "SubDescripcion" (
    "id_subdescripcion" SERIAL NOT NULL,
    "nombre_subdescripcion" VARCHAR(100),

    CONSTRAINT "SubDescripcion_pkey" PRIMARY KEY ("id_subdescripcion")
);

-- AddForeignKey
ALTER TABLE "UsuarioDocumento" ADD CONSTRAINT "UsuarioDocumento_fk_subdescripcion_fkey" FOREIGN KEY ("fk_subdescripcion") REFERENCES "SubDescripcion"("id_subdescripcion") ON DELETE SET NULL ON UPDATE CASCADE;
