import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  phone: phoneSchema,
  email: z
    .string()
    .trim()
    .email("Invalid email")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(72),
  terms: z.boolean().refine((v) => v === true, {
    message: "You must accept Terms & Conditions",
  }),
});

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10),
  level: z.string().default("Beginner"),
  duration: z.string().default("4 weeks"),
  isFree: z.boolean().default(true),
  thumbnail: z.string().optional(),
});

export const messageSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  conversationId: z.string().optional(),
});
