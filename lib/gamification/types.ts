import type { AutoConfig } from "./autograde";
import type { Edge, NodeState } from "./graph";
import type { NodeKind } from "./nodes";

export type CriterionMode = "AUTO" | "TEACHER" | "PEER";
export type ProjectStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type AttemptState =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VALIDATED"
  | "FAILED";

export type CriterionDTO = {
  id: string;
  title: string;
  description: string | null;
  weight: number;
  mode: CriterionMode;
  orderIndex: number;
  autoConfig: AutoConfig | null;
};

export type CriterionInput = Omit<CriterionDTO, "id" | "orderIndex"> & { id?: string };

export type ProjectContentInput = {
  title: string;
  statement: string;
  objectives: string[];
  estimatedHours: number;
  xpReward: number;
  allowedResources: string[];
  threshold: number;
  criteria: CriterionInput[];
};

export type VersionDTO = ProjectContentInput & {
  id: string;
  versionNumber: number;
  criteria: CriterionDTO[];
  createdAt: string;
};

export type ProjectDTO = {
  id: string;
  moduleId: string;
  isCore: boolean;
  orderIndex: number;
  status: ProjectStatus;
  pinX: number | null;
  pinY: number | null;
  prerequisiteIds: string[];
  version: VersionDTO | null;
  versionCount: number;
  attemptCount: number;
  updatedAt: string;
};

export type ModuleDTO = {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  status: ProjectStatus;
  teacherId: string;
  teacherName: string;
  projectCount: number;
  coreCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ModuleDetailDTO = ModuleDTO & { projects: ProjectDTO[] };

export type GraphNode = {
  /** Node key, e.g. "PROJECT:ckx...". Unique across kinds; edges use these. */
  id: string;
  /** What this node is. */
  kind: NodeKind;
  /** The underlying Project / Exam / Quiz id, for links and detail panels. */
  refId: string;
  title: string;
  isCore: boolean;
  status: ProjectStatus;
  estimatedHours: number;
  xpReward: number;
  depth: number;
  orderIndex: number;
  pinX: number | null;
  pinY: number | null;
  prerequisiteIds: string[];
  state: NodeState;
  /** Core-project progress. Only MODULE nodes set this. */
  progress?: { done: number; total: number } | null;
  /** MODULE nodes only: the module has no core projects, so it can never be
   *  finished and anything placed behind it stays locked. */
  blocksProgress?: boolean;
  attempt: {
    id: string;
    state: AttemptState;
    attemptNumber: number;
    score: number | null;
    startedAt: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    xpAwarded: number;
  } | null;
};

export type GraphPayload = {
  module: { id: string; title: string; subject: string; description: string | null };
  nodes: GraphNode[];
  edges: Edge[];
};
