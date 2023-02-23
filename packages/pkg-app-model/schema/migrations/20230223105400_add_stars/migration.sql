-- CreateTable
CREATE TABLE "list_star" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "list_id" INT8 NOT NULL,
    "user_id" INT8 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_star_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_star" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "resource_id" INT8 NOT NULL,
    "user_id" INT8 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_star_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "list_star_list_id_user_id_key" ON "list_star"("list_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_star_resource_id_user_id_key" ON "resource_star"("resource_id", "user_id");

-- AddForeignKey
ALTER TABLE "list_star" ADD CONSTRAINT "list_star_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_star" ADD CONSTRAINT "list_star_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_star" ADD CONSTRAINT "resource_star_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_star" ADD CONSTRAINT "resource_star_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
