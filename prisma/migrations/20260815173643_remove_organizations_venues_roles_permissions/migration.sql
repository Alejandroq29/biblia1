/*
  Warnings:

  - You are about to drop the column `password_hash` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `menu_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `menus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `role_permissions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `venues` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "menu_permissions" DROP CONSTRAINT "menu_permissions_menu_id_fkey";

-- DropForeignKey
ALTER TABLE "menu_permissions" DROP CONSTRAINT "menu_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "menus" DROP CONSTRAINT "menus_parent_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_role_id_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_organization_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_role_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_user_id_fkey";

-- DropForeignKey
ALTER TABLE "user_roles" DROP CONSTRAINT "user_roles_venue_id_fkey";

-- DropForeignKey
ALTER TABLE "venues" DROP CONSTRAINT "venues_organization_id_fkey";

-- AlterTable
ALTER TABLE "user_sessions" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password_hash";

-- DropTable
DROP TABLE "menu_permissions";

-- DropTable
DROP TABLE "menus";

-- DropTable
DROP TABLE "organizations";

-- DropTable
DROP TABLE "permissions";

-- DropTable
DROP TABLE "role_permissions";

-- DropTable
DROP TABLE "roles";

-- DropTable
DROP TABLE "user_roles";

-- DropTable
DROP TABLE "venues";

-- CreateTable
CREATE TABLE "biblia_books" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(80) NOT NULL,
    "title" VARCHAR(250) NOT NULL,
    "testament" VARCHAR(20),
    "summary" TEXT,
    "status" "BibliaStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "biblia_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biblia_chapters" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "book_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "title" VARCHAR(250),
    "summary" TEXT,
    "status" "BibliaStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "biblia_chapters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biblia_verses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chapter_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "notes" TEXT,
    "status" "BibliaStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "biblia_verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biblia_favorites" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "resource" VARCHAR(100) NOT NULL,
    "resource_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "biblia_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "biblia_reading_plans" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "items" JSONB NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "status" "BibliaStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "biblia_reading_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "biblia_books_code_key" ON "biblia_books"("code");

-- CreateIndex
CREATE INDEX "biblia_books_code_idx" ON "biblia_books"("code");

-- CreateIndex
CREATE INDEX "biblia_books_status_deleted_at_idx" ON "biblia_books"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "biblia_chapters_book_id_idx" ON "biblia_chapters"("book_id");

-- CreateIndex
CREATE INDEX "biblia_chapters_status_deleted_at_idx" ON "biblia_chapters"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "biblia_chapters_book_id_number_key" ON "biblia_chapters"("book_id", "number");

-- CreateIndex
CREATE INDEX "biblia_verses_chapter_id_idx" ON "biblia_verses"("chapter_id");

-- CreateIndex
CREATE INDEX "biblia_verses_status_deleted_at_idx" ON "biblia_verses"("status", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "biblia_verses_chapter_id_number_key" ON "biblia_verses"("chapter_id", "number");

-- CreateIndex
CREATE INDEX "biblia_favorites_user_id_idx" ON "biblia_favorites"("user_id");

-- CreateIndex
CREATE INDEX "biblia_favorites_resource_resource_id_idx" ON "biblia_favorites"("resource", "resource_id");

-- CreateIndex
CREATE INDEX "biblia_reading_plans_user_id_idx" ON "biblia_reading_plans"("user_id");

-- CreateIndex
CREATE INDEX "biblia_reading_plans_status_created_at_idx" ON "biblia_reading_plans"("status", "created_at");

-- AddForeignKey
ALTER TABLE "biblia_chapters" ADD CONSTRAINT "biblia_chapters_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "biblia_books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biblia_verses" ADD CONSTRAINT "biblia_verses_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "biblia_chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biblia_favorites" ADD CONSTRAINT "biblia_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "biblia_reading_plans" ADD CONSTRAINT "biblia_reading_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
