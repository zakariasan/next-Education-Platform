// Badge catalogue + pure evaluation. Add a badge: append here, seed picks it up.
export type BadgeDef = {
  code: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
};

export const BADGES: BadgeDef[] = [
  { code: "FIRST_CORE", title: "First Spark", description: "Validated your first common-core project.", icon: "Zap" },
  { code: "CORE_COMPLETE", title: "Core Circuit Closed", description: "Completed the common core of a module.", icon: "CircuitBoard" },
  { code: "SPEED_RUN", title: "Overclocked", description: "Validated a project under its estimated hours.", icon: "Gauge" },
  { code: "FIRST_PEER_REVIEW", title: "Second Opinion", description: "Completed your first peer review.", icon: "Users" },
  { code: "ELECTIVE_EXPLORER", title: "Explorer", description: "Validated an elective project.", icon: "Compass" },
  { code: "COMEBACK", title: "Comeback", description: "Validated a project after a failed attempt.", icon: "RotateCcw" },
  { code: "LEVEL_5", title: "Level 5", description: "Reached level 5.", icon: "Star" },
  { code: "LEVEL_10", title: "Level 10", description: "Reached level 10.", icon: "Crown" },
];

export type BadgeContext = {
  validatedCoreCount: number;
  validatedElectiveCount: number;
  coreCompleteModules: number;
  speedValidations: number;
  peerReviewsDone: number;
  comebackValidations: number;
  level: number;
};

export function earnedBadgeCodes(ctx: BadgeContext): string[] {
  const out: string[] = [];
  if (ctx.validatedCoreCount >= 1) out.push("FIRST_CORE");
  if (ctx.coreCompleteModules >= 1) out.push("CORE_COMPLETE");
  if (ctx.speedValidations >= 1) out.push("SPEED_RUN");
  if (ctx.peerReviewsDone >= 1) out.push("FIRST_PEER_REVIEW");
  if (ctx.validatedElectiveCount >= 1) out.push("ELECTIVE_EXPLORER");
  if (ctx.comebackValidations >= 1) out.push("COMEBACK");
  if (ctx.level >= 5) out.push("LEVEL_5");
  if (ctx.level >= 10) out.push("LEVEL_10");
  return out;
}
