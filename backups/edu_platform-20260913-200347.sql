--
-- PostgreSQL database dump
--

\restrict fufH4EwDyKE01qG2HyA1lcBJ5yRKqDZGjzlES5x5bIcJKOKvll0wbKBpyp5eNiv

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."_studentClasses" DROP CONSTRAINT IF EXISTS "_studentClasses_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_studentClasses" DROP CONSTRAINT IF EXISTS "_studentClasses_A_fkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectPrerequisites" DROP CONSTRAINT IF EXISTS "_ProjectPrerequisites_B_fkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectPrerequisites" DROP CONSTRAINT IF EXISTS "_ProjectPrerequisites_A_fkey";
ALTER TABLE IF EXISTS ONLY public."XpEvent" DROP CONSTRAINT IF EXISTS "XpEvent_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."XpEvent" DROP CONSTRAINT IF EXISTS "XpEvent_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."XpEvent" DROP CONSTRAINT IF EXISTS "XpEvent_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserBadge" DROP CONSTRAINT IF EXISTS "UserBadge_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserBadge" DROP CONSTRAINT IF EXISTS "UserBadge_badgeId_fkey";
ALTER TABLE IF EXISTS ONLY public."Seance" DROP CONSTRAINT IF EXISTS "Seance_eventId_fkey";
ALTER TABLE IF EXISTS ONLY public."Seance" DROP CONSTRAINT IF EXISTS "Seance_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."SeanceParticipation" DROP CONSTRAINT IF EXISTS "SeanceParticipation_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."SeanceParticipation" DROP CONSTRAINT IF EXISTS "SeanceParticipation_seanceId_fkey";
ALTER TABLE IF EXISTS ONLY public."School" DROP CONSTRAINT IF EXISTS "School_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolTeacher" DROP CONSTRAINT IF EXISTS "SchoolTeacher_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."SchoolTeacher" DROP CONSTRAINT IF EXISTS "SchoolTeacher_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."RubricCriterion" DROP CONSTRAINT IF EXISTS "RubricCriterion_versionId_fkey";
ALTER TABLE IF EXISTS ONLY public."ReviewAssignment" DROP CONSTRAINT IF EXISTS "ReviewAssignment_reviewerId_fkey";
ALTER TABLE IF EXISTS ONLY public."ReviewAssignment" DROP CONSTRAINT IF EXISTS "ReviewAssignment_attemptId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuizAttempt" DROP CONSTRAINT IF EXISTS "QuizAttempt_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."QuizAttempt" DROP CONSTRAINT IF EXISTS "QuizAttempt_quizId_fkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_quizId_fkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_currentVersionId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectVersion" DROP CONSTRAINT IF EXISTS "ProjectVersion_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectAttempt" DROP CONSTRAINT IF EXISTS "ProjectAttempt_versionId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectAttempt" DROP CONSTRAINT IF EXISTS "ProjectAttempt_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectAttempt" DROP CONSTRAINT IF EXISTS "ProjectAttempt_reviewerId_fkey";
ALTER TABLE IF EXISTS ONLY public."ProjectAttempt" DROP CONSTRAINT IF EXISTS "ProjectAttempt_projectId_fkey";
ALTER TABLE IF EXISTS ONLY public."Module" DROP CONSTRAINT IF EXISTS "Module_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."ModuleAssignment" DROP CONSTRAINT IF EXISTS "ModuleAssignment_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public."ModuleAssignment" DROP CONSTRAINT IF EXISTS "ModuleAssignment_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."ModuleAssignment" DROP CONSTRAINT IF EXISTS "ModuleAssignment_assignedById_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_senderId_fkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Materials" DROP CONSTRAINT IF EXISTS "Materials_lessonId_fkey";
ALTER TABLE IF EXISTS ONLY public."Materials" DROP CONSTRAINT IF EXISTS "Materials_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."GraphEdge" DROP CONSTRAINT IF EXISTS "GraphEdge_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Exercise" DROP CONSTRAINT IF EXISTS "Exercise_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExerciseSubmission" DROP CONSTRAINT IF EXISTS "ExerciseSubmission_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExerciseSubmission" DROP CONSTRAINT IF EXISTS "ExerciseSubmission_exerciseId_fkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_moduleId_fkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamResult" DROP CONSTRAINT IF EXISTS "ExamResult_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamResult" DROP CONSTRAINT IF EXISTS "ExamResult_examId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamRating" DROP CONSTRAINT IF EXISTS "ExamRating_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamRating" DROP CONSTRAINT IF EXISTS "ExamRating_examId_fkey";
ALTER TABLE IF EXISTS ONLY public."ExamFile" DROP CONSTRAINT IF EXISTS "ExamFile_examId_fkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_createdById_fkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_classId_fkey";
ALTER TABLE IF EXISTS ONLY public."CriterionScore" DROP CONSTRAINT IF EXISTS "CriterionScore_graderId_fkey";
ALTER TABLE IF EXISTS ONLY public."CriterionScore" DROP CONSTRAINT IF EXISTS "CriterionScore_criterionId_fkey";
ALTER TABLE IF EXISTS ONLY public."CriterionScore" DROP CONSTRAINT IF EXISTS "CriterionScore_attemptId_fkey";
ALTER TABLE IF EXISTS ONLY public."Class" DROP CONSTRAINT IF EXISTS "Class_teacherId_fkey";
ALTER TABLE IF EXISTS ONLY public."Class" DROP CONSTRAINT IF EXISTS "Class_schoolId_fkey";
ALTER TABLE IF EXISTS ONLY public."ClassEnrollment" DROP CONSTRAINT IF EXISTS "ClassEnrollment_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."ClassEnrollment" DROP CONSTRAINT IF EXISTS "ClassEnrollment_classId_fkey";
DROP INDEX IF EXISTS public."_studentClasses_B_index";
DROP INDEX IF EXISTS public."_ProjectPrerequisites_B_index";
DROP INDEX IF EXISTS public."XpEvent_userId_moduleId_idx";
DROP INDEX IF EXISTS public."XpEvent_dedupeKey_key";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."UserBadge_userId_badgeId_key";
DROP INDEX IF EXISTS public."Seance_eventId_key";
DROP INDEX IF EXISTS public."SeanceParticipation_seanceId_studentId_key";
DROP INDEX IF EXISTS public."SchoolTeacher_schoolId_teacherId_key";
DROP INDEX IF EXISTS public."ReviewAssignment_reviewerId_status_idx";
DROP INDEX IF EXISTS public."ReviewAssignment_attemptId_reviewerId_key";
DROP INDEX IF EXISTS public."Quiz_classId_idx";
DROP INDEX IF EXISTS public."QuizAttempt_quizId_studentId_key";
DROP INDEX IF EXISTS public."Project_moduleId_idx";
DROP INDEX IF EXISTS public."Project_currentVersionId_key";
DROP INDEX IF EXISTS public."ProjectVersion_projectId_versionNumber_key";
DROP INDEX IF EXISTS public."ProjectAttempt_studentId_idx";
DROP INDEX IF EXISTS public."ProjectAttempt_state_idx";
DROP INDEX IF EXISTS public."ProjectAttempt_projectId_studentId_attemptNumber_key";
DROP INDEX IF EXISTS public."ModuleAssignment_moduleId_classId_key";
DROP INDEX IF EXISTS public."ModuleAssignment_classId_idx";
DROP INDEX IF EXISTS public."GraphEdge_moduleId_idx";
DROP INDEX IF EXISTS public."GraphEdge_moduleId_fromKind_fromId_toKind_toId_key";
DROP INDEX IF EXISTS public."ExerciseSubmission_exerciseId_studentId_key";
DROP INDEX IF EXISTS public."ExamResult_examId_studentId_key";
DROP INDEX IF EXISTS public."ExamRating_examId_studentId_key";
DROP INDEX IF EXISTS public."CriterionScore_attemptId_criterionId_key";
DROP INDEX IF EXISTS public."Class_key_key";
DROP INDEX IF EXISTS public."ClassEnrollment_classId_studentId_key";
DROP INDEX IF EXISTS public."Badge_code_key";
ALTER TABLE IF EXISTS ONLY public."_studentClasses" DROP CONSTRAINT IF EXISTS "_studentClasses_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."_ProjectPrerequisites" DROP CONSTRAINT IF EXISTS "_ProjectPrerequisites_AB_pkey";
ALTER TABLE IF EXISTS ONLY public."XpEvent" DROP CONSTRAINT IF EXISTS "XpEvent_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."UserBadge" DROP CONSTRAINT IF EXISTS "UserBadge_pkey";
ALTER TABLE IF EXISTS ONLY public."Seance" DROP CONSTRAINT IF EXISTS "Seance_pkey";
ALTER TABLE IF EXISTS ONLY public."SeanceParticipation" DROP CONSTRAINT IF EXISTS "SeanceParticipation_pkey";
ALTER TABLE IF EXISTS ONLY public."School" DROP CONSTRAINT IF EXISTS "School_pkey";
ALTER TABLE IF EXISTS ONLY public."SchoolTeacher" DROP CONSTRAINT IF EXISTS "SchoolTeacher_pkey";
ALTER TABLE IF EXISTS ONLY public."RubricCriterion" DROP CONSTRAINT IF EXISTS "RubricCriterion_pkey";
ALTER TABLE IF EXISTS ONLY public."ReviewAssignment" DROP CONSTRAINT IF EXISTS "ReviewAssignment_pkey";
ALTER TABLE IF EXISTS ONLY public."Quiz" DROP CONSTRAINT IF EXISTS "Quiz_pkey";
ALTER TABLE IF EXISTS ONLY public."QuizAttempt" DROP CONSTRAINT IF EXISTS "QuizAttempt_pkey";
ALTER TABLE IF EXISTS ONLY public."Question" DROP CONSTRAINT IF EXISTS "Question_pkey";
ALTER TABLE IF EXISTS ONLY public."Project" DROP CONSTRAINT IF EXISTS "Project_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectVersion" DROP CONSTRAINT IF EXISTS "ProjectVersion_pkey";
ALTER TABLE IF EXISTS ONLY public."ProjectAttempt" DROP CONSTRAINT IF EXISTS "ProjectAttempt_pkey";
ALTER TABLE IF EXISTS ONLY public."Module" DROP CONSTRAINT IF EXISTS "Module_pkey";
ALTER TABLE IF EXISTS ONLY public."ModuleAssignment" DROP CONSTRAINT IF EXISTS "ModuleAssignment_pkey";
ALTER TABLE IF EXISTS ONLY public."Message" DROP CONSTRAINT IF EXISTS "Message_pkey";
ALTER TABLE IF EXISTS ONLY public."Materials" DROP CONSTRAINT IF EXISTS "Materials_pkey";
ALTER TABLE IF EXISTS ONLY public."Lesson" DROP CONSTRAINT IF EXISTS "Lesson_pkey";
ALTER TABLE IF EXISTS ONLY public."GraphEdge" DROP CONSTRAINT IF EXISTS "GraphEdge_pkey";
ALTER TABLE IF EXISTS ONLY public."Exercise" DROP CONSTRAINT IF EXISTS "Exercise_pkey";
ALTER TABLE IF EXISTS ONLY public."ExerciseSubmission" DROP CONSTRAINT IF EXISTS "ExerciseSubmission_pkey";
ALTER TABLE IF EXISTS ONLY public."Exam" DROP CONSTRAINT IF EXISTS "Exam_pkey";
ALTER TABLE IF EXISTS ONLY public."ExamResult" DROP CONSTRAINT IF EXISTS "ExamResult_pkey";
ALTER TABLE IF EXISTS ONLY public."ExamRating" DROP CONSTRAINT IF EXISTS "ExamRating_pkey";
ALTER TABLE IF EXISTS ONLY public."ExamFile" DROP CONSTRAINT IF EXISTS "ExamFile_pkey";
ALTER TABLE IF EXISTS ONLY public."Event" DROP CONSTRAINT IF EXISTS "Event_pkey";
ALTER TABLE IF EXISTS ONLY public."CriterionScore" DROP CONSTRAINT IF EXISTS "CriterionScore_pkey";
ALTER TABLE IF EXISTS ONLY public."Class" DROP CONSTRAINT IF EXISTS "Class_pkey";
ALTER TABLE IF EXISTS ONLY public."ClassEnrollment" DROP CONSTRAINT IF EXISTS "ClassEnrollment_pkey";
ALTER TABLE IF EXISTS ONLY public."Badge" DROP CONSTRAINT IF EXISTS "Badge_pkey";
DROP TABLE IF EXISTS public."_studentClasses";
DROP TABLE IF EXISTS public."_ProjectPrerequisites";
DROP TABLE IF EXISTS public."XpEvent";
DROP TABLE IF EXISTS public."UserBadge";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."SeanceParticipation";
DROP TABLE IF EXISTS public."Seance";
DROP TABLE IF EXISTS public."SchoolTeacher";
DROP TABLE IF EXISTS public."School";
DROP TABLE IF EXISTS public."RubricCriterion";
DROP TABLE IF EXISTS public."ReviewAssignment";
DROP TABLE IF EXISTS public."QuizAttempt";
DROP TABLE IF EXISTS public."Quiz";
DROP TABLE IF EXISTS public."Question";
DROP TABLE IF EXISTS public."ProjectVersion";
DROP TABLE IF EXISTS public."ProjectAttempt";
DROP TABLE IF EXISTS public."Project";
DROP TABLE IF EXISTS public."ModuleAssignment";
DROP TABLE IF EXISTS public."Module";
DROP TABLE IF EXISTS public."Message";
DROP TABLE IF EXISTS public."Materials";
DROP TABLE IF EXISTS public."Lesson";
DROP TABLE IF EXISTS public."GraphEdge";
DROP TABLE IF EXISTS public."ExerciseSubmission";
DROP TABLE IF EXISTS public."Exercise";
DROP TABLE IF EXISTS public."ExamResult";
DROP TABLE IF EXISTS public."ExamRating";
DROP TABLE IF EXISTS public."ExamFile";
DROP TABLE IF EXISTS public."Exam";
DROP TABLE IF EXISTS public."Event";
DROP TABLE IF EXISTS public."CriterionScore";
DROP TABLE IF EXISTS public."ClassEnrollment";
DROP TABLE IF EXISTS public."Class";
DROP TABLE IF EXISTS public."Badge";
DROP TYPE IF EXISTS public."XpReason";
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."ReviewStatus";
DROP TYPE IF EXISTS public."ReviewKind";
DROP TYPE IF EXISTS public."QuestionType";
DROP TYPE IF EXISTS public."ProjectStatus";
DROP TYPE IF EXISTS public."MessageStatus";
DROP TYPE IF EXISTS public."MaterialFormat";
DROP TYPE IF EXISTS public."LessonStatus";
DROP TYPE IF EXISTS public."GraphNodeKind";
DROP TYPE IF EXISTS public."ExerciseType";
DROP TYPE IF EXISTS public."ExamType";
DROP TYPE IF EXISTS public."ExamFileKind";
DROP TYPE IF EXISTS public."EventType";
DROP TYPE IF EXISTS public."EventScope";
DROP TYPE IF EXISTS public."Difficulty";
DROP TYPE IF EXISTS public."CriterionMode";
DROP TYPE IF EXISTS public."CompileStatus";
DROP TYPE IF EXISTS public."AttendanceStatus";
DROP TYPE IF EXISTS public."AttemptState";
--
-- Name: AttemptState; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."AttemptState" AS ENUM (
    'NOT_STARTED',
    'IN_PROGRESS',
    'SUBMITTED',
    'UNDER_REVIEW',
    'VALIDATED',
    'FAILED'
);


ALTER TYPE public."AttemptState" OWNER TO edu;

--
-- Name: AttendanceStatus; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."AttendanceStatus" AS ENUM (
    'PRESENT',
    'ABSENT',
    'LATE',
    'EXCUSED'
);


ALTER TYPE public."AttendanceStatus" OWNER TO edu;

--
-- Name: CompileStatus; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."CompileStatus" AS ENUM (
    'NONE',
    'PENDING',
    'SUCCESS',
    'FAILED'
);


ALTER TYPE public."CompileStatus" OWNER TO edu;

--
-- Name: CriterionMode; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."CriterionMode" AS ENUM (
    'AUTO',
    'TEACHER',
    'PEER'
);


ALTER TYPE public."CriterionMode" OWNER TO edu;

--
-- Name: Difficulty; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."Difficulty" AS ENUM (
    'EASY',
    'MEDIUM',
    'HARD'
);


ALTER TYPE public."Difficulty" OWNER TO edu;

--
-- Name: EventScope; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."EventScope" AS ENUM (
    'GLOBAL',
    'SCHOOL',
    'CLASS'
);


ALTER TYPE public."EventScope" OWNER TO edu;

--
-- Name: EventType; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."EventType" AS ENUM (
    'SESSION',
    'EXAM',
    'OTHER'
);


ALTER TYPE public."EventType" OWNER TO edu;

--
-- Name: ExamFileKind; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."ExamFileKind" AS ENUM (
    'STATEMENT',
    'CORRECTION',
    'RUBRIC',
    'OTHER'
);


ALTER TYPE public."ExamFileKind" OWNER TO edu;

--
-- Name: ExamType; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."ExamType" AS ENUM (
    'MIDTERM',
    'FINAL',
    'LOCAL',
    'CUSTOM'
);


ALTER TYPE public."ExamType" OWNER TO edu;

--
-- Name: ExerciseType; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."ExerciseType" AS ENUM (
    'YES_NO',
    'CHECK_TEST'
);


ALTER TYPE public."ExerciseType" OWNER TO edu;

--
-- Name: GraphNodeKind; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."GraphNodeKind" AS ENUM (
    'PROJECT',
    'EXAM',
    'QUIZ'
);


ALTER TYPE public."GraphNodeKind" OWNER TO edu;

--
-- Name: LessonStatus; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."LessonStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."LessonStatus" OWNER TO edu;

--
-- Name: MaterialFormat; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."MaterialFormat" AS ENUM (
    'DOCUMENT',
    'LATEX'
);


ALTER TYPE public."MaterialFormat" OWNER TO edu;

--
-- Name: MessageStatus; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."MessageStatus" AS ENUM (
    'PENDING',
    'ACCEPTED'
);


ALTER TYPE public."MessageStatus" OWNER TO edu;

--
-- Name: ProjectStatus; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."ProjectStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED',
    'ARCHIVED'
);


ALTER TYPE public."ProjectStatus" OWNER TO edu;

--
-- Name: QuestionType; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."QuestionType" AS ENUM (
    'MULTIPLE_CHOICE',
    'CHECKBOXES',
    'TRUE_FALSE',
    'SHORT_ANSWER',
    'NUMERIC'
);


ALTER TYPE public."QuestionType" OWNER TO edu;

--
-- Name: ReviewKind; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."ReviewKind" AS ENUM (
    'TEACHER',
    'PEER'
);


ALTER TYPE public."ReviewKind" OWNER TO edu;

--
-- Name: ReviewStatus; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."ReviewStatus" AS ENUM (
    'PENDING',
    'DONE'
);


ALTER TYPE public."ReviewStatus" OWNER TO edu;

--
-- Name: Role; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."Role" AS ENUM (
    'STUDENT',
    'TEACHER',
    'ADMIN'
);


ALTER TYPE public."Role" OWNER TO edu;

--
-- Name: XpReason; Type: TYPE; Schema: public; Owner: edu
--

CREATE TYPE public."XpReason" AS ENUM (
    'PROJECT_VALIDATED',
    'SPEED_BONUS',
    'RETRY_PENALTY',
    'PEER_REVIEW',
    'BADGE',
    'QUIZ',
    'SESSION'
);


ALTER TYPE public."XpReason" OWNER TO edu;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Badge; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Badge" (
    id text NOT NULL,
    code text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL
);


ALTER TABLE public."Badge" OWNER TO edu;

--
-- Name: Class; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Class" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    key text NOT NULL,
    "teacherId" text NOT NULL,
    "schoolId" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    archived boolean DEFAULT false NOT NULL
);


ALTER TABLE public."Class" OWNER TO edu;

--
-- Name: ClassEnrollment; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ClassEnrollment" (
    id text NOT NULL,
    "classId" text NOT NULL,
    "studentId" text NOT NULL,
    banned boolean DEFAULT false NOT NULL,
    "bannedAt" timestamp(3) without time zone,
    "bannedReason" text,
    "presentStreak" integer DEFAULT 0 NOT NULL,
    "joinedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ClassEnrollment" OWNER TO edu;

--
-- Name: CriterionScore; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."CriterionScore" (
    id text NOT NULL,
    "attemptId" text NOT NULL,
    "criterionId" text NOT NULL,
    score double precision NOT NULL,
    mode public."CriterionMode" NOT NULL,
    "graderId" text,
    comment text,
    "spotChecked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."CriterionScore" OWNER TO edu;

--
-- Name: Event; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Event" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    date timestamp(3) without time zone NOT NULL,
    scope public."EventScope" DEFAULT 'CLASS'::public."EventScope" NOT NULL,
    "schoolId" text,
    "classId" text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "endsAt" timestamp(3) without time zone,
    type public."EventType" DEFAULT 'OTHER'::public."EventType" NOT NULL
);


ALTER TABLE public."Event" OWNER TO edu;

--
-- Name: Exam; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Exam" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    type public."ExamType" NOT NULL,
    date timestamp(3) without time zone,
    "classId" text NOT NULL,
    "teacherId" text NOT NULL,
    "maxScore" integer DEFAULT 20 NOT NULL,
    "maxXP" integer DEFAULT 100 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "moduleId" text,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "passPercent" integer DEFAULT 50 NOT NULL,
    "pinX" double precision,
    "pinY" double precision
);


ALTER TABLE public."Exam" OWNER TO edu;

--
-- Name: ExamFile; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ExamFile" (
    id text NOT NULL,
    "examId" text NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    kind public."ExamFileKind" DEFAULT 'OTHER'::public."ExamFileKind" NOT NULL,
    format public."MaterialFormat" DEFAULT 'DOCUMENT'::public."MaterialFormat" NOT NULL,
    "sourceContent" text,
    "compileStatus" public."CompileStatus" DEFAULT 'NONE'::public."CompileStatus" NOT NULL,
    "compiledUrl" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExamFile" OWNER TO edu;

--
-- Name: ExamRating; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ExamRating" (
    id text NOT NULL,
    "examId" text NOT NULL,
    "studentId" text NOT NULL,
    difficulty public."Difficulty" NOT NULL,
    feedback text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExamRating" OWNER TO edu;

--
-- Name: ExamResult; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ExamResult" (
    id text NOT NULL,
    "examId" text NOT NULL,
    "studentId" text NOT NULL,
    score double precision DEFAULT 0 NOT NULL,
    "xpAwarded" integer DEFAULT 0 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ExamResult" OWNER TO edu;

--
-- Name: Exercise; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Exercise" (
    id text NOT NULL,
    "classId" text NOT NULL,
    topic text NOT NULL,
    type public."ExerciseType" NOT NULL,
    question text NOT NULL,
    "correctAnswer" boolean,
    options jsonb,
    "xpReward" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Exercise" OWNER TO edu;

--
-- Name: ExerciseSubmission; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ExerciseSubmission" (
    id text NOT NULL,
    "exerciseId" text NOT NULL,
    "studentId" text NOT NULL,
    passed boolean NOT NULL,
    "xpAwarded" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ExerciseSubmission" OWNER TO edu;

--
-- Name: GraphEdge; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."GraphEdge" (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    "fromKind" public."GraphNodeKind" NOT NULL,
    "fromId" text NOT NULL,
    "toKind" public."GraphNodeKind" NOT NULL,
    "toId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."GraphEdge" OWNER TO edu;

--
-- Name: Lesson; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Lesson" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    content text,
    status public."LessonStatus" DEFAULT 'DRAFT'::public."LessonStatus" NOT NULL,
    "teacherId" text NOT NULL,
    "classId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Lesson" OWNER TO edu;

--
-- Name: Materials; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Materials" (
    id text NOT NULL,
    name text NOT NULL,
    "fileUrl" text NOT NULL,
    "lessonId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "classId" text,
    format public."MaterialFormat" DEFAULT 'DOCUMENT'::public."MaterialFormat" NOT NULL,
    "sourceContent" text,
    "compileStatus" public."CompileStatus" DEFAULT 'NONE'::public."CompileStatus" NOT NULL,
    "compiledUrl" text
);


ALTER TABLE public."Materials" OWNER TO edu;

--
-- Name: Message; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Message" (
    id text NOT NULL,
    "classId" text,
    "senderId" text NOT NULL,
    "teacherId" text NOT NULL,
    content text NOT NULL,
    status public."MessageStatus" DEFAULT 'PENDING'::public."MessageStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Message" OWNER TO edu;

--
-- Name: Module; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Module" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    subject text DEFAULT 'Physics'::text NOT NULL,
    status public."ProjectStatus" DEFAULT 'DRAFT'::public."ProjectStatus" NOT NULL,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Module" OWNER TO edu;

--
-- Name: ModuleAssignment; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ModuleAssignment" (
    id text NOT NULL,
    "moduleId" text NOT NULL,
    "classId" text NOT NULL,
    "assignedById" text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ModuleAssignment" OWNER TO edu;

--
-- Name: Project; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Project" (
    id text NOT NULL,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "currentVersionId" text,
    "isCore" boolean DEFAULT true NOT NULL,
    "moduleId" text NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "pinX" double precision,
    "pinY" double precision,
    status public."ProjectStatus" DEFAULT 'DRAFT'::public."ProjectStatus" NOT NULL
);


ALTER TABLE public."Project" OWNER TO edu;

--
-- Name: ProjectAttempt; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ProjectAttempt" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "versionId" text NOT NULL,
    "studentId" text NOT NULL,
    "attemptNumber" integer DEFAULT 1 NOT NULL,
    state public."AttemptState" DEFAULT 'NOT_STARTED'::public."AttemptState" NOT NULL,
    "startedAt" timestamp(3) without time zone,
    "submittedAt" timestamp(3) without time zone,
    "reviewedAt" timestamp(3) without time zone,
    "actualHours" double precision,
    answers jsonb,
    score double precision,
    feedback text,
    "reviewerId" text,
    "xpAwarded" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ProjectAttempt" OWNER TO edu;

--
-- Name: ProjectVersion; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ProjectVersion" (
    id text NOT NULL,
    "projectId" text NOT NULL,
    "versionNumber" integer NOT NULL,
    title text NOT NULL,
    statement text NOT NULL,
    objectives jsonb NOT NULL,
    "estimatedHours" double precision NOT NULL,
    "xpReward" integer NOT NULL,
    "allowedResources" jsonb NOT NULL,
    threshold integer DEFAULT 70 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."ProjectVersion" OWNER TO edu;

--
-- Name: Question; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Question" (
    id text NOT NULL,
    text text NOT NULL,
    "imageUrl" text,
    "quizId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "correctIndexes" integer[] DEFAULT ARRAY[]::integer[],
    "correctNumber" double precision,
    "correctText" text,
    options jsonb,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    points integer DEFAULT 1 NOT NULL,
    required boolean DEFAULT true NOT NULL,
    tolerance double precision,
    type public."QuestionType" DEFAULT 'MULTIPLE_CHOICE'::public."QuestionType" NOT NULL
);


ALTER TABLE public."Question" OWNER TO edu;

--
-- Name: Quiz; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Quiz" (
    id text NOT NULL,
    title text NOT NULL,
    "teacherId" text NOT NULL,
    "classId" text NOT NULL,
    "dueDate" timestamp(3) without time zone,
    duration integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    description text,
    "lessonId" text,
    "moduleId" text,
    "projectId" text,
    "showAnswers" boolean DEFAULT true NOT NULL,
    status public."LessonStatus" DEFAULT 'DRAFT'::public."LessonStatus" NOT NULL,
    "xpReward" integer DEFAULT 50 NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "passPercent" integer DEFAULT 50 NOT NULL,
    "pinX" double precision,
    "pinY" double precision
);


ALTER TABLE public."Quiz" OWNER TO edu;

--
-- Name: QuizAttempt; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."QuizAttempt" (
    id text NOT NULL,
    "quizId" text NOT NULL,
    "studentId" text NOT NULL,
    answers jsonb NOT NULL,
    score double precision NOT NULL,
    "maxScore" double precision NOT NULL,
    percent double precision NOT NULL,
    "xpAwarded" integer DEFAULT 0 NOT NULL,
    "startedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "submittedAt" timestamp(3) without time zone
);


ALTER TABLE public."QuizAttempt" OWNER TO edu;

--
-- Name: ReviewAssignment; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."ReviewAssignment" (
    id text NOT NULL,
    "attemptId" text NOT NULL,
    "reviewerId" text NOT NULL,
    kind public."ReviewKind" NOT NULL,
    status public."ReviewStatus" DEFAULT 'PENDING'::public."ReviewStatus" NOT NULL,
    "spotChecked" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "completedAt" timestamp(3) without time zone
);


ALTER TABLE public."ReviewAssignment" OWNER TO edu;

--
-- Name: RubricCriterion; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."RubricCriterion" (
    id text NOT NULL,
    "versionId" text NOT NULL,
    title text NOT NULL,
    description text,
    weight integer NOT NULL,
    mode public."CriterionMode" NOT NULL,
    "orderIndex" integer DEFAULT 0 NOT NULL,
    "autoConfig" jsonb
);


ALTER TABLE public."RubricCriterion" OWNER TO edu;

--
-- Name: School; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."School" (
    id text NOT NULL,
    name text NOT NULL,
    description text,
    "createdById" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."School" OWNER TO edu;

--
-- Name: SchoolTeacher; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."SchoolTeacher" (
    id text NOT NULL,
    "schoolId" text NOT NULL,
    "teacherId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."SchoolTeacher" OWNER TO edu;

--
-- Name: Seance; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."Seance" (
    id text NOT NULL,
    title text,
    "startsAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "endsAt" timestamp(3) without time zone,
    "isActive" boolean DEFAULT false NOT NULL,
    "classId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "eventId" text,
    "settledAt" timestamp(3) without time zone
);


ALTER TABLE public."Seance" OWNER TO edu;

--
-- Name: SeanceParticipation; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."SeanceParticipation" (
    id text NOT NULL,
    "seanceId" text NOT NULL,
    "studentId" text NOT NULL,
    attendance public."AttendanceStatus" DEFAULT 'PRESENT'::public."AttendanceStatus" NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."SeanceParticipation" OWNER TO edu;

--
-- Name: User; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    avatar text,
    provider text,
    role public."Role",
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "totalXP" integer DEFAULT 0 NOT NULL,
    "correctionPoints" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."User" OWNER TO edu;

--
-- Name: UserBadge; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."UserBadge" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "badgeId" text NOT NULL,
    "awardedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."UserBadge" OWNER TO edu;

--
-- Name: XpEvent; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."XpEvent" (
    id text NOT NULL,
    "userId" text NOT NULL,
    amount integer NOT NULL,
    reason public."XpReason" NOT NULL,
    "projectId" text,
    "moduleId" text,
    "attemptId" text,
    "dedupeKey" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."XpEvent" OWNER TO edu;

--
-- Name: _ProjectPrerequisites; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."_ProjectPrerequisites" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_ProjectPrerequisites" OWNER TO edu;

--
-- Name: _studentClasses; Type: TABLE; Schema: public; Owner: edu
--

CREATE TABLE public."_studentClasses" (
    "A" text NOT NULL,
    "B" text NOT NULL
);


ALTER TABLE public."_studentClasses" OWNER TO edu;

--
-- Data for Name: Badge; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Badge" (id, code, title, description, icon) FROM stdin;
cmtyecaeq000in3rxt6hbvdhb	FIRST_CORE	First Spark	Validated your first common-core project.	Zap
cmtyecaes000jn3rx66cvmg0y	CORE_COMPLETE	Core Circuit Closed	Completed the common core of a module.	CircuitBoard
cmtyecaeu000kn3rxwvjiml2s	SPEED_RUN	Overclocked	Validated a project under its estimated hours.	Gauge
cmtyecaew000ln3rxeqbrir5y	FIRST_PEER_REVIEW	Second Opinion	Completed your first peer review.	Users
cmtyecaey000mn3rxd2m967kj	ELECTIVE_EXPLORER	Explorer	Validated an elective project.	Compass
cmtyecaf0000nn3rx193wnteg	COMEBACK	Comeback	Validated a project after a failed attempt.	RotateCcw
cmtyecaf2000on3rxal1i1bbw	LEVEL_5	Level 5	Reached level 5.	Star
cmtyecaf4000pn3rxjlb4ypn5	LEVEL_10	Level 10	Reached level 10.	Crown
\.


--
-- Data for Name: Class; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Class" (id, name, description, key, "teacherId", "schoolId", "createdAt", "updatedAt", archived) FROM stdin;
cmtyecae60009n3rxqnygebgz	Physics 1 – Mechanics	\N	PHYS01	cmtyeca6h0000n3rxyg4j51w1	school-demo	2026-09-12 13:03:55.806	2026-09-12 13:03:55.806	f
cmtyfnz8d000xn3es279n7fft	test_class	a test role to test if class workes	3csobt	cmty14iur0000n3nhcau8cb4u	cmtyf1kdf000rn3eso600s4xm	2026-09-12 13:41:00.829	2026-09-12 13:41:00.829	f
\.


--
-- Data for Name: ClassEnrollment; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ClassEnrollment" (id, "classId", "studentId", banned, "bannedAt", "bannedReason", "presentStreak", "joinedAt") FROM stdin;
cmtyecaed000bn3rxkugpem9i	cmtyecae60009n3rxqnygebgz	cmtyeca9h0002n3rx3qxvy8q8	f	\N	\N	0	2026-09-12 13:03:55.813
cmtyecaeh000dn3rxl603rqv6	cmtyecae60009n3rxqnygebgz	cmtyecaax0003n3rxqjaihk3w	f	\N	\N	0	2026-09-12 13:03:55.817
cmtyecaek000fn3rxyp3i5o5c	cmtyecae60009n3rxqnygebgz	cmtyecace0004n3rxycdj51tv	f	\N	\N	0	2026-09-12 13:03:55.82
cmtyecaen000hn3rxbmxo0ofd	cmtyecae60009n3rxqnygebgz	cmtyecadx0005n3rxb92yrt89	f	\N	\N	0	2026-09-12 13:03:55.823
\.


--
-- Data for Name: CriterionScore; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."CriterionScore" (id, "attemptId", "criterionId", score, mode, "graderId", comment, "spotChecked", "createdAt", "updatedAt") FROM stdin;
cmtyecakj002zn3rxm2ubumor	cmtyecakj002xn3rxwqjffgzo	cmtyecafm000sn3rxcnznoa66	100	AUTO	\N	\N	f	2026-09-12 13:03:56.036	2026-09-12 13:03:56.036
cmtyecakj0030n3rxgab324fi	cmtyecakj002xn3rxwqjffgzo	cmtyecafm000tn3rxi6xqm67z	100	AUTO	\N	\N	f	2026-09-12 13:03:56.036	2026-09-12 13:03:56.036
cmtyecakj0031n3rx1imiv37c	cmtyecakj002xn3rxwqjffgzo	cmtyecafm000un3rx4g5sg4c2	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.036	2026-09-12 13:03:56.036
cmtyecakj0032n3rxacjqx71p	cmtyecakj002xn3rxwqjffgzo	cmtyecafm000vn3rx21v1dlbs	80	PEER	\N	\N	f	2026-09-12 13:03:56.036	2026-09-12 13:03:56.036
cmtyecal00038n3rxra4iw0ts	cmtyecal00036n3rxntlogy64	cmtyecafw000yn3rxkv1ijy1d	100	AUTO	\N	\N	f	2026-09-12 13:03:56.052	2026-09-12 13:03:56.052
cmtyecal00039n3rxcgt3biwo	cmtyecal00036n3rxntlogy64	cmtyecafw000zn3rxou8aunr2	100	AUTO	\N	\N	f	2026-09-12 13:03:56.052	2026-09-12 13:03:56.052
cmtyecal0003an3rxiwg425vn	cmtyecal00036n3rxntlogy64	cmtyecafw0010n3rx8m5wfsnh	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.052	2026-09-12 13:03:56.052
cmtyecald003gn3rxetdlhzei	cmtyecald003en3rxzh30hwjs	cmtyecag40013n3rxx7mhwjh8	100	AUTO	\N	\N	f	2026-09-12 13:03:56.065	2026-09-12 13:03:56.065
cmtyecald003hn3rxxchmbfos	cmtyecald003en3rxzh30hwjs	cmtyecag40014n3rxqrnhnc4z	100	AUTO	\N	\N	f	2026-09-12 13:03:56.065	2026-09-12 13:03:56.065
cmtyecald003in3rx3x56ved7	cmtyecald003en3rxzh30hwjs	cmtyecag40015n3rx2mwi731b	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.065	2026-09-12 13:03:56.065
cmtyecald003jn3rx8sm5h4af	cmtyecald003en3rxzh30hwjs	cmtyecag40016n3rxtnn0bsrh	80	PEER	\N	\N	f	2026-09-12 13:03:56.065	2026-09-12 13:03:56.065
cmtyecalq003pn3rxkhweahy9	cmtyecalq003nn3rxrgg0o5lz	cmtyecagc0019n3rxrce4eevh	100	AUTO	\N	\N	f	2026-09-12 13:03:56.078	2026-09-12 13:03:56.078
cmtyecalv003tn3rxs5q0as82	cmtyecalv003rn3rxh1pjzky3	cmtyecafm000sn3rxcnznoa66	100	AUTO	\N	\N	f	2026-09-12 13:03:56.083	2026-09-12 13:03:56.083
cmtyecalv003un3rxrq1b3loj	cmtyecalv003rn3rxh1pjzky3	cmtyecafm000tn3rxi6xqm67z	100	AUTO	\N	\N	f	2026-09-12 13:03:56.083	2026-09-12 13:03:56.083
cmtyecalv003vn3rxdh80c001	cmtyecalv003rn3rxh1pjzky3	cmtyecafm000un3rx4g5sg4c2	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.083	2026-09-12 13:03:56.083
cmtyecalv003wn3rxecnf40ay	cmtyecalv003rn3rxh1pjzky3	cmtyecafm000vn3rx21v1dlbs	80	PEER	\N	\N	f	2026-09-12 13:03:56.083	2026-09-12 13:03:56.083
cmtyecamb0044n3rxolc3njl0	cmtyecamb0042n3rxx5oy15d0	cmtyecafm000sn3rxcnznoa66	100	AUTO	\N	\N	f	2026-09-12 13:03:56.099	2026-09-12 13:03:56.099
cmtyecamb0045n3rxram8930m	cmtyecamb0042n3rxx5oy15d0	cmtyecafm000tn3rxi6xqm67z	100	AUTO	\N	\N	f	2026-09-12 13:03:56.099	2026-09-12 13:03:56.099
cmtyecamb0046n3rxgdej936t	cmtyecamb0042n3rxx5oy15d0	cmtyecafm000un3rx4g5sg4c2	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.099	2026-09-12 13:03:56.099
cmtyecamb0047n3rxl9wn79ww	cmtyecamb0042n3rxx5oy15d0	cmtyecafm000vn3rx21v1dlbs	80	PEER	\N	\N	f	2026-09-12 13:03:56.099	2026-09-12 13:03:56.099
cmtyecamn004dn3rxwff1oefz	cmtyecamn004bn3rx1r3u9kn8	cmtyecafw000yn3rxkv1ijy1d	100	AUTO	\N	\N	f	2026-09-12 13:03:56.111	2026-09-12 13:03:56.111
cmtyecamn004en3rxkbwfsw1q	cmtyecamn004bn3rx1r3u9kn8	cmtyecafw000zn3rxou8aunr2	100	AUTO	\N	\N	f	2026-09-12 13:03:56.111	2026-09-12 13:03:56.111
cmtyecamn004fn3rxtua5bhgx	cmtyecamn004bn3rx1r3u9kn8	cmtyecafw0010n3rx8m5wfsnh	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.111	2026-09-12 13:03:56.111
cmtyecamz004ln3rx9jbol67y	cmtyecamz004jn3rxouo7effl	cmtyecag40013n3rxx7mhwjh8	100	AUTO	\N	\N	f	2026-09-12 13:03:56.123	2026-09-12 13:03:56.123
cmtyecamz004mn3rxifocd6rb	cmtyecamz004jn3rxouo7effl	cmtyecag40014n3rxqrnhnc4z	100	AUTO	\N	\N	f	2026-09-12 13:03:56.123	2026-09-12 13:03:56.123
cmtyecamz004nn3rxypuijpqk	cmtyecamz004jn3rxouo7effl	cmtyecag40015n3rx2mwi731b	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.123	2026-09-12 13:03:56.123
cmtyecamz004on3rxkobhy4fz	cmtyecamz004jn3rxouo7effl	cmtyecag40016n3rxtnn0bsrh	80	PEER	\N	\N	f	2026-09-12 13:03:56.123	2026-09-12 13:03:56.123
cmtyecana004un3rxkvrmj4np	cmtyecana004sn3rxisxsf337	cmtyecagc0019n3rxrce4eevh	100	AUTO	\N	\N	f	2026-09-12 13:03:56.135	2026-09-12 13:03:56.135
cmtyecana004vn3rxs470frkn	cmtyecana004sn3rxisxsf337	cmtyecagc001an3rxmvnddjfi	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.135	2026-09-12 13:03:56.135
cmtyecana004wn3rxgbqnnvf9	cmtyecana004sn3rxisxsf337	cmtyecagc001bn3rxcwzwi1du	80	PEER	\N	\N	f	2026-09-12 13:03:56.135	2026-09-12 13:03:56.135
cmtyecanm0052n3rxhtc2czhg	cmtyecanm0050n3rxtdyav3an	cmtyecagl001en3rxgroqv6u9	100	AUTO	\N	\N	f	2026-09-12 13:03:56.146	2026-09-12 13:03:56.146
cmtyecanm0053n3rxfacxqs34	cmtyecanm0050n3rxtdyav3an	cmtyecagl001fn3rx6ubasip5	100	AUTO	\N	\N	f	2026-09-12 13:03:56.146	2026-09-12 13:03:56.146
cmtyecanm0054n3rxg60kf6my	cmtyecanm0050n3rxtdyav3an	cmtyecagl001gn3rxur4mz4xv	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.146	2026-09-12 13:03:56.146
cmtyecanx005an3rx74cy3jlj	cmtyecanx0058n3rx6abmq2tj	cmtyecaia002in3rxvea6wxxq	100	AUTO	\N	\N	f	2026-09-12 13:03:56.158	2026-09-12 13:03:56.158
cmtyecanx005bn3rx5udbauic	cmtyecanx0058n3rx6abmq2tj	cmtyecaia002jn3rxwjkvq1ao	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.158	2026-09-12 13:03:56.158
cmtyecao9005hn3rxo0pirew0	cmtyecao9005fn3rx4f5xlq83	cmtyecah1001on3rxa7iv7s7a	100	AUTO	\N	\N	f	2026-09-12 13:03:56.17	2026-09-12 13:03:56.17
cmtyecao9005in3rxgge8yj4p	cmtyecao9005fn3rx4f5xlq83	cmtyecah1001pn3rxi5tgappo	100	AUTO	\N	\N	f	2026-09-12 13:03:56.17	2026-09-12 13:03:56.17
cmtyecao9005jn3rxdvdojwg2	cmtyecao9005fn3rx4f5xlq83	cmtyecah1001qn3rxpuroggr3	80	TEACHER	\N	\N	f	2026-09-12 13:03:56.17	2026-09-12 13:03:56.17
cmtyevcfm000bn3esxgnmxy6d	cmtyevav00009n3esvcer63gf	cmtyecagl001en3rxgroqv6u9	100	AUTO	\N	\N	f	2026-09-12 13:18:44.915	2026-09-12 13:18:44.915
cmtyevcfp000dn3es9us24nsz	cmtyevav00009n3esvcer63gf	cmtyecagl001fn3rx6ubasip5	100	AUTO	\N	\N	f	2026-09-12 13:18:44.917	2026-09-12 13:18:44.917
cmtyevejk000hn3es4z9krp9h	cmtyevav00009n3esvcer63gf	cmtyecagl001gn3rxur4mz4xv	85	TEACHER	cmtyeca6h0000n3rxyg4j51w1	good	f	2026-09-12 13:18:47.648	2026-09-12 13:18:47.648
cmtyew50x000ln3esajsl9242	cmtyecalq003nn3rxrgg0o5lz	cmtyecagc001bn3rxcwzwi1du	90	PEER	cmtyecace0004n3rxycdj51tv	clear video	f	2026-09-12 13:19:21.969	2026-09-12 13:19:21.969
cmtyew57f000pn3es2v2mxgea	cmtyecalq003nn3rxrgg0o5lz	cmtyecagc001an3rxmvnddjfi	30	TEACHER	cmtyeca6h0000n3rxyg4j51w1	\N	f	2026-09-12 13:19:22.204	2026-09-12 13:19:22.204
\.


--
-- Data for Name: Event; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Event" (id, title, description, date, scope, "schoolId", "classId", "createdById", "createdAt", "updatedAt", "endsAt", type) FROM stdin;
cmtyhozau000gn3wfpo1ae5bo	Lecture 2	\N	2026-09-20 08:00:00	CLASS	\N	cmtyecae60009n3rxqnygebgz	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 14:37:46.807	2026-09-12 14:37:46.807	2026-09-20 10:00:00	SESSION
cmtyhoz9l000cn3wfg04ll0bl	Lecture 1 (edited)	\N	2026-09-12 08:00:00	CLASS	\N	cmtyecae60009n3rxqnygebgz	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 14:37:46.761	2026-09-12 14:37:49.047	2026-09-12 10:00:00	SESSION
\.


--
-- Data for Name: Exam; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Exam" (id, title, description, type, date, "classId", "teacherId", "maxScore", "maxXP", "createdAt", "updatedAt", "moduleId", "orderIndex", "passPercent", "pinX", "pinY") FROM stdin;
\.


--
-- Data for Name: ExamFile; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ExamFile" (id, "examId", name, url, kind, format, "sourceContent", "compileStatus", "compiledUrl", "createdAt") FROM stdin;
\.


--
-- Data for Name: ExamRating; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ExamRating" (id, "examId", "studentId", difficulty, feedback, "createdAt") FROM stdin;
\.


--
-- Data for Name: ExamResult; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ExamResult" (id, "examId", "studentId", score, "xpAwarded", notes, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Exercise; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Exercise" (id, "classId", topic, type, question, "correctAnswer", options, "xpReward", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: ExerciseSubmission; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ExerciseSubmission" (id, "exerciseId", "studentId", passed, "xpAwarded", "createdAt") FROM stdin;
\.


--
-- Data for Name: GraphEdge; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."GraphEdge" (id, "moduleId", "fromKind", "fromId", "toKind", "toId", "createdAt") FROM stdin;
cmu05zh250000n390jm1egq5p	mod-physics-mechanics	PROJECT	phys-mech-p01	PROJECT	phys-mech-p02	2026-09-13 18:45:33.341
cmu05zh250001n3907ljvcn40	mod-physics-mechanics	PROJECT	phys-mech-p02	PROJECT	phys-mech-p03	2026-09-13 18:45:33.341
cmu05zh250002n390cu013shx	mod-physics-mechanics	PROJECT	phys-mech-p03	PROJECT	phys-mech-p05	2026-09-13 18:45:33.341
cmu05zh250003n390tnul933l	mod-physics-mechanics	PROJECT	phys-mech-p05	PROJECT	phys-mech-p06	2026-09-13 18:45:33.341
cmu05zh250004n390s4l74chc	mod-physics-mechanics	PROJECT	phys-mech-p05	PROJECT	phys-mech-p07	2026-09-13 18:45:33.341
cmu05zh250005n3909m5n2bo9	mod-physics-mechanics	PROJECT	phys-mech-p07	PROJECT	phys-mech-p08	2026-09-13 18:45:33.341
cmu05zh250006n390nlf534bg	mod-physics-mechanics	PROJECT	phys-mech-p05	PROJECT	phys-mech-p09	2026-09-13 18:45:33.341
cmu05zh250007n3908xxzpdpe	mod-physics-mechanics	PROJECT	phys-mech-p04	PROJECT	phys-mech-p09	2026-09-13 18:45:33.341
cmu05zh250008n390enhlne6q	mod-physics-mechanics	PROJECT	phys-mech-p08	PROJECT	phys-mech-p10	2026-09-13 18:45:33.341
cmu05zh250009n390jy39kiqa	mod-physics-mechanics	PROJECT	phys-mech-p09	PROJECT	phys-mech-p10	2026-09-13 18:45:33.341
cmu05zh25000an390v4svpsyg	mod-physics-mechanics	PROJECT	phys-mech-p07	PROJECT	phys-mech-p11	2026-09-13 18:45:33.341
cmu05zh25000bn390jr0jh5d7	mod-physics-mechanics	PROJECT	phys-mech-p10	PROJECT	phys-mech-p12	2026-09-13 18:45:33.341
cmu05zh25000cn390q442opm3	mod-physics-mechanics	PROJECT	phys-mech-p11	PROJECT	phys-mech-p12	2026-09-13 18:45:33.341
cmu05zh25000dn3902hbdrnwn	mod-physics-mechanics	PROJECT	phys-mech-p01	PROJECT	phys-mech-e01	2026-09-13 18:45:33.341
cmu05zh25000en3904yi03xp2	mod-physics-mechanics	PROJECT	phys-mech-p06	PROJECT	phys-mech-e02	2026-09-13 18:45:33.341
cmu05zh25000fn39070ziqbf3	mod-physics-mechanics	PROJECT	phys-mech-p04	PROJECT	phys-mech-e02	2026-09-13 18:45:33.341
cmu05zh25000gn390hqbhfy05	mod-physics-mechanics	PROJECT	phys-mech-p08	PROJECT	phys-mech-e03	2026-09-13 18:45:33.341
cmu05zh25000hn390d48hqu1a	mod-physics-mechanics	PROJECT	phys-mech-p11	PROJECT	phys-mech-e04	2026-09-13 18:45:33.341
cmu05zh25000in390uen4e04x	mod-physics-demo-copy	PROJECT	copy:phys-mech-p04	PROJECT	copy:phys-mech-p09	2026-09-13 18:45:33.341
cmu05zh25000jn390cvpfba7h	mod-physics-demo-copy	PROJECT	copy:phys-mech-p05	PROJECT	copy:phys-mech-p09	2026-09-13 18:45:33.341
cmu05zh25000kn390qpfpxot6	mod-physics-demo-copy	PROJECT	copy:phys-mech-p01	PROJECT	copy:phys-mech-p02	2026-09-13 18:45:33.341
cmu05zh25000ln3907wb26wc7	mod-physics-demo-copy	PROJECT	copy:phys-mech-p02	PROJECT	copy:phys-mech-p03	2026-09-13 18:45:33.341
cmu05zh25000mn390s30u157c	mod-physics-demo-copy	PROJECT	copy:phys-mech-p03	PROJECT	copy:phys-mech-p04	2026-09-13 18:45:33.341
cmu05zh25000nn390s77tw4eb	mod-physics-demo-copy	PROJECT	copy:phys-mech-p03	PROJECT	copy:phys-mech-p05	2026-09-13 18:45:33.341
cmu05zh25000on390y4ojdtex	mod-physics-demo-copy	PROJECT	copy:phys-mech-p05	PROJECT	copy:phys-mech-p06	2026-09-13 18:45:33.341
cmu05zh25000pn390pgodcpz8	mod-physics-demo-copy	PROJECT	copy:phys-mech-p05	PROJECT	copy:phys-mech-p07	2026-09-13 18:45:33.341
cmu05zh25000qn390igdjo5n5	mod-physics-demo-copy	PROJECT	copy:phys-mech-p07	PROJECT	copy:phys-mech-p08	2026-09-13 18:45:33.341
cmu05zh25000rn390csiislyf	mod-physics-demo-copy	PROJECT	copy:phys-mech-p09	PROJECT	copy:phys-mech-p10	2026-09-13 18:45:33.341
cmu05zh25000sn390ma7l4ne7	mod-physics-demo-copy	PROJECT	copy:phys-mech-p08	PROJECT	copy:phys-mech-p10	2026-09-13 18:45:33.341
cmu05zh25000tn390k9vml41c	mod-physics-demo-copy	PROJECT	copy:phys-mech-p07	PROJECT	copy:phys-mech-p11	2026-09-13 18:45:33.341
cmu05zh25000un390jtklz9k8	mod-physics-demo-copy	PROJECT	copy:phys-mech-p10	PROJECT	copy:phys-mech-p12	2026-09-13 18:45:33.341
cmu05zh25000vn390q7xsuoa1	mod-physics-demo-copy	PROJECT	copy:phys-mech-p11	PROJECT	copy:phys-mech-p12	2026-09-13 18:45:33.341
cmu05zh25000wn39070mg8kei	mod-physics-demo-copy	PROJECT	copy:phys-mech-p01	PROJECT	copy:phys-mech-e01	2026-09-13 18:45:33.341
cmu05zh25000xn390j6g6z7yz	mod-physics-demo-copy	PROJECT	copy:phys-mech-p04	PROJECT	copy:phys-mech-e02	2026-09-13 18:45:33.341
cmu05zh25000yn390byjc9s6k	mod-physics-demo-copy	PROJECT	copy:phys-mech-p06	PROJECT	copy:phys-mech-e02	2026-09-13 18:45:33.341
cmu05zh25000zn390786pv5we	mod-physics-demo-copy	PROJECT	copy:phys-mech-p08	PROJECT	copy:phys-mech-e03	2026-09-13 18:45:33.341
cmu05zh250010n390d087kuof	mod-physics-demo-copy	PROJECT	copy:phys-mech-p11	PROJECT	copy:phys-mech-e04	2026-09-13 18:45:33.341
cmu05zh250011n390x39axm4f	mod-physics-mechanics	PROJECT	phys-mech-p03	PROJECT	phys-mech-p04	2026-09-13 18:45:33.341
\.


--
-- Data for Name: Lesson; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Lesson" (id, title, description, content, status, "teacherId", "classId", "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Materials; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Materials" (id, name, "fileUrl", "lessonId", "createdAt", "classId", format, "sourceContent", "compileStatus", "compiledUrl") FROM stdin;
\.


--
-- Data for Name: Message; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Message" (id, "classId", "senderId", "teacherId", content, status, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: Module; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Module" (id, title, description, subject, status, "teacherId", "createdAt", "updatedAt") FROM stdin;
mod-physics-mechanics	Physics – Mechanics	From measuring the world to modelling motion, forces, energy and oscillations. Validate the common core to close the circuit; electives extend it.	Physics	PUBLISHED	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.852	2026-09-12 13:03:55.852
cmtyf4axf000vn3esv8sf0yyr	test_physics	cretiong	Physics	DRAFT	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:25:42.867	2026-09-12 13:25:42.867
mod-physics-demo-copy	Physics – Mechanics (demo copy)	From measuring the world to modelling motion, forces, energy and oscillations. Validate the common core to close the circuit; electives extend it.	Physics	PUBLISHED	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.261	2026-09-12 13:29:15.261
\.


--
-- Data for Name: ModuleAssignment; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ModuleAssignment" (id, "moduleId", "classId", "assignedById", "orderIndex", "createdAt") FROM stdin;
cmu066m2b0000n33xy04gckyp	mod-physics-mechanics	cmtyecae60009n3rxqnygebgz	cmtyeca6h0000n3rxyg4j51w1	0	2026-09-13 18:51:06.42
cmu066m2j0001n33x247xg0g1	cmtyf4axf000vn3esv8sf0yyr	cmtyfnz8d000xn3es279n7fft	cmty14iur0000n3nhcau8cb4u	0	2026-09-13 18:51:06.427
cmu066m2m0002n33x68h82tul	mod-physics-demo-copy	cmtyfnz8d000xn3es279n7fft	cmty14iur0000n3nhcau8cb4u	0	2026-09-13 18:51:06.431
\.


--
-- Data for Name: Project; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Project" (id, "teacherId", "createdAt", "updatedAt", "currentVersionId", "isCore", "moduleId", "orderIndex", "pinX", "pinY", status) FROM stdin;
phys-mech-p01	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.855	2026-09-12 13:03:55.864	cmtyecafm000rn3rxj0do8a0s	t	mod-physics-mechanics	0	\N	\N	PUBLISHED
phys-mech-p02	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.866	2026-09-12 13:03:55.872	cmtyecafw000xn3rxp0y6g6s5	t	mod-physics-mechanics	1	\N	\N	PUBLISHED
phys-mech-p03	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.874	2026-09-12 13:03:55.88	cmtyecag40012n3rxj0q3cqoa	t	mod-physics-mechanics	2	\N	\N	PUBLISHED
phys-mech-p05	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.891	2026-09-12 13:03:55.896	cmtyecagl001dn3rxhw2hfdkr	t	mod-physics-mechanics	4	\N	\N	PUBLISHED
phys-mech-p06	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.899	2026-09-12 13:03:55.905	cmtyecagt001in3rxvseibohw	t	mod-physics-mechanics	5	\N	\N	PUBLISHED
phys-mech-p07	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.907	2026-09-12 13:03:55.912	cmtyecah1001nn3rxdkhgpfpn	t	mod-physics-mechanics	6	\N	\N	PUBLISHED
phys-mech-p08	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.915	2026-09-12 13:03:55.92	cmtyecah8001sn3rxq6ww0d6e	t	mod-physics-mechanics	7	\N	\N	PUBLISHED
phys-mech-p09	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.922	2026-09-12 13:03:55.927	cmtyecahg001xn3rxb1g0fvjd	t	mod-physics-mechanics	8	\N	\N	PUBLISHED
phys-mech-p10	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.929	2026-09-12 13:03:55.935	cmtyecahn0022n3rx6k60tnkl	t	mod-physics-mechanics	9	\N	\N	PUBLISHED
phys-mech-p11	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.938	2026-09-12 13:03:55.943	cmtyecahw0027n3rx6wnz20l5	t	mod-physics-mechanics	10	\N	\N	PUBLISHED
phys-mech-p12	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.945	2026-09-12 13:03:55.95	cmtyecai3002cn3rxslmmts5i	t	mod-physics-mechanics	11	\N	\N	PUBLISHED
phys-mech-e01	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.953	2026-09-12 13:03:55.958	cmtyecaia002hn3rxblgcapt6	f	mod-physics-mechanics	12	\N	\N	PUBLISHED
phys-mech-e02	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.96	2026-09-12 13:03:55.965	cmtyecaii002ln3rxqxnhh92g	f	mod-physics-mechanics	13	\N	\N	PUBLISHED
phys-mech-e03	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.967	2026-09-12 13:03:55.972	cmtyecaip002pn3rxbbxtcios	f	mod-physics-mechanics	14	\N	\N	PUBLISHED
phys-mech-e04	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.974	2026-09-12 13:03:55.98	cmtyecaiw002tn3rxwx7yogke	f	mod-physics-mechanics	15	\N	\N	PUBLISHED
copy:phys-mech-p09	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.334	2026-09-12 13:29:15.339	cmtyf8uvc0017n329iq8pd08d	t	mod-physics-demo-copy	8	\N	\N	PUBLISHED
copy:phys-mech-p01	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.264	2026-09-12 13:29:15.273	cmtyf8utf0001n329h0g4ztqp	t	mod-physics-demo-copy	0	\N	\N	PUBLISHED
copy:phys-mech-p02	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.276	2026-09-12 13:29:15.283	cmtyf8utq0007n329a2jwxft6	t	mod-physics-demo-copy	1	\N	\N	PUBLISHED
copy:phys-mech-p03	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.286	2026-09-12 13:29:15.292	cmtyf8uu0000cn329d56pn8q6	t	mod-physics-demo-copy	2	\N	\N	PUBLISHED
copy:phys-mech-p04	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.294	2026-09-12 13:29:15.3	cmtyf8uu8000in329w4giso62	t	mod-physics-demo-copy	3	\N	\N	PUBLISHED
copy:phys-mech-p05	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.302	2026-09-12 13:29:15.308	cmtyf8uug000nn329epjlzxi5	t	mod-physics-demo-copy	4	\N	\N	PUBLISHED
copy:phys-mech-p06	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.31	2026-09-12 13:29:15.316	cmtyf8uuo000sn329rx2uj6z7	t	mod-physics-demo-copy	5	\N	\N	PUBLISHED
copy:phys-mech-p07	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.319	2026-09-12 13:29:15.324	cmtyf8uuw000xn3292fjdebhb	t	mod-physics-demo-copy	6	\N	\N	PUBLISHED
copy:phys-mech-p08	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.326	2026-09-12 13:29:15.332	cmtyf8uv40012n329dp7gnepc	t	mod-physics-demo-copy	7	\N	\N	PUBLISHED
copy:phys-mech-p10	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.341	2026-09-12 13:29:15.346	cmtyf8uvj001cn329o0stbtpy	t	mod-physics-demo-copy	9	\N	\N	PUBLISHED
copy:phys-mech-p11	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.349	2026-09-12 13:29:15.354	cmtyf8uvq001hn329n3i2wmxe	t	mod-physics-demo-copy	10	\N	\N	PUBLISHED
copy:phys-mech-p12	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.356	2026-09-12 13:29:15.361	cmtyf8uvy001mn3294jayoi5m	t	mod-physics-demo-copy	11	\N	\N	PUBLISHED
copy:phys-mech-e01	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.364	2026-09-12 13:29:15.369	cmtyf8uw5001rn329xcqs92a7	f	mod-physics-demo-copy	12	\N	\N	PUBLISHED
copy:phys-mech-e02	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.371	2026-09-12 13:29:15.376	cmtyf8uwc001vn329l9m69y4d	f	mod-physics-demo-copy	13	\N	\N	PUBLISHED
copy:phys-mech-e03	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.378	2026-09-12 13:29:15.383	cmtyf8uwk001zn329mzixm6bw	f	mod-physics-demo-copy	14	\N	\N	PUBLISHED
copy:phys-mech-e04	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:29:15.385	2026-09-12 13:29:15.39	cmtyf8uwr0023n3299m5wm7tl	f	mod-physics-demo-copy	15	\N	\N	PUBLISHED
phys-mech-p04	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.882	2026-09-12 13:59:41.327	cmtyecagc0018n3rxm4a8cd0s	t	mod-physics-mechanics	3	0.4405713914991259	-0.1098273782169118	PUBLISHED
\.


--
-- Data for Name: ProjectAttempt; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ProjectAttempt" (id, "projectId", "versionId", "studentId", "attemptNumber", state, "startedAt", "submittedAt", "reviewedAt", "actualHours", answers, score, feedback, "reviewerId", "xpAwarded", "createdAt", "updatedAt") FROM stdin;
cmtyecakj002xn3rxwqjffgzo	phys-mech-p01	cmtyecafm000rn3rxj0do8a0s	cmtyeca9h0002n3rx3qxvy8q8	1	VALIDATED	2026-08-23 10:33:56.031	2026-08-23 13:03:56.031	2026-08-23 13:03:56.031	2.5	\N	88	Solid work.	\N	115	2026-09-12 13:03:56.036	2026-09-12 13:03:56.045
cmtyecal00036n3rxntlogy64	phys-mech-p02	cmtyecafw000xn3rxp0y6g6s5	cmtyeca9h0002n3rx3qxvy8q8	1	VALIDATED	2026-08-27 08:33:56.049	2026-08-27 13:03:56.049	2026-08-27 13:03:56.049	4.5	\N	88	Solid work.	\N	120	2026-09-12 13:03:56.052	2026-09-12 13:03:56.058
cmtyecald003en3rxzh30hwjs	phys-mech-p03	cmtyecag40012n3rxj0q3cqoa	cmtyeca9h0002n3rx3qxvy8q8	1	VALIDATED	2026-09-02 07:03:56.062	2026-09-02 13:03:56.062	2026-09-02 13:03:56.062	6	\N	88	Solid work.	\N	150	2026-09-12 13:03:56.065	2026-09-12 13:03:56.071
cmtyecalv003rn3rxh1pjzky3	phys-mech-p01	cmtyecafm000rn3rxj0do8a0s	cmtyecaax0003n3rxqjaihk3w	1	VALIDATED	2026-08-25 09:33:56.081	2026-08-25 13:03:56.081	2026-08-25 13:03:56.081	3.5	\N	88	Solid work.	\N	100	2026-09-12 13:03:56.083	2026-09-12 13:03:56.089
cmtyecam60040n3rx1ip0o6b2	phys-mech-p02	cmtyecafw000xn3rxp0y6g6s5	cmtyecaax0003n3rxqjaihk3w	1	FAILED	2026-09-09 13:03:56.094	2026-09-10 13:03:56.094	2026-09-12 10:03:56.094	5	\N	52	Drift computed with the wrong component. Redo part 2.	\N	0	2026-09-12 13:03:56.094	2026-09-12 13:03:56.094
cmtyecamb0042n3rxx5oy15d0	phys-mech-p01	cmtyecafm000rn3rxj0do8a0s	cmtyecace0004n3rxycdj51tv	1	VALIDATED	2026-08-13 11:03:56.096	2026-08-13 13:03:56.096	2026-08-13 13:03:56.096	2	\N	88	Solid work.	\N	115	2026-09-12 13:03:56.099	2026-09-12 13:03:56.105
cmtyecamn004bn3rx1r3u9kn8	phys-mech-p02	cmtyecafw000xn3rxp0y6g6s5	cmtyecace0004n3rxycdj51tv	1	VALIDATED	2026-08-16 10:03:56.109	2026-08-16 13:03:56.109	2026-08-16 13:03:56.109	3	\N	88	Solid work.	\N	138	2026-09-12 13:03:56.111	2026-09-12 13:03:56.117
cmtyecamz004jn3rxouo7effl	phys-mech-p03	cmtyecag40012n3rxj0q3cqoa	cmtyecace0004n3rxycdj51tv	1	VALIDATED	2026-08-19 09:03:56.121	2026-08-19 13:03:56.121	2026-08-19 13:03:56.121	4	\N	88	Solid work.	\N	173	2026-09-12 13:03:56.123	2026-09-12 13:03:56.129
cmtyecana004sn3rxisxsf337	phys-mech-p04	cmtyecagc0018n3rxm4a8cd0s	cmtyecace0004n3rxycdj51tv	1	VALIDATED	2026-08-23 09:03:56.132	2026-08-23 13:03:56.132	2026-08-23 13:03:56.132	4	\N	88	Solid work.	\N	184	2026-09-12 13:03:56.135	2026-09-12 13:03:56.14
cmtyecanm0050n3rxtdyav3an	phys-mech-p05	cmtyecagl001dn3rxhw2hfdkr	cmtyecace0004n3rxycdj51tv	1	VALIDATED	2026-08-28 08:03:56.144	2026-08-28 13:03:56.144	2026-08-28 13:03:56.144	5	\N	88	Solid work.	\N	230	2026-09-12 13:03:56.146	2026-09-12 13:03:56.152
cmtyecanx0058n3rx6abmq2tj	phys-mech-e01	cmtyecaia002hn3rxblgcapt6	cmtyecace0004n3rxycdj51tv	1	VALIDATED	2026-08-29 11:33:56.155	2026-08-29 13:03:56.155	2026-08-29 13:03:56.155	1.5	\N	88	Solid work.	\N	69	2026-09-12 13:03:56.158	2026-09-12 13:03:56.163
cmtyecao9005fn3rx4f5xlq83	phys-mech-p07	cmtyecah1001nn3rxdkhgpfpn	cmtyecace0004n3rxycdj51tv	1	VALIDATED	2026-09-04 07:33:56.167	2026-09-04 13:03:56.167	2026-09-04 13:03:56.167	5.5	\N	88	Solid work.	\N	253	2026-09-12 13:03:56.17	2026-09-12 13:03:56.176
cmtyecaol005nn3rx1bf5bmfi	phys-mech-p06	cmtyecagt001in3rxvseibohw	cmtyecace0004n3rxycdj51tv	1	UNDER_REVIEW	2026-09-08 13:03:56.18	2026-09-11 13:03:56.18	\N	4.8	{}	\N	\N	\N	0	2026-09-12 13:03:56.181	2026-09-12 13:03:56.181
cmtyevav00009n3esvcer63gf	phys-mech-p05	cmtyecagl001dn3rxhw2hfdkr	cmtyeca9h0002n3rx3qxvy8q8	1	VALIDATED	2026-09-12 13:18:42.875	2026-09-12 13:18:44.906	2026-09-12 13:18:47.674	0	{"cmtyecagl001en3rxgroqv6u9": {"unit": "m/s²", "value": 1.96}, "cmtyecagl001fn3rx6ubasip5": {"unit": "N", "value": 23.5}, "cmtyecagl001gn3rxur4mz4xv": "Free-body diagrams attached: T up, mg down on each mass."}	92.5	Nice diagrams	cmtyeca6h0000n3rxyg4j51w1	200	2026-09-12 13:18:42.876	2026-09-12 13:18:47.695
cmtyecalq003nn3rxrgg0o5lz	phys-mech-p04	cmtyecagc0018n3rxm4a8cd0s	cmtyeca9h0002n3rx3qxvy8q8	1	FAILED	2026-09-07 13:03:56.077	2026-09-11 13:03:56.077	2026-09-12 13:19:22.214	4.2	{"cmtyecagc0019n3rxrce4eevh": [1], "cmtyecagc001an3rxmvnddjfi": "See attached report: v0 ≈ 6.1 m/s, predicted R = 3.8 m, measured 3.5 m.", "cmtyecagc001bn3rxcwzwi1du": "See attached report: v0 ≈ 6.1 m/s, predicted R = 3.8 m, measured 3.5 m."}	62	\N	cmtyeca6h0000n3rxyg4j51w1	0	2026-09-12 13:03:56.078	2026-09-12 13:19:22.215
\.


--
-- Data for Name: ProjectVersion; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ProjectVersion" (id, "projectId", "versionNumber", title, statement, objectives, "estimatedHours", "xpReward", "allowedResources", threshold, "createdAt") FROM stdin;
cmtyecafm000rn3rxj0do8a0s	phys-mech-p01	1	Units & Measurement	## Measuring a pendulum period\n\nBuild a simple pendulum with a string and a small mass. Measure the period $T$ for a length $L \\approx 1\\,\\text{m}$ using 10 oscillations, repeated 5 times.\n\n1. Compute the mean period and its uncertainty $\\Delta T$.\n2. Estimate $g$ from $T = 2\\pi\\sqrt{L/g}$ and give $\\Delta g$.\n3. Which SI unit does $g$ carry?	["Use SI base units and derived units correctly", "Estimate and propagate uncertainties", "Report results with correct significant figures"]	3	100	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:03:55.858
cmtyecafw000xn3rxp0y6g6s5	phys-mech-p02	1	Vectors	## River crossing\n\nA boat moves at $4\\,\\text{m/s}$ relative to water; the river flows at $3\\,\\text{m/s}$.\n\n1. What heading makes the boat land directly across? Give the resultant speed.\n2. If the boat heads straight across instead, find drift after crossing a $120\\,\\text{m}$ wide river.\n3. Sketch both cases with labelled vectors.	["Add and decompose vectors", "Use dot and cross products physically", "Work in 2D coordinate frames"]	4	120	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:03:55.869
cmtyecag40012n3rxj0q3cqoa	phys-mech-p03	1	Kinematics in 1D	## Braking distance\n\nA car at $v_0 = 25\\,\\text{m/s}$ brakes with constant deceleration $a = -6\\,\\text{m/s}^2$.\n\n1. Stopping distance?\n2. Stopping time?\n3. Plot $v(t)$ and $x(t)$; explain the graph areas.	["Interpret x–t, v–t, a–t graphs", "Apply constant-acceleration equations", "Model free fall"]	5	150	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:03:55.877
cmtyecagc0018n3rxm4a8cd0s	phys-mech-p04	1	Projectile Motion	## Film a throw\n\nFilm a ball thrown at roughly $45^\\circ$. Track 10 frames.\n\n1. From the data, estimate launch speed $v_0$.\n2. Predict range with $R = v_0^2 \\sin 2\\theta / g$ and compare with the measured range.\n3. Discuss sources of discrepancy.	["Separate horizontal and vertical motion", "Derive range and max height", "Validate a model with video data"]	5	160	["Formula sheet", "Scientific calculator", "Phone camera (video)", "Spreadsheet"]	70	2026-09-12 13:03:55.885
cmtyecagl001dn3rxhw2hfdkr	phys-mech-p05	1	Newton's Laws	## Atwood machine\n\nMasses $m_1 = 2\\,\\text{kg}$ and $m_2 = 3\\,\\text{kg}$ hang over an ideal pulley.\n\n1. Acceleration of the system?\n2. Tension in the string?\n3. Free-body diagram for each mass.	["Draw free-body diagrams", "Apply $\\\\sum F = ma$ to systems", "Handle tension and normal forces"]	6	200	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:03:55.893
cmtyecagt001in3rxvseibohw	phys-mech-p06	1	Friction & Inclines	## Measure $\\mu$\n\nPlace an object on a board and raise one end until it starts sliding at angle $\\theta_s$; then find the angle $\\theta_k$ where it slides at constant speed.\n\n1. Show $\\mu_s = \\tan\\theta_s$.\n2. Report $\\mu_s$ and $\\mu_k$ with uncertainty.\n3. Predict acceleration at $\\theta = 35^\\circ$ for your $\\mu_k$.	["Distinguish static and kinetic friction", "Resolve forces on inclines", "Measure a friction coefficient"]	5	180	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:03:55.901
cmtyecah1001nn3rxdkhgpfpn	phys-mech-p07	1	Work & Energy	## Roller-coaster loop\n\nA cart starts from rest at height $h$ and enters a vertical loop of radius $r = 5\\,\\text{m}$ (frictionless).\n\n1. Minimum $h$ so the cart stays on the track at the top of the loop.\n2. Speed at the bottom for that $h$.\n3. Now add friction losing 15% of energy before the loop: new minimum $h$?	["Apply the work–energy theorem", "Use conservation of mechanical energy", "Account for non-conservative work"]	6	220	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:03:55.909
cmtyecah8001sn3rxq6ww0d6e	phys-mech-p08	1	Momentum & Collisions	## Cart collision lab (simulator)\n\nCart A ($1\\,\\text{kg}$, $2\\,\\text{m/s}$) hits cart B ($3\\,\\text{kg}$, at rest).\n\n1. Final velocities for a perfectly inelastic collision.\n2. Final velocities for an elastic collision.\n3. Fraction of kinetic energy lost in case 1.	["Apply conservation of momentum", "Classify elastic vs inelastic collisions", "Use impulse"]	6	220	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:03:55.917
cmtyecahg001xn3rxb1g0fvjd	phys-mech-p09	1	Circular Motion & Gravitation	## Design a satellite orbit\n\nPlace a satellite in circular orbit at altitude $400\\,\\text{km}$ ($R_E = 6371\\,\\text{km}$, $M_E = 5.97\\times10^{24}\\,\\text{kg}$).\n\n1. Orbital speed.\n2. Period in minutes.\n3. Explain why astronauts feel weightless though gravity is ~90% of surface value.	["Use centripetal acceleration", "Apply Newton's law of gravitation", "Derive orbital speed and period"]	6	240	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:03:55.924
cmtyecahn0022n3rx6k60tnkl	phys-mech-p10	1	Rotational Dynamics	## Rolling race\n\nA solid sphere, a solid cylinder and a hoop roll without slipping down the same incline from rest.\n\n1. Rank arrival order and justify with $I$.\n2. Acceleration of the solid cylinder on a $30^\\circ$ incline.\n3. Explain angular momentum conservation for a spinning skater pulling arms in.	["Use torque and moment of inertia", "Apply $\\\\tau = I\\\\alpha$", "Conserve angular momentum"]	8	300	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:03:55.932
cmtyecahw0027n3rx6wnz20l5	phys-mech-p11	1	Oscillations (SHM)	## Mass–spring\n\nA $0.5\\,\\text{kg}$ mass on a spring ($k = 200\\,\\text{N/m}$) is pulled $5\\,\\text{cm}$ and released.\n\n1. Period and maximum speed.\n2. Sketch $x(t)$, $v(t)$ and the energy exchange.\n3. Fit measured data from the simulator to $x = A\\cos(\\omega t)$.	["Model simple harmonic motion", "Relate period to mass and stiffness", "Interpret energy in SHM"]	6	260	["Formula sheet", "Scientific calculator", "PhET simulator", "Spreadsheet"]	70	2026-09-12 13:03:55.94
cmtyecai3002cn3rxslmmts5i	phys-mech-p12	1	Capstone: Pendulum Clock	## Build a clock that keeps time for 5 minutes\n\nDesign a physical pendulum whose period is $2.000\\,\\text{s}$. Predict, build, measure, correct.\n\nDeliver: design notes with the physical-pendulum formula $T = 2\\pi\\sqrt{I/(mgd)}$, measurement log, error budget, and a 3-minute presentation.	["Combine rotation, energy and oscillation models", "Design, build and test", "Communicate results"]	10	400	["Formula sheet", "Scientific calculator", "Spreadsheet", "Phone camera (video)"]	75	2026-09-12 13:03:55.947
cmtyecaia002hn3rxblgcapt6	phys-mech-e01	1	Dimensional Analysis Challenge	Using only dimensions, find how the period of a pendulum depends on $L$, $m$ and $g$. Then do the same for the speed of waves on a string ($T$, $\\mu$).	["Derive relations from dimensions alone"]	2	60	["Formula sheet"]	70	2026-09-12 13:03:55.955
cmtyecaii002ln3rxqxnhh92g	phys-mech-e02	1	Air Resistance Simulation	Write a spreadsheet Euler integration for a projectile with quadratic drag $F = -kv^2$. Show range vs. $k$ and explain the asymmetric trajectory.	["Model drag numerically", "Compare with the ideal projectile"]	5	180	["Spreadsheet", "Scientific calculator"]	70	2026-09-12 13:03:55.962
cmtyecaip002pn3rxbbxtcios	phys-mech-e03	1	Rocket Propulsion	Derive the rocket equation $\\Delta v = v_e \\ln(m_0/m_f)$ and compute $\\Delta v$ for $v_e = 3000\\,\\text{m/s}$, $m_0/m_f = 5$.	["Apply momentum to variable-mass systems", "Use the Tsiolkovsky equation"]	6	220	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:03:55.969
cmtyecaiw002tn3rxwx7yogke	phys-mech-e04	1	Chaos: Double Pendulum	Simulate or film a double pendulum. Show two runs with initial angles differing by $0.1^\\circ$ and quantify when they diverge.	["Explore sensitivity to initial conditions", "Simulate coupled oscillators"]	8	300	["PhET simulator", "Spreadsheet", "Phone camera (video)"]	70	2026-09-12 13:03:55.977
cmtyf8utf0001n329h0g4ztqp	copy:phys-mech-p01	1	Units & Measurement	## Measuring a pendulum period\n\nBuild a simple pendulum with a string and a small mass. Measure the period $T$ for a length $L \\approx 1\\,\\text{m}$ using 10 oscillations, repeated 5 times.\n\n1. Compute the mean period and its uncertainty $\\Delta T$.\n2. Estimate $g$ from $T = 2\\pi\\sqrt{L/g}$ and give $\\Delta g$.\n3. Which SI unit does $g$ carry?	["Use SI base units and derived units correctly", "Estimate and propagate uncertainties", "Report results with correct significant figures"]	3	100	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:29:15.268
cmtyf8utq0007n329a2jwxft6	copy:phys-mech-p02	1	Vectors	## River crossing\n\nA boat moves at $4\\,\\text{m/s}$ relative to water; the river flows at $3\\,\\text{m/s}$.\n\n1. What heading makes the boat land directly across? Give the resultant speed.\n2. If the boat heads straight across instead, find drift after crossing a $120\\,\\text{m}$ wide river.\n3. Sketch both cases with labelled vectors.	["Add and decompose vectors", "Use dot and cross products physically", "Work in 2D coordinate frames"]	4	120	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:29:15.279
cmtyf8uu0000cn329d56pn8q6	copy:phys-mech-p03	1	Kinematics in 1D	## Braking distance\n\nA car at $v_0 = 25\\,\\text{m/s}$ brakes with constant deceleration $a = -6\\,\\text{m/s}^2$.\n\n1. Stopping distance?\n2. Stopping time?\n3. Plot $v(t)$ and $x(t)$; explain the graph areas.	["Interpret x–t, v–t, a–t graphs", "Apply constant-acceleration equations", "Model free fall"]	5	150	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:29:15.288
cmtyf8uu8000in329w4giso62	copy:phys-mech-p04	1	Projectile Motion	## Film a throw\n\nFilm a ball thrown at roughly $45^\\circ$. Track 10 frames.\n\n1. From the data, estimate launch speed $v_0$.\n2. Predict range with $R = v_0^2 \\sin 2\\theta / g$ and compare with the measured range.\n3. Discuss sources of discrepancy.	["Separate horizontal and vertical motion", "Derive range and max height", "Validate a model with video data"]	5	160	["Formula sheet", "Scientific calculator", "Phone camera (video)", "Spreadsheet"]	70	2026-09-12 13:29:15.297
cmtyf8uug000nn329epjlzxi5	copy:phys-mech-p05	1	Newton's Laws	## Atwood machine\n\nMasses $m_1 = 2\\,\\text{kg}$ and $m_2 = 3\\,\\text{kg}$ hang over an ideal pulley.\n\n1. Acceleration of the system?\n2. Tension in the string?\n3. Free-body diagram for each mass.	["Draw free-body diagrams", "Apply $\\\\sum F = ma$ to systems", "Handle tension and normal forces"]	6	200	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:29:15.305
cmtyf8uuo000sn329rx2uj6z7	copy:phys-mech-p06	1	Friction & Inclines	## Measure $\\mu$\n\nPlace an object on a board and raise one end until it starts sliding at angle $\\theta_s$; then find the angle $\\theta_k$ where it slides at constant speed.\n\n1. Show $\\mu_s = \\tan\\theta_s$.\n2. Report $\\mu_s$ and $\\mu_k$ with uncertainty.\n3. Predict acceleration at $\\theta = 35^\\circ$ for your $\\mu_k$.	["Distinguish static and kinetic friction", "Resolve forces on inclines", "Measure a friction coefficient"]	5	180	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:29:15.313
cmtyf8uuw000xn3292fjdebhb	copy:phys-mech-p07	1	Work & Energy	## Roller-coaster loop\n\nA cart starts from rest at height $h$ and enters a vertical loop of radius $r = 5\\,\\text{m}$ (frictionless).\n\n1. Minimum $h$ so the cart stays on the track at the top of the loop.\n2. Speed at the bottom for that $h$.\n3. Now add friction losing 15% of energy before the loop: new minimum $h$?	["Apply the work–energy theorem", "Use conservation of mechanical energy", "Account for non-conservative work"]	6	220	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:29:15.321
cmtyf8uv40012n329dp7gnepc	copy:phys-mech-p08	1	Momentum & Collisions	## Cart collision lab (simulator)\n\nCart A ($1\\,\\text{kg}$, $2\\,\\text{m/s}$) hits cart B ($3\\,\\text{kg}$, at rest).\n\n1. Final velocities for a perfectly inelastic collision.\n2. Final velocities for an elastic collision.\n3. Fraction of kinetic energy lost in case 1.	["Apply conservation of momentum", "Classify elastic vs inelastic collisions", "Use impulse"]	6	220	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:29:15.329
cmtyf8uvc0017n329iq8pd08d	copy:phys-mech-p09	1	Circular Motion & Gravitation	## Design a satellite orbit\n\nPlace a satellite in circular orbit at altitude $400\\,\\text{km}$ ($R_E = 6371\\,\\text{km}$, $M_E = 5.97\\times10^{24}\\,\\text{kg}$).\n\n1. Orbital speed.\n2. Period in minutes.\n3. Explain why astronauts feel weightless though gravity is ~90% of surface value.	["Use centripetal acceleration", "Apply Newton's law of gravitation", "Derive orbital speed and period"]	6	240	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:29:15.336
cmtyf8uvj001cn329o0stbtpy	copy:phys-mech-p10	1	Rotational Dynamics	## Rolling race\n\nA solid sphere, a solid cylinder and a hoop roll without slipping down the same incline from rest.\n\n1. Rank arrival order and justify with $I$.\n2. Acceleration of the solid cylinder on a $30^\\circ$ incline.\n3. Explain angular momentum conservation for a spinning skater pulling arms in.	["Use torque and moment of inertia", "Apply $\\\\tau = I\\\\alpha$", "Conserve angular momentum"]	8	300	["Formula sheet", "Scientific calculator", "PhET simulator"]	70	2026-09-12 13:29:15.343
cmtyf8uvq001hn329n3i2wmxe	copy:phys-mech-p11	1	Oscillations (SHM)	## Mass–spring\n\nA $0.5\\,\\text{kg}$ mass on a spring ($k = 200\\,\\text{N/m}$) is pulled $5\\,\\text{cm}$ and released.\n\n1. Period and maximum speed.\n2. Sketch $x(t)$, $v(t)$ and the energy exchange.\n3. Fit measured data from the simulator to $x = A\\cos(\\omega t)$.	["Model simple harmonic motion", "Relate period to mass and stiffness", "Interpret energy in SHM"]	6	260	["Formula sheet", "Scientific calculator", "PhET simulator", "Spreadsheet"]	70	2026-09-12 13:29:15.351
cmtyf8uvy001mn3294jayoi5m	copy:phys-mech-p12	1	Capstone: Pendulum Clock	## Build a clock that keeps time for 5 minutes\n\nDesign a physical pendulum whose period is $2.000\\,\\text{s}$. Predict, build, measure, correct.\n\nDeliver: design notes with the physical-pendulum formula $T = 2\\pi\\sqrt{I/(mgd)}$, measurement log, error budget, and a 3-minute presentation.	["Combine rotation, energy and oscillation models", "Design, build and test", "Communicate results"]	10	400	["Formula sheet", "Scientific calculator", "Spreadsheet", "Phone camera (video)"]	75	2026-09-12 13:29:15.358
cmtyf8uw5001rn329xcqs92a7	copy:phys-mech-e01	1	Dimensional Analysis Challenge	Using only dimensions, find how the period of a pendulum depends on $L$, $m$ and $g$. Then do the same for the speed of waves on a string ($T$, $\\mu$).	["Derive relations from dimensions alone"]	2	60	["Formula sheet"]	70	2026-09-12 13:29:15.366
cmtyf8uwc001vn329l9m69y4d	copy:phys-mech-e02	1	Air Resistance Simulation	Write a spreadsheet Euler integration for a projectile with quadratic drag $F = -kv^2$. Show range vs. $k$ and explain the asymmetric trajectory.	["Model drag numerically", "Compare with the ideal projectile"]	5	180	["Spreadsheet", "Scientific calculator"]	70	2026-09-12 13:29:15.373
cmtyf8uwk001zn329mzixm6bw	copy:phys-mech-e03	1	Rocket Propulsion	Derive the rocket equation $\\Delta v = v_e \\ln(m_0/m_f)$ and compute $\\Delta v$ for $v_e = 3000\\,\\text{m/s}$, $m_0/m_f = 5$.	["Apply momentum to variable-mass systems", "Use the Tsiolkovsky equation"]	6	220	["Formula sheet", "Scientific calculator"]	70	2026-09-12 13:29:15.38
cmtyf8uwr0023n3299m5wm7tl	copy:phys-mech-e04	1	Chaos: Double Pendulum	Simulate or film a double pendulum. Show two runs with initial angles differing by $0.1^\\circ$ and quantify when they diverge.	["Explore sensitivity to initial conditions", "Simulate coupled oscillators"]	8	300	["PhET simulator", "Spreadsheet", "Phone camera (video)"]	70	2026-09-12 13:29:15.387
\.


--
-- Data for Name: Question; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Question" (id, text, "imageUrl", "quizId", "createdAt", "updatedAt", "correctIndexes", "correctNumber", "correctText", options, "orderIndex", points, required, tolerance, type) FROM stdin;
cmtyhop9r0002n3wft1ugnvq4	Unit of acceleration?	\N	cmtyhop9r0001n3wfedhi8am9	2026-09-12 14:37:33.807	2026-09-12 14:37:33.807	{1}	\N	\N	["m/s", "m/s²", "N"]	0	2	t	\N	MULTIPLE_CHOICE
cmtyhop9s0003n3wfn8wmhvky	Vector quantities	\N	cmtyhop9r0001n3wfedhi8am9	2026-09-12 14:37:33.807	2026-09-12 14:37:33.807	{1,2}	\N	\N	["speed", "velocity", "force", "mass"]	1	2	t	\N	CHECKBOXES
cmtyhop9s0004n3wfp8u599b2	g on Earth	\N	cmtyhop9r0001n3wfedhi8am9	2026-09-12 14:37:33.807	2026-09-12 14:37:33.807	{}	9.81	\N	[]	2	1	t	0.1	NUMERIC
cmtyhop9s0005n3wfr06wntmu	Who wrote Principia?	\N	cmtyhop9r0001n3wfedhi8am9	2026-09-12 14:37:33.807	2026-09-12 14:37:33.807	{}	\N	Newton|Isaac Newton	[]	3	1	t	\N	SHORT_ANSWER
cmtyhop9s0006n3wfjhw595mq	Velocity is scalar	\N	cmtyhop9r0001n3wfedhi8am9	2026-09-12 14:37:33.807	2026-09-12 14:37:33.807	{1}	\N	\N	["True", "False"]	4	1	t	\N	TRUE_FALSE
\.


--
-- Data for Name: Quiz; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Quiz" (id, title, "teacherId", "classId", "dueDate", duration, "createdAt", "updatedAt", description, "lessonId", "moduleId", "projectId", "showAnswers", status, "xpReward", "orderIndex", "passPercent", "pinX", "pinY") FROM stdin;
cmtyhop9r0001n3wfedhi8am9	Kinematics check	cmtyeca6h0000n3rxyg4j51w1	cmtyecae60009n3rxqnygebgz	\N	\N	2026-09-12 14:37:33.807	2026-09-12 14:37:35.753	\N	\N	mod-physics-mechanics	phys-mech-p03	t	PUBLISHED	40	0	50	\N	\N
\.


--
-- Data for Name: QuizAttempt; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."QuizAttempt" (id, "quizId", "studentId", answers, score, "maxScore", percent, "xpAwarded", "startedAt", "submittedAt") FROM stdin;
cmtyhost20008n3wfqnvi0gbp	cmtyhop9r0001n3wfedhi8am9	cmtyeca9h0002n3rx3qxvy8q8	{"cmtyhop9r0002n3wft1ugnvq4": 1, "cmtyhop9s0003n3wfn8wmhvky": [1, 2], "cmtyhop9s0004n3wfp8u599b2": "9,8", "cmtyhop9s0005n3wfr06wntmu": "isaac newton", "cmtyhop9s0006n3wfjhw595mq": 0}	6	7	85.7	34	2026-09-12 14:37:38.39	2026-09-12 14:37:38.389
\.


--
-- Data for Name: ReviewAssignment; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."ReviewAssignment" (id, "attemptId", "reviewerId", kind, status, "spotChecked", "createdAt", "completedAt") FROM stdin;
cmtyecaon005pn3rxcsh3kwi2	cmtyecaol005nn3rx1bf5bmfi	cmtyeca6h0000n3rxyg4j51w1	TEACHER	PENDING	f	2026-09-12 13:03:56.184	\N
cmtyevcfv000fn3esf3vynl3b	cmtyevav00009n3esvcer63gf	cmtyeca6h0000n3rxyg4j51w1	TEACHER	DONE	f	2026-09-12 13:18:44.924	2026-09-12 13:18:47.662
cmtyecaor005rn3rxb34qczmx	cmtyecalq003nn3rxrgg0o5lz	cmtyecace0004n3rxycdj51tv	PEER	DONE	f	2026-09-12 13:03:56.187	2026-09-12 13:19:21.972
cmtyecaot005tn3rxl4w5vfks	cmtyecalq003nn3rxrgg0o5lz	cmtyeca6h0000n3rxyg4j51w1	TEACHER	DONE	f	2026-09-12 13:03:56.19	2026-09-12 13:19:22.205
\.


--
-- Data for Name: RubricCriterion; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."RubricCriterion" (id, "versionId", title, description, weight, mode, "orderIndex", "autoConfig") FROM stdin;
cmtyecafm000sn3rxcnznoa66	cmtyecafm000rn3rxj0do8a0s	Unit of g	\N	20	AUTO	0	{"type": "UNIT", "expectedUnit": "m/s²"}
cmtyecafm000tn3rxi6xqm67z	cmtyecafm000rn3rxj0do8a0s	Value of g within uncertainty	\N	30	AUTO	1	{"type": "NUMERIC", "unit": "m/s²", "answer": 9.81, "tolerance": 0.4}
cmtyecafm000un3rx4g5sg4c2	cmtyecafm000rn3rxj0do8a0s	Uncertainty analysis	Propagation is explicit and correct.	30	TEACHER	2	\N
cmtyecafm000vn3rx21v1dlbs	cmtyecafm000rn3rxj0do8a0s	Report clarity	Tables, units and significant figures are readable.	20	PEER	3	\N
cmtyecafw000yn3rxkv1ijy1d	cmtyecafw000xn3rxp0y6g6s5	Resultant speed (heading upstream)	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 2.65, "tolerance": 0.1}
cmtyecafw000zn3rxou8aunr2	cmtyecafw000xn3rxp0y6g6s5	Drift distance	\N	30	AUTO	1	{"type": "NUMERIC", "unit": "m", "answer": 90, "tolerance": 2}
cmtyecafw0010n3rx8m5wfsnh	cmtyecafw000xn3rxp0y6g6s5	Vector diagrams	\N	40	TEACHER	2	\N
cmtyecag40013n3rxx7mhwjh8	cmtyecag40012n3rxj0q3cqoa	Stopping distance	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m", "answer": 52.08, "tolerance": 0.5}
cmtyecag40014n3rxqrnhnc4z	cmtyecag40012n3rxj0q3cqoa	Stopping time	\N	20	AUTO	1	{"type": "NUMERIC", "unit": "s", "answer": 4.17, "tolerance": 0.05}
cmtyecag40015n3rx2mwi731b	cmtyecag40012n3rxj0q3cqoa	Graph interpretation	\N	30	TEACHER	2	\N
cmtyecag40016n3rxtnn0bsrh	cmtyecag40012n3rxj0q3cqoa	Presentation	\N	20	PEER	3	\N
cmtyecagc0019n3rxrce4eevh	cmtyecagc0018n3rxm4a8cd0s	Which quantity is constant in flight?	\N	20	AUTO	0	{"type": "MCQ", "choices": ["Vertical velocity", "Horizontal velocity", "Speed", "Kinetic energy"], "correctIndexes": [1]}
cmtyecagc001an3rxmvnddjfi	cmtyecagc0018n3rxm4a8cd0s	Model vs measurement	\N	50	TEACHER	1	\N
cmtyecagc001bn3rxcwzwi1du	cmtyecagc0018n3rxm4a8cd0s	Video analysis presentation	\N	30	PEER	2	\N
cmtyecagl001en3rxgroqv6u9	cmtyecagl001dn3rxhw2hfdkr	Acceleration	\N	25	AUTO	0	{"type": "NUMERIC", "unit": "m/s²", "answer": 1.96, "tolerance": 0.05}
cmtyecagl001fn3rx6ubasip5	cmtyecagl001dn3rxhw2hfdkr	Tension	\N	25	AUTO	1	{"type": "NUMERIC", "unit": "N", "answer": 23.5, "tolerance": 0.3}
cmtyecagl001gn3rxur4mz4xv	cmtyecagl001dn3rxhw2hfdkr	Free-body diagrams	\N	50	TEACHER	2	\N
cmtyecagt001jn3rxehpebin6	cmtyecagt001in3rxvseibohw	Derivation of μs = tan θ	\N	30	TEACHER	0	\N
cmtyecagt001kn3rx5nvwk5o2	cmtyecagt001in3rxvseibohw	Measurement quality	\N	40	TEACHER	1	\N
cmtyecagt001ln3rx0rgpjp5t	cmtyecagt001in3rxvseibohw	Lab notebook clarity	\N	30	PEER	2	\N
cmtyecah1001on3rxa7iv7s7a	cmtyecah1001nn3rxdkhgpfpn	Minimum height	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m", "answer": 12.5, "tolerance": 0.2}
cmtyecah1001pn3rxi5tgappo	cmtyecah1001nn3rxdkhgpfpn	Speed at bottom	\N	20	AUTO	1	{"type": "NUMERIC", "unit": "m/s", "answer": 15.66, "tolerance": 0.2}
cmtyecah1001qn3rxpuroggr3	cmtyecah1001nn3rxdkhgpfpn	Energy reasoning with losses	\N	50	TEACHER	2	\N
cmtyecah8001tn3rxn12d2cbf	cmtyecah8001sn3rxq6ww0d6e	Inelastic final speed	\N	25	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 0.5, "tolerance": 0.02}
cmtyecah9001un3rxcmxgwb4z	cmtyecah8001sn3rxq6ww0d6e	Energy fraction lost	\N	25	AUTO	1	{"type": "NUMERIC", "answer": 0.75, "tolerance": 0.02}
cmtyecah9001vn3rx7rwr7i4u	cmtyecah8001sn3rxq6ww0d6e	Elastic case derivation	\N	50	TEACHER	2	\N
cmtyecahg001yn3rxn80opdkq	cmtyecahg001xn3rxb1g0fvjd	Orbital speed	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 7670, "tolerance": 60}
cmtyecahg001zn3rxzp4r1zj6	cmtyecahg001xn3rxb1g0fvjd	Period	\N	20	AUTO	1	{"type": "NUMERIC", "unit": "min", "answer": 92.5, "tolerance": 1.5}
cmtyecahg0020n3rx8q5f6lse	cmtyecahg001xn3rxb1g0fvjd	Weightlessness explanation	\N	50	TEACHER	2	\N
cmtyecahn0023n3rx6wlzg7ne	cmtyecahn0022n3rx6k60tnkl	Arrival order	\N	20	AUTO	0	{"type": "MCQ", "choices": ["Hoop, cylinder, sphere", "Sphere, cylinder, hoop", "All together", "Cylinder, sphere, hoop"], "correctIndexes": [1]}
cmtyecahn0024n3rx7y9bib1u	cmtyecahn0022n3rx6k60tnkl	Cylinder acceleration	\N	30	AUTO	1	{"type": "NUMERIC", "unit": "m/s²", "answer": 3.27, "tolerance": 0.05}
cmtyecahn0025n3rx65v2xklo	cmtyecahn0022n3rx6k60tnkl	Derivations	\N	50	TEACHER	2	\N
cmtyecahw0028n3rxpirh83qj	cmtyecahw0027n3rx6wnz20l5	Period	\N	25	AUTO	0	{"type": "NUMERIC", "unit": "s", "answer": 0.314, "tolerance": 0.01}
cmtyecahw0029n3rx839jy754	cmtyecahw0027n3rx6wnz20l5	Max speed	\N	25	AUTO	1	{"type": "NUMERIC", "unit": "m/s", "answer": 1, "tolerance": 0.03}
cmtyecahw002an3rx5k9k0i8e	cmtyecahw0027n3rx6wnz20l5	Data fit and graphs	\N	50	TEACHER	2	\N
cmtyecai3002dn3rx0g8ysnti	cmtyecai3002cn3rxslmmts5i	Physical model correctness	\N	35	TEACHER	0	\N
cmtyecai3002en3rx3p4d6npd	cmtyecai3002cn3rxslmmts5i	Build & measurement	\N	35	TEACHER	1	\N
cmtyecai3002fn3rxdcpnj83d	cmtyecai3002cn3rxslmmts5i	Presentation	\N	30	PEER	2	\N
cmtyecaia002in3rxvea6wxxq	cmtyecaia002hn3rxblgcapt6	Pendulum: does the period depend on mass?	\N	30	AUTO	0	{"type": "MCQ", "choices": ["Yes", "No"], "correctIndexes": [1]}
cmtyecaia002jn3rxwjkvq1ao	cmtyecaia002hn3rxblgcapt6	Derivations	\N	70	TEACHER	1	\N
cmtyecaii002mn3rxwi1zarlm	cmtyecaii002ln3rxqxnhh92g	Numerical model	\N	60	TEACHER	0	\N
cmtyecaii002nn3rx28f9p78h	cmtyecaii002ln3rxqxnhh92g	Clarity of plots	\N	40	PEER	1	\N
cmtyecaip002qn3rxed13i4lw	cmtyecaip002pn3rxbbxtcios	Δv	\N	40	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 4828, "tolerance": 30}
cmtyecaip002rn3rx3i7a5vqw	cmtyecaip002pn3rxbbxtcios	Derivation	\N	60	TEACHER	1	\N
cmtyecaiw002un3rxvlprimhu	cmtyecaiw002tn3rxwx7yogke	Analysis	\N	60	TEACHER	0	\N
cmtyecaiw002vn3rxrec11dgf	cmtyecaiw002tn3rxwx7yogke	Presentation	\N	40	PEER	1	\N
cmtyf8utf0002n3296jk6854z	cmtyf8utf0001n329h0g4ztqp	Unit of g	\N	20	AUTO	0	{"type": "UNIT", "expectedUnit": "m/s²"}
cmtyf8utf0003n329trgg4ipd	cmtyf8utf0001n329h0g4ztqp	Value of g within uncertainty	\N	30	AUTO	1	{"type": "NUMERIC", "unit": "m/s²", "answer": 9.81, "tolerance": 0.4}
cmtyf8utf0004n329vuh18p8h	cmtyf8utf0001n329h0g4ztqp	Uncertainty analysis	Propagation is explicit and correct.	30	TEACHER	2	\N
cmtyf8utf0005n329an3dn20r	cmtyf8utf0001n329h0g4ztqp	Report clarity	Tables, units and significant figures are readable.	20	PEER	3	\N
cmtyf8utr0008n329001twk43	cmtyf8utq0007n329a2jwxft6	Resultant speed (heading upstream)	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 2.65, "tolerance": 0.1}
cmtyf8utr0009n329jqtduobr	cmtyf8utq0007n329a2jwxft6	Drift distance	\N	30	AUTO	1	{"type": "NUMERIC", "unit": "m", "answer": 90, "tolerance": 2}
cmtyf8utr000an3298u1ehsmz	cmtyf8utq0007n329a2jwxft6	Vector diagrams	\N	40	TEACHER	2	\N
cmtyf8uu0000dn329t104w425	cmtyf8uu0000cn329d56pn8q6	Stopping distance	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m", "answer": 52.08, "tolerance": 0.5}
cmtyf8uu0000en329ancsjfqn	cmtyf8uu0000cn329d56pn8q6	Stopping time	\N	20	AUTO	1	{"type": "NUMERIC", "unit": "s", "answer": 4.17, "tolerance": 0.05}
cmtyf8uu0000fn329cdovibtt	cmtyf8uu0000cn329d56pn8q6	Graph interpretation	\N	30	TEACHER	2	\N
cmtyf8uu0000gn329igdcq3os	cmtyf8uu0000cn329d56pn8q6	Presentation	\N	20	PEER	3	\N
cmtyf8uu8000jn329egny7iy3	cmtyf8uu8000in329w4giso62	Which quantity is constant in flight?	\N	20	AUTO	0	{"type": "MCQ", "choices": ["Vertical velocity", "Horizontal velocity", "Speed", "Kinetic energy"], "correctIndexes": [1]}
cmtyf8uu8000kn32944ocqnjs	cmtyf8uu8000in329w4giso62	Model vs measurement	\N	50	TEACHER	1	\N
cmtyf8uu8000ln329mnxm66cc	cmtyf8uu8000in329w4giso62	Video analysis presentation	\N	30	PEER	2	\N
cmtyf8uug000on3292r653fvt	cmtyf8uug000nn329epjlzxi5	Acceleration	\N	25	AUTO	0	{"type": "NUMERIC", "unit": "m/s²", "answer": 1.96, "tolerance": 0.05}
cmtyf8uug000pn329338gc310	cmtyf8uug000nn329epjlzxi5	Tension	\N	25	AUTO	1	{"type": "NUMERIC", "unit": "N", "answer": 23.5, "tolerance": 0.3}
cmtyf8uug000qn329nv4tfcse	cmtyf8uug000nn329epjlzxi5	Free-body diagrams	\N	50	TEACHER	2	\N
cmtyf8uuo000tn32980hrtle8	cmtyf8uuo000sn329rx2uj6z7	Derivation of μs = tan θ	\N	30	TEACHER	0	\N
cmtyf8uuo000un3294ubvadlx	cmtyf8uuo000sn329rx2uj6z7	Measurement quality	\N	40	TEACHER	1	\N
cmtyf8uuo000vn329rrieed79	cmtyf8uuo000sn329rx2uj6z7	Lab notebook clarity	\N	30	PEER	2	\N
cmtyf8uux000yn329d3im94ao	cmtyf8uuw000xn3292fjdebhb	Minimum height	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m", "answer": 12.5, "tolerance": 0.2}
cmtyf8uux000zn329whcfc2px	cmtyf8uuw000xn3292fjdebhb	Speed at bottom	\N	20	AUTO	1	{"type": "NUMERIC", "unit": "m/s", "answer": 15.66, "tolerance": 0.2}
cmtyf8uux0010n329pf2j0q1e	cmtyf8uuw000xn3292fjdebhb	Energy reasoning with losses	\N	50	TEACHER	2	\N
cmtyf8uv40013n329rokees3a	cmtyf8uv40012n329dp7gnepc	Inelastic final speed	\N	25	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 0.5, "tolerance": 0.02}
cmtyf8uv40014n329gdeye5ex	cmtyf8uv40012n329dp7gnepc	Energy fraction lost	\N	25	AUTO	1	{"type": "NUMERIC", "answer": 0.75, "tolerance": 0.02}
cmtyf8uv40015n3298tn5wvt7	cmtyf8uv40012n329dp7gnepc	Elastic case derivation	\N	50	TEACHER	2	\N
cmtyf8uvc0018n329eyzdxx7q	cmtyf8uvc0017n329iq8pd08d	Orbital speed	\N	30	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 7670, "tolerance": 60}
cmtyf8uvc0019n3298dt71yhi	cmtyf8uvc0017n329iq8pd08d	Period	\N	20	AUTO	1	{"type": "NUMERIC", "unit": "min", "answer": 92.5, "tolerance": 1.5}
cmtyf8uvc001an3291i2qqigt	cmtyf8uvc0017n329iq8pd08d	Weightlessness explanation	\N	50	TEACHER	2	\N
cmtyf8uvj001dn3291flst24x	cmtyf8uvj001cn329o0stbtpy	Arrival order	\N	20	AUTO	0	{"type": "MCQ", "choices": ["Hoop, cylinder, sphere", "Sphere, cylinder, hoop", "All together", "Cylinder, sphere, hoop"], "correctIndexes": [1]}
cmtyf8uvj001en329f1voa8ya	cmtyf8uvj001cn329o0stbtpy	Cylinder acceleration	\N	30	AUTO	1	{"type": "NUMERIC", "unit": "m/s²", "answer": 3.27, "tolerance": 0.05}
cmtyf8uvj001fn329cud2jbgx	cmtyf8uvj001cn329o0stbtpy	Derivations	\N	50	TEACHER	2	\N
cmtyf8uvq001in329y6ioiyxz	cmtyf8uvq001hn329n3i2wmxe	Period	\N	25	AUTO	0	{"type": "NUMERIC", "unit": "s", "answer": 0.314, "tolerance": 0.01}
cmtyf8uvq001jn329i086yti2	cmtyf8uvq001hn329n3i2wmxe	Max speed	\N	25	AUTO	1	{"type": "NUMERIC", "unit": "m/s", "answer": 1, "tolerance": 0.03}
cmtyf8uvq001kn329loe0h87c	cmtyf8uvq001hn329n3i2wmxe	Data fit and graphs	\N	50	TEACHER	2	\N
cmtyf8uvy001nn329lr6eb858	cmtyf8uvy001mn3294jayoi5m	Physical model correctness	\N	35	TEACHER	0	\N
cmtyf8uvy001on32940xe7ucq	cmtyf8uvy001mn3294jayoi5m	Build & measurement	\N	35	TEACHER	1	\N
cmtyf8uvy001pn329sd4bte4u	cmtyf8uvy001mn3294jayoi5m	Presentation	\N	30	PEER	2	\N
cmtyf8uw5001sn3294u91do8y	cmtyf8uw5001rn329xcqs92a7	Pendulum: does the period depend on mass?	\N	30	AUTO	0	{"type": "MCQ", "choices": ["Yes", "No"], "correctIndexes": [1]}
cmtyf8uw5001tn3297wvui9s2	cmtyf8uw5001rn329xcqs92a7	Derivations	\N	70	TEACHER	1	\N
cmtyf8uwc001wn329mcscvw2i	cmtyf8uwc001vn329l9m69y4d	Numerical model	\N	60	TEACHER	0	\N
cmtyf8uwc001xn329rivnruid	cmtyf8uwc001vn329l9m69y4d	Clarity of plots	\N	40	PEER	1	\N
cmtyf8uwk0020n329dy9fawkg	cmtyf8uwk001zn329mzixm6bw	Δv	\N	40	AUTO	0	{"type": "NUMERIC", "unit": "m/s", "answer": 4828, "tolerance": 30}
cmtyf8uwk0021n329i01gu8hq	cmtyf8uwk001zn329mzixm6bw	Derivation	\N	60	TEACHER	1	\N
cmtyf8uwr0024n329m3qlfbqk	cmtyf8uwr0023n3299m5wm7tl	Analysis	\N	60	TEACHER	0	\N
cmtyf8uwr0025n329rsqjjkxh	cmtyf8uwr0023n3299m5wm7tl	Presentation	\N	40	PEER	1	\N
\.


--
-- Data for Name: School; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."School" (id, name, description, "createdById", "createdAt", "updatedAt") FROM stdin;
school-demo	Lycée Demo	Demo school	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.8	2026-09-12 13:03:55.8
cmtyf1kdf000rn3eso600s4xm	test school	just a test to create a school	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:23:35.139	2026-09-12 13:23:35.139
\.


--
-- Data for Name: SchoolTeacher; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."SchoolTeacher" (id, "schoolId", "teacherId", "createdAt") FROM stdin;
cmtyecae00007n3rxahin1r2i	school-demo	cmtyeca6h0000n3rxyg4j51w1	2026-09-12 13:03:55.8
cmtyf1kdf000tn3es8wau3h85	cmtyf1kdf000rn3eso600s4xm	cmty14iur0000n3nhcau8cb4u	2026-09-12 13:23:35.139
\.


--
-- Data for Name: Seance; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."Seance" (id, title, "startsAt", "endsAt", "isActive", "classId", "createdAt", "updatedAt", "eventId", "settledAt") FROM stdin;
cmtyhozax000in3wffnhnfahv	Lecture 2	2026-09-20 08:00:00	2026-09-20 10:00:00	f	cmtyecae60009n3rxqnygebgz	2026-09-12 14:37:46.81	2026-09-12 14:37:46.81	cmtyhozau000gn3wfpo1ae5bo	\N
cmtyhoz9q000en3wffrs90qdl	Lecture 1 (edited)	2026-09-12 08:00:00	2026-09-12 10:00:00	f	cmtyecae60009n3rxqnygebgz	2026-09-12 14:37:46.766	2026-09-12 14:37:49.051	cmtyhoz9l000cn3wfg04ll0bl	2026-09-12 14:37:46.849
\.


--
-- Data for Name: SeanceParticipation; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."SeanceParticipation" (id, "seanceId", "studentId", attendance, points, notes, "createdAt", "updatedAt") FROM stdin;
cmtyhozc8000kn3wfn0ihm2ij	cmtyhoz9q000en3wffrs90qdl	cmtyecaax0003n3rxqjaihk3w	PRESENT	1	\N	2026-09-12 14:37:46.856	2026-09-12 14:37:46.856
cmtyhozc8000ln3wfqvjsq1ty	cmtyhoz9q000en3wffrs90qdl	cmtyecace0004n3rxycdj51tv	PRESENT	1	\N	2026-09-12 14:37:46.856	2026-09-12 14:37:46.856
cmtyhozc8000mn3wfipujof2h	cmtyhoz9q000en3wffrs90qdl	cmtyeca9h0002n3rx3qxvy8q8	PRESENT	1	\N	2026-09-12 14:37:46.856	2026-09-12 14:37:46.856
cmtyhozc8000jn3wfzyjldfbi	cmtyhoz9q000en3wffrs90qdl	cmtyecadx0005n3rxb92yrt89	EXCUSED	0	\N	2026-09-12 14:37:46.856	2026-09-12 16:07:47.785
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."User" (id, name, email, password, avatar, provider, role, "createdAt", "updatedAt", "totalXP", "correctionPoints") FROM stdin;
cmty14iur0000n3nhcau8cb4u	testTEACHER	test@testTEACHER.com	$2b$10$wZa3xI1z5ovO4yI57r53ie91wnc.1yxxfgeLyKpkVZ5tFs9a7M/n6	\N	\N	TEACHER	2026-09-12 06:53:58.516	2026-09-12 06:56:34.841	0	0
cmty4xzhp0000n30dwsu6eds6	Design Preview Teacher	designpreview@test.com	$2b$10$VK1AzTJv02/uJMPFaRTBxuvr8PrtWMNzQ.J2XoSpiy8ptdulmatgS	\N	\N	TEACHER	2026-09-12 08:40:51.95	2026-09-12 08:42:11.741	0	0
cmtyeca6h0000n3rxyg4j51w1	Dr. Nour Haddad	physics.teacher@physiclub.demo	$2b$10$WWgejn/wwlROq8w04SQREe6DKCILL.DjlhREKnsPn4vc8xWVUaBiO	\N	credentials	TEACHER	2026-09-12 13:03:55.53	2026-09-12 13:03:55.53	0	2
cmtyeca800001n3rxyb9uhs46	Platform Admin	admin@physiclub.demo	$2b$10$DGouH2xlA.JinZUHd6y3a.15Aye0LGvVCEaAfzkp0V5US70zd0LN.	\N	credentials	ADMIN	2026-09-12 13:03:55.585	2026-09-12 13:03:55.585	0	2
cmtyecaax0003n3rxqjaihk3w	Bilal Karim	bilal@physiclub.demo	$2b$10$pDmJn66zMWLSPWC2g9Ei7.8OyPfcNixH1h2e8RkmHHNTtg4bTIZh6	\N	credentials	STUDENT	2026-09-12 13:03:55.689	2026-09-12 14:37:46.863	101	2
cmtyecace0004n3rxycdj51tv	Chloé Dubois	chloe@physiclub.demo	$2b$10$RR064yS60ASCQig9ae3QpengVVpF66EH20CJYeWOiYH6w.sjEDsxS	\N	credentials	STUDENT	2026-09-12 13:03:55.742	2026-09-12 14:37:46.863	1173	3
cmtyeca9h0002n3rx3qxvy8q8	Alice Martin	alice@physiclub.demo	$2b$10$pEGtWdK4.nrpCC.SXOlgBuVtQ0QflYkXwdgil6QWOaXDLYR5hCLXi	\N	credentials	STUDENT	2026-09-12 13:03:55.637	2026-09-12 14:37:46.863	620	2
cmtyecadx0005n3rxb92yrt89	Dani Reyes	dani@physiclub.demo	$2b$10$BX6SC4FhkiuhYo0LkL0ADuSuIN3W/3MufKV2R6qIqJSbZUUbaSNaq	\N	credentials	STUDENT	2026-09-12 13:03:55.797	2026-09-12 16:07:44.26	0	2
\.


--
-- Data for Name: UserBadge; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."UserBadge" (id, "userId", "badgeId", "awardedAt") FROM stdin;
cmtyecaox005vn3rxouwt2mb4	cmtyeca9h0002n3rx3qxvy8q8	cmtyecaeq000in3rxt6hbvdhb	2026-09-12 13:03:56.193
cmtyecap0005xn3rxrbudbu8d	cmtyeca9h0002n3rx3qxvy8q8	cmtyecaeu000kn3rxwvjiml2s	2026-09-12 13:03:56.196
cmtyecap3005zn3rxd5d1cs1w	cmtyecaax0003n3rxqjaihk3w	cmtyecaeq000in3rxt6hbvdhb	2026-09-12 13:03:56.199
cmtyecap60061n3rxce0sj6kb	cmtyecace0004n3rxycdj51tv	cmtyecaeq000in3rxt6hbvdhb	2026-09-12 13:03:56.202
cmtyecap80063n3rxzcikvvqj	cmtyecace0004n3rxycdj51tv	cmtyecaeu000kn3rxwvjiml2s	2026-09-12 13:03:56.205
cmtyecapb0065n3rxdiuly62y	cmtyecace0004n3rxycdj51tv	cmtyecaey000mn3rxd2m967kj	2026-09-12 13:03:56.207
cmtyecape0067n3rxhuqnpbw3	cmtyecace0004n3rxycdj51tv	cmtyecaf2000on3rxal1i1bbw	2026-09-12 13:03:56.21
\.


--
-- Data for Name: XpEvent; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."XpEvent" (id, "userId", amount, reason, "projectId", "moduleId", "attemptId", "dedupeKey", "createdAt") FROM stdin;
cmtyecakq0034n3rxql7t7ziy	cmtyeca9h0002n3rx3qxvy8q8	115	PROJECT_VALIDATED	phys-mech-p01	mod-physics-mechanics	cmtyecakj002xn3rxwqjffgzo	validated:cmtyeca9h0002n3rx3qxvy8q8:phys-mech-p01	2026-08-23 13:03:56.031
cmtyecal3003cn3rx4h8jfk3a	cmtyeca9h0002n3rx3qxvy8q8	120	PROJECT_VALIDATED	phys-mech-p02	mod-physics-mechanics	cmtyecal00036n3rxntlogy64	validated:cmtyeca9h0002n3rx3qxvy8q8:phys-mech-p02	2026-08-27 13:03:56.049
cmtyecalh003ln3rxvw8qvzp7	cmtyeca9h0002n3rx3qxvy8q8	150	PROJECT_VALIDATED	phys-mech-p03	mod-physics-mechanics	cmtyecald003en3rxzh30hwjs	validated:cmtyeca9h0002n3rx3qxvy8q8:phys-mech-p03	2026-09-02 13:03:56.062
cmtyecaly003yn3rxzgp721jr	cmtyecaax0003n3rxqjaihk3w	100	PROJECT_VALIDATED	phys-mech-p01	mod-physics-mechanics	cmtyecalv003rn3rxh1pjzky3	validated:cmtyecaax0003n3rxqjaihk3w:phys-mech-p01	2026-08-25 13:03:56.081
cmtyecame0049n3rx1uuam3qz	cmtyecace0004n3rxycdj51tv	115	PROJECT_VALIDATED	phys-mech-p01	mod-physics-mechanics	cmtyecamb0042n3rxx5oy15d0	validated:cmtyecace0004n3rxycdj51tv:phys-mech-p01	2026-08-13 13:03:56.096
cmtyecamq004hn3rx7wk4mx9j	cmtyecace0004n3rxycdj51tv	138	PROJECT_VALIDATED	phys-mech-p02	mod-physics-mechanics	cmtyecamn004bn3rx1r3u9kn8	validated:cmtyecace0004n3rxycdj51tv:phys-mech-p02	2026-08-16 13:03:56.109
cmtyecan2004qn3rx6k7ufcjo	cmtyecace0004n3rxycdj51tv	173	PROJECT_VALIDATED	phys-mech-p03	mod-physics-mechanics	cmtyecamz004jn3rxouo7effl	validated:cmtyecace0004n3rxycdj51tv:phys-mech-p03	2026-08-19 13:03:56.121
cmtyecand004yn3rx7vk7p7ic	cmtyecace0004n3rxycdj51tv	184	PROJECT_VALIDATED	phys-mech-p04	mod-physics-mechanics	cmtyecana004sn3rxisxsf337	validated:cmtyecace0004n3rxycdj51tv:phys-mech-p04	2026-08-23 13:03:56.132
cmtyecanp0056n3rxdtotav0c	cmtyecace0004n3rxycdj51tv	230	PROJECT_VALIDATED	phys-mech-p05	mod-physics-mechanics	cmtyecanm0050n3rxtdyav3an	validated:cmtyecace0004n3rxycdj51tv:phys-mech-p05	2026-08-28 13:03:56.144
cmtyecao1005dn3rxa3wulgat	cmtyecace0004n3rxycdj51tv	69	PROJECT_VALIDATED	phys-mech-e01	mod-physics-mechanics	cmtyecanx0058n3rx6abmq2tj	validated:cmtyecace0004n3rxycdj51tv:phys-mech-e01	2026-08-29 13:03:56.155
cmtyecaod005ln3rxr6bkff8k	cmtyecace0004n3rxycdj51tv	253	PROJECT_VALIDATED	phys-mech-p07	mod-physics-mechanics	cmtyecao9005fn3rx4f5xlq83	validated:cmtyecace0004n3rxycdj51tv:phys-mech-p07	2026-09-04 13:03:56.167
cmtyevekj000jn3esc3ccbsfn	cmtyeca9h0002n3rx3qxvy8q8	200	PROJECT_VALIDATED	phys-mech-p05	mod-physics-mechanics	cmtyevav00009n3esvcer63gf	validated:cmtyeca9h0002n3rx3qxvy8q8:phys-mech-p05	2026-09-12 13:18:47.684
cmtyew513000nn3es7fe4kd12	cmtyecace0004n3rxycdj51tv	10	PEER_REVIEW	\N	\N	cmtyecalq003nn3rxrgg0o5lz	peer-review:cmtyecace0004n3rxycdj51tv:cmtyecalq003nn3rxrgg0o5lz	2026-09-12 13:19:21.975
cmtyhost4000an3wfcdye41cj	cmtyeca9h0002n3rx3qxvy8q8	34	QUIZ	phys-mech-p03	mod-physics-mechanics	\N	quiz:cmtyeca9h0002n3rx3qxvy8q8:cmtyhop9r0001n3wfedhi8am9	2026-09-12 14:37:38.392
cmtyhozca000on3wfvckkg7fe	cmtyecadx0005n3rxb92yrt89	1	SESSION	\N	\N	cmtyhoz9q000en3wffrs90qdl	session:cmtyecadx0005n3rxb92yrt89:cmtyhoz9q000en3wffrs90qdl	2026-09-12 14:37:46.859
cmtyhozcc000qn3wff6ofmukb	cmtyecaax0003n3rxqjaihk3w	1	SESSION	\N	\N	cmtyhoz9q000en3wffrs90qdl	session:cmtyecaax0003n3rxqjaihk3w:cmtyhoz9q000en3wffrs90qdl	2026-09-12 14:37:46.86
cmtyhozcd000sn3wfzmbv2a8o	cmtyecace0004n3rxycdj51tv	1	SESSION	\N	\N	cmtyhoz9q000en3wffrs90qdl	session:cmtyecace0004n3rxycdj51tv:cmtyhoz9q000en3wffrs90qdl	2026-09-12 14:37:46.861
cmtyhozce000un3wfi86m482m	cmtyeca9h0002n3rx3qxvy8q8	1	SESSION	\N	\N	cmtyhoz9q000en3wffrs90qdl	session:cmtyeca9h0002n3rx3qxvy8q8:cmtyhoz9q000en3wffrs90qdl	2026-09-12 14:37:46.862
\.


--
-- Data for Name: _ProjectPrerequisites; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."_ProjectPrerequisites" ("A", "B") FROM stdin;
phys-mech-p01	phys-mech-p02
phys-mech-p02	phys-mech-p03
phys-mech-p03	phys-mech-p04
phys-mech-p03	phys-mech-p05
phys-mech-p05	phys-mech-p06
phys-mech-p05	phys-mech-p07
phys-mech-p07	phys-mech-p08
phys-mech-p04	phys-mech-p09
phys-mech-p05	phys-mech-p09
phys-mech-p08	phys-mech-p10
phys-mech-p09	phys-mech-p10
phys-mech-p07	phys-mech-p11
phys-mech-p10	phys-mech-p12
phys-mech-p11	phys-mech-p12
phys-mech-p01	phys-mech-e01
phys-mech-p04	phys-mech-e02
phys-mech-p06	phys-mech-e02
phys-mech-p08	phys-mech-e03
phys-mech-p11	phys-mech-e04
copy:phys-mech-p01	copy:phys-mech-p02
copy:phys-mech-p02	copy:phys-mech-p03
copy:phys-mech-p03	copy:phys-mech-p04
copy:phys-mech-p03	copy:phys-mech-p05
copy:phys-mech-p05	copy:phys-mech-p06
copy:phys-mech-p05	copy:phys-mech-p07
copy:phys-mech-p07	copy:phys-mech-p08
copy:phys-mech-p04	copy:phys-mech-p09
copy:phys-mech-p05	copy:phys-mech-p09
copy:phys-mech-p09	copy:phys-mech-p10
copy:phys-mech-p08	copy:phys-mech-p10
copy:phys-mech-p07	copy:phys-mech-p11
copy:phys-mech-p10	copy:phys-mech-p12
copy:phys-mech-p11	copy:phys-mech-p12
copy:phys-mech-p01	copy:phys-mech-e01
copy:phys-mech-p04	copy:phys-mech-e02
copy:phys-mech-p06	copy:phys-mech-e02
copy:phys-mech-p08	copy:phys-mech-e03
copy:phys-mech-p11	copy:phys-mech-e04
\.


--
-- Data for Name: _studentClasses; Type: TABLE DATA; Schema: public; Owner: edu
--

COPY public."_studentClasses" ("A", "B") FROM stdin;
cmtyecae60009n3rxqnygebgz	cmtyeca9h0002n3rx3qxvy8q8
cmtyecae60009n3rxqnygebgz	cmtyecaax0003n3rxqjaihk3w
cmtyecae60009n3rxqnygebgz	cmtyecace0004n3rxycdj51tv
cmtyecae60009n3rxqnygebgz	cmtyecadx0005n3rxb92yrt89
\.


--
-- Name: Badge Badge_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Badge"
    ADD CONSTRAINT "Badge_pkey" PRIMARY KEY (id);


--
-- Name: ClassEnrollment ClassEnrollment_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ClassEnrollment"
    ADD CONSTRAINT "ClassEnrollment_pkey" PRIMARY KEY (id);


--
-- Name: Class Class_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Class"
    ADD CONSTRAINT "Class_pkey" PRIMARY KEY (id);


--
-- Name: CriterionScore CriterionScore_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."CriterionScore"
    ADD CONSTRAINT "CriterionScore_pkey" PRIMARY KEY (id);


--
-- Name: Event Event_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_pkey" PRIMARY KEY (id);


--
-- Name: ExamFile ExamFile_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamFile"
    ADD CONSTRAINT "ExamFile_pkey" PRIMARY KEY (id);


--
-- Name: ExamRating ExamRating_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamRating"
    ADD CONSTRAINT "ExamRating_pkey" PRIMARY KEY (id);


--
-- Name: ExamResult ExamResult_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamResult"
    ADD CONSTRAINT "ExamResult_pkey" PRIMARY KEY (id);


--
-- Name: Exam Exam_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Exam"
    ADD CONSTRAINT "Exam_pkey" PRIMARY KEY (id);


--
-- Name: ExerciseSubmission ExerciseSubmission_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExerciseSubmission"
    ADD CONSTRAINT "ExerciseSubmission_pkey" PRIMARY KEY (id);


--
-- Name: Exercise Exercise_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_pkey" PRIMARY KEY (id);


--
-- Name: GraphEdge GraphEdge_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."GraphEdge"
    ADD CONSTRAINT "GraphEdge_pkey" PRIMARY KEY (id);


--
-- Name: Lesson Lesson_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_pkey" PRIMARY KEY (id);


--
-- Name: Materials Materials_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Materials"
    ADD CONSTRAINT "Materials_pkey" PRIMARY KEY (id);


--
-- Name: Message Message_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_pkey" PRIMARY KEY (id);


--
-- Name: ModuleAssignment ModuleAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ModuleAssignment"
    ADD CONSTRAINT "ModuleAssignment_pkey" PRIMARY KEY (id);


--
-- Name: Module Module_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_pkey" PRIMARY KEY (id);


--
-- Name: ProjectAttempt ProjectAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ProjectAttempt"
    ADD CONSTRAINT "ProjectAttempt_pkey" PRIMARY KEY (id);


--
-- Name: ProjectVersion ProjectVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ProjectVersion"
    ADD CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY (id);


--
-- Name: Project Project_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_pkey" PRIMARY KEY (id);


--
-- Name: Question Question_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_pkey" PRIMARY KEY (id);


--
-- Name: QuizAttempt QuizAttempt_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY (id);


--
-- Name: Quiz Quiz_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_pkey" PRIMARY KEY (id);


--
-- Name: ReviewAssignment ReviewAssignment_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ReviewAssignment"
    ADD CONSTRAINT "ReviewAssignment_pkey" PRIMARY KEY (id);


--
-- Name: RubricCriterion RubricCriterion_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."RubricCriterion"
    ADD CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY (id);


--
-- Name: SchoolTeacher SchoolTeacher_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."SchoolTeacher"
    ADD CONSTRAINT "SchoolTeacher_pkey" PRIMARY KEY (id);


--
-- Name: School School_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."School"
    ADD CONSTRAINT "School_pkey" PRIMARY KEY (id);


--
-- Name: SeanceParticipation SeanceParticipation_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."SeanceParticipation"
    ADD CONSTRAINT "SeanceParticipation_pkey" PRIMARY KEY (id);


--
-- Name: Seance Seance_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Seance"
    ADD CONSTRAINT "Seance_pkey" PRIMARY KEY (id);


--
-- Name: UserBadge UserBadge_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: XpEvent XpEvent_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."XpEvent"
    ADD CONSTRAINT "XpEvent_pkey" PRIMARY KEY (id);


--
-- Name: _ProjectPrerequisites _ProjectPrerequisites_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."_ProjectPrerequisites"
    ADD CONSTRAINT "_ProjectPrerequisites_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: _studentClasses _studentClasses_AB_pkey; Type: CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."_studentClasses"
    ADD CONSTRAINT "_studentClasses_AB_pkey" PRIMARY KEY ("A", "B");


--
-- Name: Badge_code_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "Badge_code_key" ON public."Badge" USING btree (code);


--
-- Name: ClassEnrollment_classId_studentId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ClassEnrollment_classId_studentId_key" ON public."ClassEnrollment" USING btree ("classId", "studentId");


--
-- Name: Class_key_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "Class_key_key" ON public."Class" USING btree (key);


--
-- Name: CriterionScore_attemptId_criterionId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "CriterionScore_attemptId_criterionId_key" ON public."CriterionScore" USING btree ("attemptId", "criterionId");


--
-- Name: ExamRating_examId_studentId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ExamRating_examId_studentId_key" ON public."ExamRating" USING btree ("examId", "studentId");


--
-- Name: ExamResult_examId_studentId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ExamResult_examId_studentId_key" ON public."ExamResult" USING btree ("examId", "studentId");


--
-- Name: ExerciseSubmission_exerciseId_studentId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ExerciseSubmission_exerciseId_studentId_key" ON public."ExerciseSubmission" USING btree ("exerciseId", "studentId");


--
-- Name: GraphEdge_moduleId_fromKind_fromId_toKind_toId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "GraphEdge_moduleId_fromKind_fromId_toKind_toId_key" ON public."GraphEdge" USING btree ("moduleId", "fromKind", "fromId", "toKind", "toId");


--
-- Name: GraphEdge_moduleId_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "GraphEdge_moduleId_idx" ON public."GraphEdge" USING btree ("moduleId");


--
-- Name: ModuleAssignment_classId_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "ModuleAssignment_classId_idx" ON public."ModuleAssignment" USING btree ("classId");


--
-- Name: ModuleAssignment_moduleId_classId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ModuleAssignment_moduleId_classId_key" ON public."ModuleAssignment" USING btree ("moduleId", "classId");


--
-- Name: ProjectAttempt_projectId_studentId_attemptNumber_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ProjectAttempt_projectId_studentId_attemptNumber_key" ON public."ProjectAttempt" USING btree ("projectId", "studentId", "attemptNumber");


--
-- Name: ProjectAttempt_state_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "ProjectAttempt_state_idx" ON public."ProjectAttempt" USING btree (state);


--
-- Name: ProjectAttempt_studentId_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "ProjectAttempt_studentId_idx" ON public."ProjectAttempt" USING btree ("studentId");


--
-- Name: ProjectVersion_projectId_versionNumber_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ProjectVersion_projectId_versionNumber_key" ON public."ProjectVersion" USING btree ("projectId", "versionNumber");


--
-- Name: Project_currentVersionId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "Project_currentVersionId_key" ON public."Project" USING btree ("currentVersionId");


--
-- Name: Project_moduleId_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "Project_moduleId_idx" ON public."Project" USING btree ("moduleId");


--
-- Name: QuizAttempt_quizId_studentId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "QuizAttempt_quizId_studentId_key" ON public."QuizAttempt" USING btree ("quizId", "studentId");


--
-- Name: Quiz_classId_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "Quiz_classId_idx" ON public."Quiz" USING btree ("classId");


--
-- Name: ReviewAssignment_attemptId_reviewerId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "ReviewAssignment_attemptId_reviewerId_key" ON public."ReviewAssignment" USING btree ("attemptId", "reviewerId");


--
-- Name: ReviewAssignment_reviewerId_status_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "ReviewAssignment_reviewerId_status_idx" ON public."ReviewAssignment" USING btree ("reviewerId", status);


--
-- Name: SchoolTeacher_schoolId_teacherId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "SchoolTeacher_schoolId_teacherId_key" ON public."SchoolTeacher" USING btree ("schoolId", "teacherId");


--
-- Name: SeanceParticipation_seanceId_studentId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "SeanceParticipation_seanceId_studentId_key" ON public."SeanceParticipation" USING btree ("seanceId", "studentId");


--
-- Name: Seance_eventId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "Seance_eventId_key" ON public."Seance" USING btree ("eventId");


--
-- Name: UserBadge_userId_badgeId_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "UserBadge_userId_badgeId_key" ON public."UserBadge" USING btree ("userId", "badgeId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: XpEvent_dedupeKey_key; Type: INDEX; Schema: public; Owner: edu
--

CREATE UNIQUE INDEX "XpEvent_dedupeKey_key" ON public."XpEvent" USING btree ("dedupeKey");


--
-- Name: XpEvent_userId_moduleId_idx; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "XpEvent_userId_moduleId_idx" ON public."XpEvent" USING btree ("userId", "moduleId");


--
-- Name: _ProjectPrerequisites_B_index; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "_ProjectPrerequisites_B_index" ON public."_ProjectPrerequisites" USING btree ("B");


--
-- Name: _studentClasses_B_index; Type: INDEX; Schema: public; Owner: edu
--

CREATE INDEX "_studentClasses_B_index" ON public."_studentClasses" USING btree ("B");


--
-- Name: ClassEnrollment ClassEnrollment_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ClassEnrollment"
    ADD CONSTRAINT "ClassEnrollment_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClassEnrollment ClassEnrollment_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ClassEnrollment"
    ADD CONSTRAINT "ClassEnrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Class Class_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Class"
    ADD CONSTRAINT "Class_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."School"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Class Class_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Class"
    ADD CONSTRAINT "Class_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: CriterionScore CriterionScore_attemptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."CriterionScore"
    ADD CONSTRAINT "CriterionScore_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES public."ProjectAttempt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CriterionScore CriterionScore_criterionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."CriterionScore"
    ADD CONSTRAINT "CriterionScore_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES public."RubricCriterion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CriterionScore CriterionScore_graderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."CriterionScore"
    ADD CONSTRAINT "CriterionScore_graderId_fkey" FOREIGN KEY ("graderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Event Event_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Event Event_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Event Event_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Event"
    ADD CONSTRAINT "Event_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."School"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ExamFile ExamFile_examId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamFile"
    ADD CONSTRAINT "ExamFile_examId_fkey" FOREIGN KEY ("examId") REFERENCES public."Exam"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExamRating ExamRating_examId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamRating"
    ADD CONSTRAINT "ExamRating_examId_fkey" FOREIGN KEY ("examId") REFERENCES public."Exam"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExamRating ExamRating_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamRating"
    ADD CONSTRAINT "ExamRating_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExamResult ExamResult_examId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamResult"
    ADD CONSTRAINT "ExamResult_examId_fkey" FOREIGN KEY ("examId") REFERENCES public."Exam"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExamResult ExamResult_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExamResult"
    ADD CONSTRAINT "ExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Exam Exam_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Exam"
    ADD CONSTRAINT "Exam_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Exam Exam_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Exam"
    ADD CONSTRAINT "Exam_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Exam Exam_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Exam"
    ADD CONSTRAINT "Exam_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExerciseSubmission ExerciseSubmission_exerciseId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExerciseSubmission"
    ADD CONSTRAINT "ExerciseSubmission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES public."Exercise"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ExerciseSubmission ExerciseSubmission_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ExerciseSubmission"
    ADD CONSTRAINT "ExerciseSubmission_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Exercise Exercise_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Exercise"
    ADD CONSTRAINT "Exercise_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: GraphEdge GraphEdge_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."GraphEdge"
    ADD CONSTRAINT "GraphEdge_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Lesson Lesson_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Lesson Lesson_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Lesson"
    ADD CONSTRAINT "Lesson_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Materials Materials_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Materials"
    ADD CONSTRAINT "Materials_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Materials Materials_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Materials"
    ADD CONSTRAINT "Materials_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Message Message_senderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Message Message_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Message"
    ADD CONSTRAINT "Message_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModuleAssignment ModuleAssignment_assignedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ModuleAssignment"
    ADD CONSTRAINT "ModuleAssignment_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ModuleAssignment ModuleAssignment_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ModuleAssignment"
    ADD CONSTRAINT "ModuleAssignment_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ModuleAssignment ModuleAssignment_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ModuleAssignment"
    ADD CONSTRAINT "ModuleAssignment_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Module Module_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Module"
    ADD CONSTRAINT "Module_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectAttempt ProjectAttempt_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ProjectAttempt"
    ADD CONSTRAINT "ProjectAttempt_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectAttempt ProjectAttempt_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ProjectAttempt"
    ADD CONSTRAINT "ProjectAttempt_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: ProjectAttempt ProjectAttempt_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ProjectAttempt"
    ADD CONSTRAINT "ProjectAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ProjectAttempt ProjectAttempt_versionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ProjectAttempt"
    ADD CONSTRAINT "ProjectAttempt_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES public."ProjectVersion"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ProjectVersion ProjectVersion_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ProjectVersion"
    ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_currentVersionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES public."ProjectVersion"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Project Project_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Project Project_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Project"
    ADD CONSTRAINT "Project_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Question Question_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Question"
    ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuizAttempt QuizAttempt_quizId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES public."Quiz"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: QuizAttempt QuizAttempt_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."QuizAttempt"
    ADD CONSTRAINT "QuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Quiz Quiz_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Quiz Quiz_lessonId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES public."Lesson"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Quiz Quiz_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Quiz Quiz_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: Quiz Quiz_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Quiz"
    ADD CONSTRAINT "Quiz_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ReviewAssignment ReviewAssignment_attemptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ReviewAssignment"
    ADD CONSTRAINT "ReviewAssignment_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES public."ProjectAttempt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: ReviewAssignment ReviewAssignment_reviewerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."ReviewAssignment"
    ADD CONSTRAINT "ReviewAssignment_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RubricCriterion RubricCriterion_versionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."RubricCriterion"
    ADD CONSTRAINT "RubricCriterion_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES public."ProjectVersion"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SchoolTeacher SchoolTeacher_schoolId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."SchoolTeacher"
    ADD CONSTRAINT "SchoolTeacher_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES public."School"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SchoolTeacher SchoolTeacher_teacherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."SchoolTeacher"
    ADD CONSTRAINT "SchoolTeacher_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: School School_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."School"
    ADD CONSTRAINT "School_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SeanceParticipation SeanceParticipation_seanceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."SeanceParticipation"
    ADD CONSTRAINT "SeanceParticipation_seanceId_fkey" FOREIGN KEY ("seanceId") REFERENCES public."Seance"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: SeanceParticipation SeanceParticipation_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."SeanceParticipation"
    ADD CONSTRAINT "SeanceParticipation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Seance Seance_classId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Seance"
    ADD CONSTRAINT "Seance_classId_fkey" FOREIGN KEY ("classId") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Seance Seance_eventId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."Seance"
    ADD CONSTRAINT "Seance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES public."Event"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: UserBadge UserBadge_badgeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES public."Badge"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserBadge UserBadge_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."UserBadge"
    ADD CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: XpEvent XpEvent_moduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."XpEvent"
    ADD CONSTRAINT "XpEvent_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES public."Module"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: XpEvent XpEvent_projectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."XpEvent"
    ADD CONSTRAINT "XpEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: XpEvent XpEvent_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."XpEvent"
    ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectPrerequisites _ProjectPrerequisites_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."_ProjectPrerequisites"
    ADD CONSTRAINT "_ProjectPrerequisites_A_fkey" FOREIGN KEY ("A") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _ProjectPrerequisites _ProjectPrerequisites_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."_ProjectPrerequisites"
    ADD CONSTRAINT "_ProjectPrerequisites_B_fkey" FOREIGN KEY ("B") REFERENCES public."Project"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _studentClasses _studentClasses_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."_studentClasses"
    ADD CONSTRAINT "_studentClasses_A_fkey" FOREIGN KEY ("A") REFERENCES public."Class"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _studentClasses _studentClasses_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: edu
--

ALTER TABLE ONLY public."_studentClasses"
    ADD CONSTRAINT "_studentClasses_B_fkey" FOREIGN KEY ("B") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fufH4EwDyKE01qG2HyA1lcBJ5yRKqDZGjzlES5x5bIcJKOKvll0wbKBpyp5eNiv

