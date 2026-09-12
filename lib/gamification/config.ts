// Single source of truth for every gamification business rule.
// Tweak numbers here; nothing else in the codebase hardcodes them.
export const GAMIFICATION = {
  level: {
    // cumulative XP needed to reach level L = base * (L - 1) ^ exponent
    // L2=100, L3=283, L5=800, L10=2700, L20=8300 with base=100, exponent=1.5
    base: 100,
    exponent: 1.5,
    max: 99,
  },
  validation: {
    defaultThresholdPercent: 70,
  },
  xp: {
    // bonus on xpReward when validated under estimatedHours
    speedBonusPercent: 15,
    // penalty on xpReward per failed attempt before validation (capped)
    retryPenaltyPercent: 10,
    retryPenaltyCapPercent: 50,
    // XP for completing a peer review
    peerReviewXp: 10,
  },
  retry: {
    cooldownHours: 12,
  },
  correctionPoints: {
    earnedPerPeerReview: 1,
    costPerReviewRequest: 1,
    initial: 2,
  },
} as const;
