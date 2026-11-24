import * as z from "zod";

export const userFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["Admin", "Salesman"] as const),
  status: z.enum(["Active", "Inactive"] as const),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export type UserFormData = z.infer<typeof userFormSchema>;

// ---------------------------------------------------------------------------
// Create User
// ---------------------------------------------------------------------------

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["Admin", "Salesman"] as const),
  status: z.enum(["Active", "Inactive"] as const),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

// ---------------------------------------------------------------------------
// Edit User  (password handled separately via ChangePasswordModal)
// ---------------------------------------------------------------------------

export const updateUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  role: z.enum(["Admin", "Salesman"] as const),
  status: z.enum(["Active", "Inactive"] as const),
  phone: z.string().max(20).optional().or(z.literal("")),
});

export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

// ---------------------------------------------------------------------------
// Change Password
// ---------------------------------------------------------------------------

export const changePasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
