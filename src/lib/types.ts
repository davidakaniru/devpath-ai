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

export interface Question {
  id: string;
  questionNumber: number;
  category: string;
  difficulty: string;
  questionText: string;
  options: { A: string; B: string; C: string; D: string };
}