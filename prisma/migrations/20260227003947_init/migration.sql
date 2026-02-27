-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "News" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "summary" VARCHAR(500) NOT NULL,
    "content" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "News_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Author_email_key" ON "Author"("email");

-- CreateIndex
CREATE UNIQUE INDEX "News_slug_key" ON "News"("slug");

-- CreateIndex
CREATE INDEX "News_authorId_idx" ON "News"("authorId");

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;
