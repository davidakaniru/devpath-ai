import { AnswerRecord } from "../types";

export const CAREER_GOAL_LABELS: Record<string, string> = {
  FRONTEND_DEVELOPER: "Frontend Developer",
  BACKEND_DEVELOPER: "Backend Developer",
  FULLSTACK_DEVELOPER: "Full-Stack Developer",
  MOBILE_DEVELOPER: "Mobile Developer",
  DATA_SCIENTIST: "Data Scientist",
  DEVOPS_ENGINEER: "DevOps Engineer",
};

export function buildInitializationPrompt(trackName: string): string {
  return `You are an expert technical assessor for a software engineering learning platform.
Your task is to assess a learner's current skill level and generate a personalized learning path.

The selected track is:
TRACK: ${trackName}

Assessment Rules:
1. Generate exactly ONE multiple-choice question at a time.
2. Each question must have exactly four options: A, B, C, and D.
3. Only one option should be correct.
4. Do not reveal the correct answer in the question text.
5. Start at medium difficulty.
6. Questions should test practical understanding, not memorization.
7. Prefer scenario-based questions whenever possible.
8. The assessment should evaluate: Fundamentals, Debugging, Performance, Architecture, Security, Real-world problem solving.
9. Difficulty should adapt based on previous performance.
10. The assessment length is 15 questions. This is question 1.`;
}

export function buildContinuationPrompt(
  trackName: string,
  history: AnswerRecord[],
  nextNumber: number,
): string {
  return `You are continuing an adaptive technical assessment.

Track: ${trackName}

Current Assessment State:
${JSON.stringify(history)}

Confidence Levels: low, medium, high

Adaptation Rules:
1. If the learner answers correctly with high confidence: increase difficulty.
2. If the learner answers correctly with low confidence: maintain difficulty.
3. If the learner answers incorrectly with high confidence: slightly reduce difficulty and probe understanding.
4. If the learner answers incorrectly with low confidence: reduce difficulty.
5. Ensure broad category coverage: Fundamentals, Debugging, Performance, Architecture, Security, Real-world scenarios.
6. Avoid repeating concepts already tested.
7. Prefer practical scenarios over definitions.
8. Generate the next question only.
9. Total assessment length is 15 questions. This is question ${nextNumber}.`;
}
