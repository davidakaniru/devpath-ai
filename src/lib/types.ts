export type UserRole = "LEARNER" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

export interface AnswerRecord {
  questionNumber: number;
  category: string;
  difficulty: string;
  userAnswer: string;
  confidence: string;
  correct: boolean;
}
