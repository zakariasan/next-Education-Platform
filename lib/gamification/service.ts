import type { XpReason } from "@prisma/client";

// Minimal transaction surface so the exactly-once logic is unit-testable
// without a database. Prisma's TransactionClient satisfies it.
export type XpTx = {
  xpEvent: {
    create(args: {
      data: {
        userId: string;
        amount: number;
        reason: XpReason;
        projectId?: string | null;
        moduleId?: string | null;
        attemptId?: string | null;
        dedupeKey?: string | null;
      };
    }): Promise<unknown>;
  };
  user: {
    update(args: {
      where: { id: string };
      data: { totalXP: { increment: number } };
    }): Promise<unknown>;
  };
};

export function validationDedupeKey(userId: string, projectId: string): string {
  return `validated:${userId}:${projectId}`;
}

export function peerReviewDedupeKey(userId: string, attemptId: string): string {
  return `peer-review:${userId}:${attemptId}`;
}

/**
 * Append an XP event and keep User.totalXP in sync.
 * Returns false (and writes nothing) when a dedupeKey was already used.
 */
export async function awardXp(
  tx: XpTx,
  award: {
    userId: string;
    amount: number;
    reason: XpReason;
    projectId?: string | null;
    moduleId?: string | null;
    attemptId?: string | null;
    dedupeKey?: string | null;
  },
): Promise<boolean> {
  try {
    await tx.xpEvent.create({ data: award });
  } catch (err) {
    if ((err as { code?: string })?.code === "P2002") return false;
    throw err;
  }
  await tx.user.update({
    where: { id: award.userId },
    data: { totalXP: { increment: award.amount } },
  });
  return true;
}
