import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

export const groupIdParams = z.object({
  body: z.object({}).optional(),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2, "Group name is required").max(80, "Group name must be 80 characters or less"),
    description: z.string().trim().max(300).optional().default("")
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const updateGroupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80).optional(),
    description: z.string().trim().max(300).optional()
  }),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});

export const updateMembersSchema = z.object({
  body: z
    .object({
      email: z.string().trim().email().max(120).optional(),
      removeUserId: objectId.optional()
    })
    .refine((data) => data.email || data.removeUserId, {
      message: "Provide email to add or removeUserId to remove"
    }),
  params: z.object({ id: objectId }),
  query: z.object({}).optional()
});
