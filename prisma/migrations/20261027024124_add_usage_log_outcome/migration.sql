-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UsageLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedFilter" TEXT NOT NULL,
    "resultCount" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "triggeredCrawl" BOOLEAN NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT 'success'
);
INSERT INTO "new_UsageLog" ("appliedFilter", "durationMs", "id", "resultCount", "timestamp", "triggeredCrawl") SELECT "appliedFilter", "durationMs", "id", "resultCount", "timestamp", "triggeredCrawl" FROM "UsageLog";
DROP TABLE "UsageLog";
ALTER TABLE "new_UsageLog" RENAME TO "UsageLog";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
