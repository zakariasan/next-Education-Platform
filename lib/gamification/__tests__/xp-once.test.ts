import { describe, expect, it } from "vitest";
import { awardXp, validationDedupeKey, type XpTx } from "../service";

// In-memory stand-in for the Prisma transaction: unique dedupeKey behaves
// like the DB constraint (throws P2002 on duplicates).
function fakeTx() {
  const keys = new Set<string>();
  const events: { userId: string; amount: number; dedupeKey?: string | null }[] = [];
  const totals = new Map<string, number>();
  const tx: XpTx = {
    xpEvent: {
      async create({ data }) {
        if (data.dedupeKey) {
          if (keys.has(data.dedupeKey)) throw Object.assign(new Error("Unique constraint"), { code: "P2002" });
          keys.add(data.dedupeKey);
        }
        events.push(data);
        return data;
      },
    },
    user: {
      async update({ where, data }) {
        totals.set(where.id, (totals.get(where.id) ?? 0) + data.totalXP.increment);
        return null;
      },
    },
  };
  return { tx, events, totals };
}

describe("XP awarded exactly once per project", () => {
  it("second validation of the same project writes nothing", async () => {
    const { tx, events, totals } = fakeTx();
    const key = validationDedupeKey("stu", "proj");
    const first = await awardXp(tx, { userId: "stu", amount: 150, reason: "PROJECT_VALIDATED", projectId: "proj", dedupeKey: key });
    const second = await awardXp(tx, { userId: "stu", amount: 150, reason: "PROJECT_VALIDATED", projectId: "proj", dedupeKey: key });
    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(events).toHaveLength(1);
    expect(totals.get("stu")).toBe(150);
  });

  it("different projects or students award independently", async () => {
    const { tx, totals } = fakeTx();
    await awardXp(tx, { userId: "stu", amount: 100, reason: "PROJECT_VALIDATED", projectId: "p1", dedupeKey: validationDedupeKey("stu", "p1") });
    await awardXp(tx, { userId: "stu", amount: 100, reason: "PROJECT_VALIDATED", projectId: "p2", dedupeKey: validationDedupeKey("stu", "p2") });
    await awardXp(tx, { userId: "other", amount: 100, reason: "PROJECT_VALIDATED", projectId: "p1", dedupeKey: validationDedupeKey("other", "p1") });
    expect(totals.get("stu")).toBe(200);
    expect(totals.get("other")).toBe(100);
  });

  it("rethrows non-duplicate errors", async () => {
    const tx: XpTx = {
      xpEvent: { create: async () => { throw new Error("boom"); } },
      user: { update: async () => null },
    };
    await expect(awardXp(tx, { userId: "s", amount: 1, reason: "BADGE" })).rejects.toThrow("boom");
  });
});
