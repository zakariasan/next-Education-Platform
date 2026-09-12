# PhysiClub — Education Platform

Next.js 15 + Prisma/PostgreSQL platform for schools: classes, lessons, quizzes, exams,
attendance sessions (séances) with XP, and a gamified project system ("modules" mapped on
an interactive **Holy Graph**). Three roles: **Teacher**, **Student**, **Admin**.

- Setup & demo accounts → [Getting started](#getting-started)
- Who can see what → [Roles at a glance](#roles-at-a-glance)
- Step-by-step tours → [Teacher](#teacher-walkthrough) · [Student](#student-walkthrough) · [Admin](#admin-walkthrough)
- How things connect → [Data relationships](#data-relationships)
- Attendance: manual or automatic? → [Attendance](#attendance-automatic-for-planned-sessions-manual-corrections)
- Quizzes → [Quizzes](#quizzes)
- Projects, XP, levels, badges → [docs/gamification.md](docs/gamification.md)

---

## Getting started

```bash
# 1. Postgres (the repo's dev DB is a docker container listening on 5433)
docker start edu-platform-db          # or your own Postgres; set DATABASE_URL in .env

# 2. Install, push schema, seed demo data
npm install
npx prisma db push
npm run db:seed                       # demo school, class, teacher, admin, 4 students, Physics module

# 3. Run
npm run dev                           # http://localhost:3000
npm test                              # unit tests (vitest)
```

`.env` needs `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` (and Google/Facebook OAuth ids if you use those buttons).

### Demo accounts (password for all: `password123`)

| Role | Email | What's pre-loaded |
| --- | --- | --- |
| Teacher | `physics.teacher@physiclub.demo` | School "Lycée Demo", class "Physics 1 – Mechanics" (key `PHYS01`), module "Physics – Mechanics" (12 core + 4 elective projects), pending reviews |
| Admin | `admin@physiclub.demo` | Sees every school, teacher, module and review queue |
| Student | `alice@physiclub.demo` | 4 projects validated, one failed attempt (retry cooldown demo) |
| Student | `bilal@physiclub.demo` | 1 validated, 1 failed (cooldown active) |
| Student | `chloe@physiclub.demo` | Furthest along, level 5, badges, has a peer review to do |
| Student | `dani@physiclub.demo` | Fresh account — nothing started |

---

## Logging in and choosing a role

1. Open `/auth/login`. Sign in with email + password, Google, or Facebook.
2. **First sign-in** (new account, or OAuth) → `/auth/select-role` asks **Teacher** or **Student**. The choice is permanent (the API refuses to change it afterwards).
3. `/dashboard` reads the role and redirects: `TEACHER → /dashboard/teacher`, `STUDENT → /dashboard/student`, `ADMIN → /dashboard/admin`.

**Admin cannot be picked at sign-up.** It is only granted by the seed (`admin@physiclub.demo`) or by setting `role = 'ADMIN'` on the user row in the database.

Registration with email/password: `/auth/register` → then log in → pick a role.

---

## Roles at a glance

| | Teacher | Student | Admin |
| --- | --- | --- | --- |
| **Schools** | Sees only schools they belong to (`/dashboard/teacher/schools`); can create a school (becomes creator + member) | Sees the school name of each class they joined (home page card) | Sees **all** schools; creates schools and assigns a teacher (`/dashboard/admin`) |
| **Classes** | Creates classes inside one of their schools; each class gets a 6-char **join key**; manages students, lessons, quizzes, exams, séances | Joins a class by typing its key on the home page; then sees that class, its teacher and school | Global counts on the overview (no class editing UI) |
| **Students** | `Students` page: attendance %, XP, level and status (Good / At Risk / Critical / Excellent) across their classes; per-class student list | Leaderboard of their class(es) by total XP | Total student count and total XP |
| **Modules / Holy Graph** | Creates modules, builds projects (rubric, hours, XP, prerequisites), publishes, pins graph positions, sees analytics, grades the review queue | Sees the **published** modules of the teachers of their classes; starts/submits/retries projects on the graph; peer-reviews classmates | Manages **every** module (same screens as a teacher, plus picks the owning teacher); sees every review queue |
| **Attendance / XP** | Creates séances and marks attendance + XP per student | Sees attendance and XP per session on the home chart | Sees aggregate XP only |
| **Theme** | Light/dark toggle in the sidebar for everyone | | |

---

## Teacher walkthrough

Log in as `physics.teacher@physiclub.demo`. Sidebar: **Home · Schools · Classes · Modules · Reviews · Assignments & Quizzes · Students · Events**.

1. **Home** — totals (students, classes, sessions, attendance), next session, leaderboard, quick "Create class".
2. **Schools** — the schools you belong to. `+ Create a School` makes you creator and member. A class must belong to one of your schools.
3. **Classes** → `Create a Class` (name, description, school). Open a class:
   - **Students** tab — enrolled students; add a student directly.
   - **Lessons** tab — rich-text lessons (draft → published) with materials; LaTeX materials supported.
   - **Quizzes** tab — Google-Forms style quizzes, see [Quizzes](#quizzes).
   - **Exams** (`/classes/[id]/exams`) — exam with statement/correction/rubric files, per-student score → XP (`maxXP × score/maxScore`).
   - **Séances** (`/classes/[id]/seances`) — attendance sessions, see [Attendance](#attendance-automatic-for-planned-sessions-manual-corrections).
   - Share the class **key** (shown on the class card) with students so they can join.
4. **Modules** — project tracks (the 42-style part):
   - `New Module` (title, subject, description) → module page.
   - `New project` opens the **builder**: title, hours, XP, core/elective switch, validation threshold, statement in Markdown + `$LaTeX$`, learning objectives, allowed resources, **rubric** (criteria with weight and mode `Auto` / `Teacher` / `Peer`; auto criteria take a numeric answer ± tolerance, MCQ or unit check), and **prerequisites** (options that would create a cycle are disabled). Live preview on the right.
   - Save → draft. **Publish** the project, then **Publish module** so students see it. Editing a published project creates a new version; students already working keep the old one.
   - Module page shows the **Holy Graph preview** (drag a node to pin its position; `Auto layout` to reset) and **Analytics**: attempts, validation rate, average real hours vs your estimate (flagged in red when off by more than 30 % — recalibrate hours/XP), and the criteria students fail most.
5. **Reviews** — every submission that has `Teacher` criteria (and peer criteria you may spot-check). Open one: statement, student answers, auto scores already filled, sliders for your criteria, overall feedback → `Send review`. The attempt validates when the weighted score reaches the threshold; XP is credited once per project.
6. **Assignments & Quizzes** — every quiz across your classes + pending project reviews. **Students** — attendance/XP/level table. **Events** — plan sessions/exams/events; sessions record attendance automatically.

## Student walkthrough

Log in as `alice@physiclub.demo`. Sidebar: **Home · Holy Graph · Quizzes · Events · Peer Reviews**.

1. **Home** — level ring, XP bar, badges, `Open the Holy Graph`; school & class cards; **Join a New Class** (paste the teacher's key, e.g. `PHYS01`); XP-per-session chart; class leaderboard.
2. **Holy Graph** → pick a module → the circuit board:
   - Columns = prerequisite depth; square chips on the thick rail = common core, dashed round nodes = electives.
   - Node states: 🔒 locked (dashed, dim), ▶ available (pulsing ring), ⏳ in progress (moving dashes), ✓ validated (lit green, current flows to the next nodes), ✕ failed (flicker, retry after cooldown). Pan by dragging, zoom with wheel/pinch/buttons, `Circuit`/`List` toggle, keyboard: Tab + Enter.
   - Click a node → project panel (bottom sheet on phones): prerequisites, statement, objectives, resources, rubric. `Start project` starts the clock. Answer each criterion (number + unit, choices, text) → `Submit for review`. Auto criteria are graded instantly; teacher/peer criteria go to review. Validated under the estimated hours = speed bonus; a failed attempt can be retried after the cooldown with a small XP penalty.
   - When a project validates: `+XP` floats over the node, the traces to newly unlocked nodes surge, level-ups and badges toast.
3. **Quizzes** — published quizzes from your classes: take once, see score, XP and (if allowed) the correct answers. **Events** — upcoming/past sessions and events with your attendance and the +1 XP.
4. **Peer Reviews** — submissions from classmates on projects you already validated (only their `Peer` criteria and answers are visible). Grading earns XP and a correction point.

Students never see other students' answers except through an assigned peer review, and never see auto-grading answer keys.

## Admin walkthrough

Log in as `admin@physiclub.demo`. Sidebar: **Overview · Modules · Reviews**.

1. **Overview** — counts of schools, teachers, students, classes, total XP; `Create a School` (name + owning teacher); list of all schools with their teachers and classes.
2. **Modules** — every module on the platform with its teacher. `New Module` asks which teacher owns it. Opening a module gives the same page as the teacher (projects, publishing, graph pinning, analytics, project builder).
3. **Reviews** — all pending teacher/peer reviews across the platform; admins can grade on behalf of the assigned reviewer.

---

## Data relationships

```mermaid
erDiagram
  User ||--o{ School : "creates (teacher/admin)"
  School ||--o{ SchoolTeacher : "members"
  User ||--o{ SchoolTeacher : "teacher"
  School ||--o{ Class : "hosts"
  User ||--o{ Class : "teaches"
  Class }o--o{ User : "students (join by key)"
  Class ||--o{ ClassEnrollment : "ban / streak metadata"
  Class ||--o{ Lesson : ""
  Class ||--o{ Quiz : ""
  Quiz }o--o| Project : "optional link / rubric criterion"
  Quiz ||--o{ QuizAttempt : "one per student"
  Event ||--o| Seance : "session events own a séance"
  Class ||--o{ Exam : ""
  Class ||--o{ Seance : "attendance sessions"
  Seance ||--o{ SeanceParticipation : "one row per student"
  User ||--o{ Module : "teacher owns"
  Module ||--o{ Project : "ordered nodes"
  Project }o--o{ Project : "prerequisites (edges)"
  Project ||--o{ ProjectVersion : "immutable content"
  ProjectVersion ||--o{ RubricCriterion : ""
  Project ||--o{ ProjectAttempt : "per student"
  ProjectAttempt ||--o{ CriterionScore : ""
  ProjectAttempt ||--o{ ReviewAssignment : "teacher / peer"
  User ||--o{ XpEvent : "ledger (User.totalXP kept in sync)"
  User ||--o{ UserBadge : ""
```

In words:

- **School → Class → Students.** A teacher belongs to one or more schools (`SchoolTeacher`) and creates classes inside them. A class has exactly one teacher and one school. Students are not tied to a school directly: they join a **class** with its key and inherit the school through it. One student can be in several classes.
- **Séances belong to a class.** Each séance has one `SeanceParticipation` per student (attendance status + XP points).
- **Modules belong to a teacher, not to a class.** A student sees the published modules of *every teacher whose class they joined*. So: create the class, have students join it, then publish the module — it appears for all of them, in every class of that teacher.
- **Projects** live inside a module; prerequisites link projects of the same module (a DAG — the API refuses cycles). Content is versioned; attempts point to a version.
- **XP** from séances, exams and projects all increment `User.totalXP`, which drives the leaderboard, the level (`lib/gamification/level.ts`) and the admin totals. Project XP is additionally recorded in the `XpEvent` ledger, once per project.

---

## Attendance: automatic for planned sessions, manual corrections

1. Teacher → **Events** → `Plan` → type **Class session**, pick the class, start/end (end defaults to +2 h). This creates the event and a linked séance.
2. When the end time passes, the next page load (events, dashboard, student events) **settles** the session: every student enrolled in the class gets `PRESENT` and **+1 XP** (once; `Seance.settledAt` guards re-runs, `XpEvent` key `session:<student>:<seance>`).
3. Teacher opens the séance (`Attendance` button on the event, or Class → Séances) and fixes exceptions: **PRESENT / ABSENT / LATE / EXCUSED** and per-student XP; the XP difference is applied immediately.
4. Events can be edited by their creator (admins: any). A settled session cannot be deleted — the attendance is part of the record.
5. Ad-hoc sessions can still be created manually from Class → Séances (no automatic settlement).

Attendance rate and XP feed the teacher's **Students** page and the student's home chart.

## Quizzes

Google-Forms style: Class → **Quizzes** → `New quiz`. Question types: multiple choice (bullets), checkboxes (partial credit, wrong picks penalised), true/false, short answer (case-insensitive, alternatives with `|`), numeric ± tolerance. Each question has points, required flag, optional image. Settings: due date, time limit (auto-submit at zero), XP at 100 %, reveal answers after submit, link to a lesson and to a **Holy Graph module/project**.

- Draft until **Publish**; students see published quizzes under **Quizzes** (to do / done) and inside the linked project's panel.
- One attempt per student; XP = `xpReward × percent`, awarded once. Teachers see per-student results and can **Reset** an attempt (XP reverted).
- A project rubric criterion can be **Quiz score** (auto): graded from the student's quiz percentage, or pass/fail at a chosen %.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | dev server (Turbopack) |
| `npm run build` | `prisma generate` + `db push` + `next build` |
| `npm test` | vitest unit tests (unlocking, cycles, XP once, level curve, threshold, retry, auto-grading, layout) |
| `npm run db:seed` | rebuild demo data (idempotent) |
| `npx tsx prisma/backfill-schools.ts` | one-off: attach school-less classes to a default school |

Add a new subject module: see [docs/gamification.md](docs/gamification.md#adding-a-new-subject-module).
