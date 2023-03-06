-- CreateTable
CREATE TABLE "list_like" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "list_id" INT8 NOT NULL,
    "user_id" INT8 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "list_like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_like" (
    "id" INT8 NOT NULL DEFAULT unique_rowid(),
    "resource_id" INT8 NOT NULL,
    "user_id" INT8 NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "list_like_list_id_user_id_key" ON "list_like"("list_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "resource_like_resource_id_user_id_key" ON "resource_like"("resource_id", "user_id");

-- AddForeignKey
ALTER TABLE "list_like" ADD CONSTRAINT "list_like_list_id_fkey" FOREIGN KEY ("list_id") REFERENCES "list"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "list_like" ADD CONSTRAINT "list_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_like" ADD CONSTRAINT "resource_like_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_like" ADD CONSTRAINT "resource_like_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
