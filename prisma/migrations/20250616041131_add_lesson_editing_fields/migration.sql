/*
  Warnings:

  - Added the required column `content` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN "dueDate" DATETIME;
ALTER TABLE "Quiz" ADD COLUMN "duration" INTEGER;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "classId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("classId", "createdAt", "description", "id", "title", "updatedAt") SELECT "classId", "createdAt", "description", "id", "title", "updatedAt" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new__studentClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_studentClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_studentClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__studentClasses" ("A", "B") SELECT "A", "B" FROM "_studentClasses";
DROP TABLE "_studentClasses";
ALTER TABLE "new__studentClasses" RENAME TO "_studentClasses";
CREATE UNIQUE INDEX "_studentClasses_AB_unique" ON "_studentClasses"("A", "B");
CREATE INDEX "_studentClasses_B_index" ON "_studentClasses"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
