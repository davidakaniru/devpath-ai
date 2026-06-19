// src/lib/validation/auth.ts
import * as yup from "yup";

export const registerSchema = yup.object({
  fullName: yup
    .string()
    .required("Full name is required")
    .min(2, "Minimum of 2 characters"),
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Minimum of 8 characters"),
});

export type RegisterInput = yup.InferType<typeof registerSchema>;
