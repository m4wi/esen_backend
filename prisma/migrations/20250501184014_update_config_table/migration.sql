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
