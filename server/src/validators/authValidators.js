import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Name is required").max(80, "Name must be 80 characters or less"),
    email: z.string().trim().email("Email must be valid").max(120, "Email must be 120 characters or less"),
    password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password must be 128 characters or less")
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Email must be valid").max(120, "Email must be 120 characters or less"),
    password: z.string().min(1, "Password is required").max(128, "Password must be 128 characters or less")
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name must be 80 characters or less").optional(),
      password: z.string().min(6, "Password must be at least 6 characters").max(128, "Password must be 128 characters or less").optional()
    })
    .refine((value) => Boolean(value.name || value.password), {
      message: "Provide at least one field to update",
      path: ["name"]
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
