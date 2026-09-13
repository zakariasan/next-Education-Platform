-- CreateTable
CREATE TABLE "Seance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "startsAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "classId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Seance_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeanceParticipation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seanceId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "attendance" TEXT NOT NULL DEFAULT 'PRESENT',
    "pointsDelta" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeanceParticipation_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES "Seance" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeanceParticipation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "avatar" TEXT,
    "provider" TEXT,
    "role" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "totalXP" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("avatar", "createdAt", "email", "id", "name", "password", "provider", "role", "updatedAt") SELECT "avatar", "createdAt", "email", "id", "name", "password", "provider", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "SeanceParticipation_seanceId_studentId_key" ON "SeanceParticipation"("seanceId", "studentId");
