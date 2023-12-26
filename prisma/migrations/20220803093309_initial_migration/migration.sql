CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('WORKER', 'HIRING', 'ADMIN');

-- CreateTable
CREATE TABLE "user" (
    "id" text NOT NULL,
    "firebase_uid" text NOT NULL,
    "email" text NOT NULL,
    "email_verified" boolean NOT NULL DEFAULT FALSE,
    "fullName" text,
    "bio" text,
    "metadata" jsonb,
    "created_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamp(3) NOT NULL,
    "roles" "Role" [] DEFAULT ARRAY ['WORKER'] :: "Role" [],
    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password" (
    "hash" text NOT NULL,
    "userId" text NOT NULL
);

-- CreateTable
CREATE TABLE "note" (
    "id" text NOT NULL,
    "title" text NOT NULL,
    "body" text NOT NULL,
    "createdAt" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp(3) NOT NULL,
    "userId" text NOT NULL,
    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log" (
    "id" serial NOT NULL,
    "msg" text NOT NULL,
    "date_created" date NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" serial NOT NULL,
    "external_id" text DEFAULT gen_random_uuid (),
    "title" text NOT NULL,
    "description" text NOT NULL,
    "company_name" text NOT NULL,
    "location" text,
    "post_source" text,
    "thumbnail" text,
    "metadata" jsonb,
    "details_metadata" jsonb,
    "created_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" timestamptz(6),
    "data_source" text,
    "created_by_user_id" text,
    "state" text DEFAULT 'NEW',
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "serp_google_jobs_import" (
    "id" serial NOT NULL,
    "external_id" text NOT NULL,
    "q" text,
    "raw_data" jsonb,
    "start_index" integer,
    "jobs_count" integer,
    "detail_records" jsonb,
    "details_complete" boolean DEFAULT FALSE,
    "date_created" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
    "date_imported" timestamp(6),
    "date_updated" timestamp(6) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "serp_google_jobs_import_pkey" PRIMARY KEY ("external_id")
);

-- CreateTable
CREATE TABLE "timers" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid (),
    "name" text NOT NULL,
    "targetDate" timestamptz(6) NOT NULL,
    "createDate" timestamptz(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateDate" timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "enabled" boolean NOT NULL DEFAULT TRUE,
    CONSTRAINT "timers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_firebase_uid_key" ON "user" ("firebase_uid");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user" ("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_userId_key" ON "password" ("userId");

-- CreateIndex
CREATE UNIQUE INDEX "posts_external_id_data_source_key" ON "posts" ("external_id", "data_source");

-- AddForeignKey
ALTER TABLE
    "password"
ADD
    CONSTRAINT "password_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE
    "note"
ADD
    CONSTRAINT "note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE;