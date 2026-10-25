-- CreateTable
CREATE TABLE "Entry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rank" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "commentCount" INTEGER NOT NULL,
    "crawledAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedFilter" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "triggeredCrawl" BOOLEAN NOT NULL
);

-- CreateIndex
CREATE INDEX "Entry_crawledAt_idx" ON "Entry"("crawledAt");
