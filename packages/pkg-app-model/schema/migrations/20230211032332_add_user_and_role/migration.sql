-- CreateEnum
CREATE TYPE "app_role" AS ENUM ('ADMIN', 'REVIEWER');

-- CreateTable
CREATE TABLE "app_user" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "email" STRING NOT NULL,
    "display_name" STRING NOT NULL,
    "roles" "app_role"[],
    "created_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_user_email_key" ON "app_user"("email");
