-- CreateTable
CREATE TABLE "_studentQuizzes" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_studentQuizzes_A_fkey" FOREIGN KEY ("A") REFERENCES "Quiz" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_studentQuizzes_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new__studentClasses" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_studentClasses_A_fkey" FOREIGN KEY ("A") REFERENCES "Class" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_studentClasses_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new__studentClasses" ("A", "B") SELECT "A", "B" FROM "_studentClasses";
DROP TABLE "_studentClasses";
ALTER TABLE "new__studentClasses" RENAME TO "_studentClasses";
CREATE UNIQUE INDEX "_studentClasses_AB_unique" ON "_studentClasses"("A", "B");
CREATE INDEX "_studentClasses_B_index" ON "_studentClasses"("B");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_studentQuizzes_AB_unique" ON "_studentQuizzes"("A", "B");

-- CreateIndex
CREATE INDEX "_studentQuizzes_B_index" ON "_studentQuizzes"("B");
