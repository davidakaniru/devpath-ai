export interface SM2State {
  repetition: number;
  easeFactor: number;
  intervalDays: number;
}

export interface SM2Result extends SM2State {
  reviewDate: Date;
}

/**
 * Implements the SM-2 spaced repetition algorithm (Wozniak, 1990).
 * quality: 0-5 self-rated recall quality.
 *   < 3 = failed recall, resets repetition count.
 *   >= 3 = successful recall, interval grows.
 */
export function calculateSM2(current: SM2State, quality: number): SM2Result {
  let { repetition, easeFactor, intervalDays } = current;

  if (quality < 3) {
    repetition = 0;
    intervalDays = 1;
  } else {
    if (repetition === 0) {
      intervalDays = 1;
    } else if (repetition === 1) {
      intervalDays = 6;
    } else {
      intervalDays = Math.round(intervalDays * easeFactor);
    }
    repetition += 1;
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(easeFactor, 1.3); // SM-2's floor — prevents ease collapsing to near-zero

  const reviewDate = new Date();
  reviewDate.setDate(reviewDate.getDate() + intervalDays);

  return { repetition, easeFactor, intervalDays, reviewDate };
}

export const RATING_TO_QUALITY: Record<
  "AGAIN" | "HARD" | "GOOD" | "EASY",
  number
> = {
  AGAIN: 2,
  HARD: 3,
  GOOD: 4,
  EASY: 5,
};
