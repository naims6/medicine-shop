"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Store, Eye, EyeOff, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormField } from "@/components/shared/FormField";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

import { useAuth } from "@/stores/AuthContext";
import { isApiError } from "@/lib/apiErrors";
import { loginResolver, type LoginFormData } from "@/schemas/auth.schema";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: loginResolver,
    defaultValues: { email: "", password: "" },
  });

  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");
    try {
      const user = await login({ email: data.email, password: data.password });
      router.replace(user.role === "Admin" ? "/dashboard" : "/dashboard/pos");
    } catch (err: unknown) {
      setServerError(
        isApiError(err) ? err.message : "Unable to log in. Please try again.",
      );
    }
  };

  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm space-y-6">

        {/* Brand */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div className="text-center">
            <span className="font-bold text-lg tracking-tight text-slate-900 block">
              Shodesh Pharmacy
            </span>
            <span className="text-xs text-slate-500">স্বদেশ ফার্মেসী</span>
          </div>
        </div>

        {/* Login card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Sign in to your account</CardTitle>
            <CardDescription>
              Enter your credentials to access the POS system.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {serverError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Email */}
              <FormField
                label="Email"
                htmlFor="email"
                required
                error={errors.email?.message}
              >
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className={errors.email ? "border-rose-400 focus-visible:ring-rose-400" : ""}
                  {...register("email")}
                />
              </FormField>

              {/* Password */}
              <FormField
                label="Password"
                htmlFor="password"
                required
                error={errors.password?.message}
              >
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    className={
                      errors.password
                        ? "border-rose-400 focus-visible:ring-rose-400 pr-9"
                        : "pr-9"
                    }
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </FormField>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner
                      size="w-3.5 h-3.5"
                      color="border-white/40 border-t-white"
                    />
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-slate-400">
          Pharmacy Point of Sale System
        </p>
      </div>
    </div>
  );
}
