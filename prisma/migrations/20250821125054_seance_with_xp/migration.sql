/*
  Warnings:

  - You are about to drop the column `pointsDelta` on the `SeanceParticipation` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SeanceParticipation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seanceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attendance" TEXT NOT NULL DEFAULT 'PRESENT',
    "points" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeanceParticipation_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SeanceParticipation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_SeanceParticipation" ("attendance", "createdAt", "id", "notes", "seanceId", "studentId", "updatedAt") SELECT "attendance", "createdAt", "id", "notes", "seanceId", "studentId", "updatedAt" FROM "SeanceParticipation";
DROP TABLE "SeanceParticipation";
ALTER TABLE "new_SeanceParticipation" RENAME TO "SeanceParticipation";
CREATE UNIQUE INDEX "SeanceParticipation_seanceId_studentId_key" ON "SeanceParticipation"("seanceId", "studentId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
