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
| `RubricCriterion` | `weight`, `mode` (`AUTO` / `TEACHER` / `PEER`), `autoConfig` for auto-grading (`NUMERIC`, `MCQ`, `UNIT`). |
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

## Adding a new subject module

1. Copy `prisma/seed-data/physics-mechanics.ts` → `prisma/seed-data/<subject>.ts`.
   Give the module and each project a stable id (`mod-…`, `<prefix>-p01`, …),
   set `isCore`, `estimatedHours`, `xpReward`, `prerequisites` (ids) and a rubric.
2. Register it in `prisma/seed.ts`: `const MODULES = [PHYSICS_MECHANICS, YOUR_MODULE]`.
3. `npm run db:seed`.

Or skip seeding entirely: teachers create modules and projects from the
**Modules** section of their dashboard (project builder with live preview and
a cycle-safe prerequisites picker). Nothing in the graph, layout or XP logic is
physics-specific.

## Tests

`npm test` (vitest) covers prerequisite unlocking, cycle prevention, XP
awarded exactly once, the level formula, validation threshold, auto-grading
and retry rules — all pure functions under `lib/gamification/`.

## Demo accounts (after `npm run db:seed`)

Password `password123` for all: `physics.teacher@physiclub.demo` (teacher),
`admin@physiclub.demo` (admin), `alice|bilal|chloe|dani@physiclub.demo`
(students, class key `PHYS01`).
