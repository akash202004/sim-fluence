import { z } from "zod";

export const userSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required").optional(),
    email: z.string().email("Invalid email address"),
    profileImageUrl: z.string().url("Invalid URL").optional(),
})

export type User = z.infer<typeof userSchema>;