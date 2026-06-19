export type UserRole = "LEARNER" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};

// {
//   "questionNumber": 1,
//   "difficulty": "medium",
//   "category": "fundamentals",
//   "question": "Question text",
//   "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
//   "correctOption": "B"
// }
