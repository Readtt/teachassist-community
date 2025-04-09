import { z } from "zod";

export const loginSchema = z.object({
  studentId: z.string().min(9, {
    message: "Student number must be at least 9 characters.",
  }),
  password: z.string().min(1, {
    message: "Password must be at least 1 character.",
  }),
});