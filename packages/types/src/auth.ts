import z from "zod";

export interface CustomJwtSessionClaims {
  metadata?: {
    role?: "user" | "admin";
  };
}

export const UserFormSchema = z.object({
  name: z
    .string({ message: "Name is required!" })
    .min(2, { message: "Name must be at least 2 characters!" })
    .max(50),
  email: z
    .string({ message: "Email is required!" })
    .email({ message: "Invalid email address!" }),
  password: z
    .string({ message: "Password is required!" })
    .min(6, { message: "Password must be at least 6 characters!" }) // DB gen hash BCrypt
    .max(50),
});