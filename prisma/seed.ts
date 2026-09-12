// Demo seed: one teacher, a school + class, four students and the Physics –
// Mechanics module with realistic attempts so the Holy Graph is demo-able.
// Idempotent: re-running rebuilds the demo module and demo users' XP.
//   npm run db:seed
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";
import { PHYSICS_MECHANICS, type SeedModule } from "./seed-data/physics-mechanics";
import { BADGES } from "../lib/gamification/badges";
import { GAMIFICATION } from "../lib/gamification/config";
import { validationDedupeKey } from "../lib/gamification/service";
import { hoursBetween, xpForValidation } from "../lib/gamification/scoring";

const MODULES: SeedModule[] = [PHYSICS_MECHANICS];
const PASSWORD = "password123";

const DEMO_USERS = {
  teacher: { email: "physics.teacher@physiclub.demo", name: "Dr. Nour Haddad", role: "TEACHER" as const },
  admin: { email: "admin@physiclub.demo", name: "Platform Admin", role: "ADMIN" as const },
  students: [
    { email: "alice@physiclub.demo", name: "Alice Martin" },
    { email: "bilal@physiclub.demo", name: "Bilal Karim" },
    { email: "chloe@physiclub.demo", name: "Chloé Dubois" },
    { email: "dani@physiclub.demo", name: "Dani Reyes" },
  ],
};

async function upsertUser(u: { email: string; name: string; role: "TEACHER" | "STUDENT" | "ADMIN" }) {
  const password = await bcrypt.hash(PASSWORD, 10);
  return prisma.user.upsert({
    where: { email: u.email },
    update: { name: u.name, role: u.role },
    create: { ...u, password, provider: "credentials", correctionPoints: GAMIFICATION.correctionPoints.initial },
  });
}

async function seedModule(def: SeedModule, teacherId: string) {
  await prisma.xpEvent.deleteMany({ where: { moduleId: def.id } });
  await prisma.module.deleteMany({ where: { id: def.id } });

  const module = await prisma.module.create({
    data: { id: def.id, title: def.title, subject: def.subject, description: def.description, status: "PUBLISHED", teacherId },
  });

  for (const [i, p] of def.projects.entries()) {
    const project = await prisma.project.create({
      data: { id: p.id, moduleId: module.id, teacherId, isCore: p.isCore, orderIndex: i, status: "PUBLISHED" },
    });
    const version = await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        versionNumber: 1,
        title: p.title,
        statement: p.statement,
        objectives: p.objectives,
        estimatedHours: p.estimatedHours,
        xpReward: p.xpReward,
        allowedResources: p.allowedResources,
        threshold: p.threshold ?? GAMIFICATION.validation.defaultThresholdPercent,
        criteria: {
          create: p.criteria.map((c, j) => ({
            title: c.title,
            description: c.description,
            weight: c.weight,
            mode: c.mode,
            orderIndex: j,
            autoConfig: c.autoConfig ?? undefined,
          })),
        },
      },
    });
    await prisma.project.update({ where: { id: project.id }, data: { currentVersionId: version.id } });
  }
  for (const p of def.projects) {
    if (!p.prerequisites.length) continue;
    await prisma.project.update({
      where: { id: p.id },
      data: { prerequisites: { connect: p.prerequisites.map((id) => ({ id })) } },
    });
  }
  return module;
}

type ValidatedSpec = { projectId: string; actualHours: number; failedBefore?: number };

async function validateProject(studentId: string, moduleId: string, spec: ValidatedSpec, when: Date) {
  const project = await prisma.project.findUniqueOrThrow({
    where: { id: spec.projectId },
    include: { currentVersion: { include: { criteria: true } } },
  });
  const version = project.currentVersion!;
  const startedAt = new Date(when.getTime() - spec.actualHours * 3600_000);
  let attemptNumber = 1;
  for (let f = 0; f < (spec.failedBefore ?? 0); f++) {
    const fStart = new Date(startedAt.getTime() - (f + 1) * 48 * 3600_000);
    await prisma.projectAttempt.create({
      data: {
        projectId: project.id, versionId: version.id, studentId, attemptNumber: attemptNumber++,
        state: "FAILED", startedAt: fStart, submittedAt: new Date(fStart.getTime() + 3600_000 * 2),
        reviewedAt: new Date(fStart.getTime() + 3600_000 * 5), actualHours: 2, score: 45, feedback: "Units missing and the derivation skips a step. Retry after the cooldown.",
      },
    });
  }
  const attempt = await prisma.projectAttempt.create({
    data: {
      projectId: project.id, versionId: version.id, studentId, attemptNumber,
      state: "VALIDATED", startedAt, submittedAt: when, reviewedAt: when,
      actualHours: hoursBetween(startedAt, when), score: 88, feedback: "Solid work.",
      criterionScores: { create: version.criteria.map((c) => ({ criterionId: c.id, score: c.mode === "AUTO" ? 100 : 80, mode: c.mode })) },
    },
  });
  const xp = xpForValidation({
    xpReward: version.xpReward, estimatedHours: version.estimatedHours,
    actualHours: attempt.actualHours, failedAttemptsBefore: spec.failedBefore ?? 0,
  });
  await prisma.xpEvent.create({
    data: { userId: studentId, amount: xp.total, reason: "PROJECT_VALIDATED", projectId: project.id, moduleId, attemptId: attempt.id, dedupeKey: validationDedupeKey(studentId, project.id), createdAt: when },
  });
  await prisma.projectAttempt.update({ where: { id: attempt.id }, data: { xpAwarded: xp.total } });
  await prisma.user.update({ where: { id: studentId }, data: { totalXP: { increment: xp.total } } });
  return attempt;
}

async function main() {
  const teacher = await upsertUser(DEMO_USERS.teacher);
  await upsertUser(DEMO_USERS.admin);
  const students = [];
  for (const s of DEMO_USERS.students) students.push(await upsertUser({ ...s, role: "STUDENT" }));
  const [alice, bilal, chloe] = students;

  // School + class so the existing dashboards work for the demo accounts.
  const school = await prisma.school.upsert({
    where: { id: "school-demo" },
    update: {},
    create: { id: "school-demo", name: "Lycée Demo", description: "Demo school", createdById: teacher.id, teachers: { create: { teacherId: teacher.id } } },
  });
  const klass = await prisma.class.upsert({
    where: { key: "PHYS01" },
    update: { students: { connect: students.map((s) => ({ id: s.id })) } },
    create: { name: "Physics 1 – Mechanics", key: "PHYS01", teacherId: teacher.id, schoolId: school.id, students: { connect: students.map((s) => ({ id: s.id })) } },
  });
  for (const s of students) {
    await prisma.classEnrollment.upsert({
      where: { classId_studentId: { classId: klass.id, studentId: s.id } },
      update: {},
      create: { classId: klass.id, studentId: s.id },
    });
  }

  for (const b of BADGES) {
    await prisma.badge.upsert({ where: { code: b.code }, update: { title: b.title, description: b.description, icon: b.icon }, create: b });
  }

  // Reset demo students' gamification state before rebuilding it.
  await prisma.xpEvent.deleteMany({ where: { userId: { in: students.map((s) => s.id) } } });
  await prisma.userBadge.deleteMany({ where: { userId: { in: students.map((s) => s.id) } } });
  await prisma.user.updateMany({ where: { id: { in: students.map((s) => s.id) } }, data: { totalXP: 0 } });

  for (const def of MODULES) await seedModule(def, teacher.id);

  const mod = PHYSICS_MECHANICS.id;
  const P = (id: string) => `phys-mech-${id}`;
  const day = (n: number) => new Date(Date.now() - n * 86_400_000);

  // Alice: three core projects done, projectile submitted and waiting for a peer review.
  await validateProject(alice.id, mod, { projectId: P("p01"), actualHours: 2.5 }, day(20));
  await validateProject(alice.id, mod, { projectId: P("p02"), actualHours: 4.5 }, day(16));
  await validateProject(alice.id, mod, { projectId: P("p03"), actualHours: 6 }, day(10));
  const aliceP04Version = await prisma.project.findUniqueOrThrow({ where: { id: P("p04") }, include: { currentVersion: { include: { criteria: true } } } });
  const aliceP04 = await prisma.projectAttempt.create({
    data: {
      projectId: P("p04"), versionId: aliceP04Version.currentVersionId!, studentId: alice.id,
      state: "UNDER_REVIEW", startedAt: day(5), submittedAt: day(1), actualHours: 4.2,
      answers: Object.fromEntries(aliceP04Version.currentVersion!.criteria.map((c) => [c.id, c.mode === "AUTO" ? [1] : "See attached report: v0 ≈ 6.1 m/s, predicted R = 3.8 m, measured 3.5 m."])),
      criterionScores: { create: aliceP04Version.currentVersion!.criteria.filter((c) => c.mode === "AUTO").map((c) => ({ criterionId: c.id, score: 100, mode: "AUTO" as const })) },
    },
  });

  // Bilal: first project done, failed Vectors once (cooldown demo).
  await validateProject(bilal.id, mod, { projectId: P("p01"), actualHours: 3.5 }, day(18));
  const bilalP02Version = await prisma.project.findUniqueOrThrow({ where: { id: P("p02") }, select: { currentVersionId: true } });
  await prisma.projectAttempt.create({
    data: {
      projectId: P("p02"), versionId: bilalP02Version.currentVersionId!, studentId: bilal.id, attemptNumber: 1,
      state: "FAILED", startedAt: day(3), submittedAt: day(2), reviewedAt: new Date(Date.now() - 3 * 3600_000),
      actualHours: 5, score: 52, feedback: "Drift computed with the wrong component. Redo part 2.",
    },
  });

  // Chloé: far along, has an elective, capstone path open. Submitted Friction for teacher review.
  for (const [pid, hours, d] of [["p01", 2, 30], ["p02", 3, 27], ["p03", 4, 24], ["p04", 4, 20], ["p05", 5, 15], ["e01", 1.5, 14], ["p07", 5.5, 8]] as const) {
    await validateProject(chloe.id, mod, { projectId: P(pid), actualHours: hours }, day(d));
  }
  const chloeP06Version = await prisma.project.findUniqueOrThrow({ where: { id: P("p06") }, select: { currentVersionId: true } });
  const chloeP06 = await prisma.projectAttempt.create({
    data: {
      projectId: P("p06"), versionId: chloeP06Version.currentVersionId!, studentId: chloe.id,
      state: "UNDER_REVIEW", startedAt: day(4), submittedAt: day(1), actualHours: 4.8,
      answers: {},
    },
  });
  await prisma.reviewAssignment.create({ data: { attemptId: chloeP06.id, reviewerId: teacher.id, kind: "TEACHER" } });
  // Alice's projectile peer criterion goes to Chloé (who validated it) + teacher for the rest.
  await prisma.reviewAssignment.create({ data: { attemptId: aliceP04.id, reviewerId: chloe.id, kind: "PEER" } });
  await prisma.reviewAssignment.create({ data: { attemptId: aliceP04.id, reviewerId: teacher.id, kind: "TEACHER" } });

  // Badges consistent with the state above.
  const badgeId = async (code: string) => (await prisma.badge.findUniqueOrThrow({ where: { code } })).id;
  const award = async (userId: string, code: string) => prisma.userBadge.create({ data: { userId, badgeId: await badgeId(code) } });
  await award(alice.id, "FIRST_CORE");
  await award(alice.id, "SPEED_RUN");
  await award(bilal.id, "FIRST_CORE");
  await award(chloe.id, "FIRST_CORE");
  await award(chloe.id, "SPEED_RUN");
  await award(chloe.id, "ELECTIVE_EXPLORER");
  await award(chloe.id, "LEVEL_5");

  console.log("Seeded:", {
    teacher: DEMO_USERS.teacher.email,
    admin: DEMO_USERS.admin.email,
    students: DEMO_USERS.students.map((s) => s.email),
    password: PASSWORD,
    classKey: "PHYS01",
    modules: MODULES.map((m) => `${m.title} (${m.projects.length} projects)`),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
