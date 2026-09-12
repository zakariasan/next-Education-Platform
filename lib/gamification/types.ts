import type { AutoConfig } from "./autograde";
import type { Edge, NodeState } from "./graph";

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
  id: string;
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
