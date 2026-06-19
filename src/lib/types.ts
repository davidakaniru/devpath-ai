export type UserRole = "LEARNER" | "ADMIN";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
};
