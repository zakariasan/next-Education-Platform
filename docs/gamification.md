# Gamified project-based learning

42-style modules: a **Module** is a subject track made of **Projects** linked by
prerequisites (the "Holy Graph"). Students validate projects to earn XP, level
up, unlock the next nodes and collect badges.

## Data model (`prisma/schema.prisma`)

| Model | Purpose |
| --- | --- |
| `Module` | Subject track owned by a teacher. `status` DRAFT/PUBLISHED/ARCHIVED. Visible to every student enrolled in one of that teacher's classes. |
| `Project` | Graph node identity: `moduleId`, `isCore` (common core vs elective), `orderIndex`, `status`, optional pinned position (`pinX`/`pinY`), self many-to-many `prerequisites` ↔ `dependents`. Points to `currentVersionId`. |
| `ProjectVersion` | Editable content snapshot: title, statement (markdown + `$LaTeX$`), objectives, `estimatedHours`, `xpReward`, `allowedResources`, `threshold` (%) and its `criteria`. Editing a **published** project creates a new version; attempts keep pointing at the version they were made on. |
| `RubricCriterion` | `weight`, `mode` (`AUTO` / `TEACHER` / `PEER`), `autoConfig` for auto-grading (`NUMERIC`, `MCQ`, `UNIT`, `QUIZ` — graded from the student's `QuizAttempt` on a linked quiz). |
| `Quiz` / `QuizAttempt` | Class quizzes (`lib/quiz/`) optionally linked to a module/project; XP `xpReward × percent`, once per student (`XpEvent` key `quiz:<student>:<quiz>`). |
| `ProjectAttempt` | One student attempt on one project version. State machine `NOT_STARTED → IN_PROGRESS → SUBMITTED → UNDER_REVIEW → VALIDATED | FAILED`. Tracks `startedAt`, `submittedAt`, `actualHours`, `answers`, weighted `score`, `feedback`, `reviewer`, `xpAwarded`, `attemptNumber`. |
| `CriterionScore` | Score (0–100) per criterion per attempt, with grader and `spotChecked`. |
| `ReviewAssignment` | Pending/done review of an attempt by a teacher or a peer (peers must have validated the project). |
| `XpEvent` | Append-only ledger. `dedupeKey = validated:<userId>:<projectId>` (unique) guarantees XP is awarded **once per project**, regardless of attempts. `User.totalXP` is kept in sync for the existing leaderboard. |
| `Badge` / `UserBadge` | Catalogue (seeded from `lib/gamification/badges.ts`) and awards. |
| `User.correctionPoints` | Reserved for peer-review economy (earn by reviewing, spend to request a review). |

Node states for a student are derived, never stored: `locked` (a prerequisite
is not validated), `available`, `in_progress`, `validated`, `failed`
(`lib/gamification/graph.ts → computeNodeStates`).

## Business rules — one place: `lib/gamification/config.ts`

```ts
level: { base: 100, exponent: 1.5, max: 99 }
validation: { defaultThresholdPercent: 70 }
xp: { speedBonusPercent: 15, retryPenaltyPercent: 10, retryPenaltyCapPercent: 50, peerReviewXp: 10 }
retry: { cooldownHours: 12 }
correctionPoints: { earnedPerPeerReview: 1, costPerReviewRequest: 1, initial: 2 }
```

### Level curve (`lib/gamification/level.ts`)

Cumulative XP to reach level *L*:

```
cumXp(L) = base · (L − 1) ^ exponent        // L2 = 100, L3 = 283, L5 = 800, L10 = 2700, L20 = 8300
```

Early levels come fast, later ones are earned. `levelInfo(totalXp)` returns
`level`, `xpToNextLevel`, `progress` (0–1) for the XP bar.

### Validation & XP (`lib/gamification/scoring.ts`)

1. On submit, every `AUTO` criterion is scored instantly (`autograde.ts`).
2. `TEACHER` criteria go to the teacher review queue; `PEER` criteria are
   assigned to a student who already validated the project (teacher can
   spot-check).
3. Once every criterion has a score: `weightedScore ≥ threshold` ⇒ `VALIDATED`,
   else `FAILED`.
4. XP = `xpReward` + speed bonus (validated under `estimatedHours`) − retry
   penalty (`retryPenaltyPercent` × failed attempts, capped). Awarded exactly
   once per (student, project).
5. Failed attempts can be retried after `retry.cooldownHours`. Never a permanent lock.

Students never see other students' answers until they have validated the project.

## API

| Route | Who | Purpose |
| --- | --- | --- |
| `GET/POST /api/teacher/modules` | teacher, admin | list / create modules (admins see every module and pass `teacherId`) |
| `GET/PATCH/DELETE /api/teacher/modules/[id]` | teacher, admin | module + projects, status, delete (archives if attempts exist) |
| `POST /api/teacher/modules/[id]/projects` | teacher, admin | create a draft project (version 1) |
| `GET/PATCH/DELETE …/projects/[pid]` | teacher, admin | content edits create a new version when PUBLISHED |
| `POST …/projects/[pid]/publish` | teacher, admin | `{ action: "publish" \| "archive" \| "draft" }` |
| `PUT …/projects/[pid]/prerequisites` | teacher, admin | replace prerequisites; cycles are rejected |
| `GET/PATCH /api/teacher/modules/[id]/graph` | teacher, admin | graph preview (drafts included) / pin positions |
| `GET /api/teacher/modules/[id]/dashboard` | teacher, admin | analytics (see below) |
| `GET /api/teacher/reviews`, `GET/POST …/[assignmentId]` | teacher, admin | review queue and grading (teachers can spot-check peer criteria) |
| `GET /api/student/modules` | student | published modules of the student's teachers with progress |
| `GET /api/student/modules/[id]/graph` | student | Holy Graph nodes/edges/states + level, XP, badges |
| `GET /api/student/projects/[pid]` | student | statement, rubric (answer keys stripped), own attempt, retry info |
| `POST …/start`, `POST …/submit` | student | start/retry an attempt; submit answers |
| `GET /api/student/reviews`, `GET/POST …/[assignmentId]` | student | peer review queue and grading |
| `GET /api/student/gamification` | student | level info, badges, correction points, recent XP events |

## Holy Graph

`components/gamification/HolyGraph.tsx` renders a circuit board: columns are
prerequisite depth, common-core chips sit on the central rail (thick solid
traces), electives branch off on dashed traces. Layout is deterministic
(`lib/gamification/layout.ts`); teachers can drag a node to pin it (unit
coordinates stored in `Project.pinX/pinY`). Node states use shape + icon +
animation, not colour alone. Validation triggers a surge along the newly
powered traces and an XP float; the student page also toggles to a list view.

## Teacher analytics (`lib/gamification/analytics.ts`)

Per project: attempts, students, validation rate, average actual hours vs
estimate and the three lowest-scoring criteria. A project is flagged for
recalibration when the average actual time differs from the estimate by more
than `HOURS_FLAG_RATIO` (30 %) with at least two finished attempts.

## Adding a new subject module

1. Copy `prisma/seed-data/physics-mechanics.ts` → `prisma/seed-data/<subject>.ts`.
   Give the module and each project a stable id (`mod-…`, `<prefix>-p01`, …),
   set `isCore`, `estimatedHours`, `xpReward`, `prerequisites` (ids) and a rubric.
2. Register it in `prisma/seed.ts`: `const MODULES = [PHYSICS_MECHANICS, YOUR_MODULE]`
   — or call `seedModule(prisma, def, teacherId, { moduleId, idPrefix })` from
   `prisma/seed-data/seed-module.ts` in your own script.
3. `npm run db:seed`.

Or skip seeding entirely: teachers (and admins, under `/dashboard/admin/modules`)
create modules and projects from the **Modules** section of their dashboard
(project builder with live preview and a cycle-safe prerequisites picker).
Nothing in the graph, layout or XP logic is physics-specific.

## Tests

`npm test` (vitest) covers prerequisite unlocking, cycle prevention, XP
awarded exactly once, the level formula, validation threshold, auto-grading
and retry rules — all pure functions under `lib/gamification/`.

## Demo accounts (after `npm run db:seed`)

Password `password123` for all: `physics.teacher@physiclub.demo` (teacher),
`admin@physiclub.demo` (admin), `alice|bilal|chloe|dani@physiclub.demo`
(students, class key `PHYS01`).
