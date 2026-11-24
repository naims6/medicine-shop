import * as z from "zod";
import type { Resolver } from "react-hook-form";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const loginResolver: Resolver<LoginFormData> = async (values) => {
  const result = loginSchema.safeParse(values);
  if (result.success) {
    return { values: result.data, errors: {} };
  }
  const errors: Record<string, { type: string; message: string }> = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !errors[field]) {
      errors[field] = { type: issue.code, message: issue.message };
    }
  }
  return {
    values: {},
    errors: errors as unknown as Record<string, { type: string; message: string }>,
  };
};
