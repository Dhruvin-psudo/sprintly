import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Mail, Lock, User } from "lucide-react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PUBLIC_ROUTES } from "@/router/constants/routes";

/* ─── Schema (co-located per AGENTS.md) ─── */

const registerSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(100, "First name must be at most 100 characters"),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(100, "Last name must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  email: z.email("Please enter a valid email address"),
  passwordHash: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(255, "Password must be at most 255 characters"),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

/* ─── Password strength helper ─── */

const STRENGTH_MAP: Record<number, { label: string; color: string }> = {
  0: { label: "Too short", color: "bg-destructive" },
  1: { label: "Weak", color: "bg-destructive" },
  2: { label: "Fair", color: "bg-yellow-500" },
  3: { label: "Good", color: "bg-green-500" },
  4: { label: "Strong", color: "bg-green-500" },
};

function getPasswordStrength(password: string) {
  if (!password) return { level: 0, label: "", color: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return { level: score, ...STRENGTH_MAP[score] };
}

/* ─── Component ─── */

interface RegisterFormProps {
  onSubmit: (data: RegisterFormValues) => void;
  isPending?: boolean;
}

export function RegisterForm({
  onSubmit,
  isPending = false,
}: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      passwordHash: "",
    },
  });

  const password = watch("passwordHash");
  const passwordStrength = getPasswordStrength(password);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name row — two columns */}
      <div className="grid grid-cols-2 gap-3">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="register-firstname">First Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="register-firstname"
              type="text"
              placeholder="John"
              autoComplete="given-name"
              className="pl-10"
              {...register("firstName")}
            />
          </div>
          {errors.firstName && (
            <p className="text-sm text-destructive">
              {errors.firstName.message}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="register-lastname">
            Last Name{" "}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="register-lastname"
              type="text"
              placeholder="Doe"
              autoComplete="family-name"
              className="pl-10"
              {...register("lastName")}
            />
          </div>
          {errors.lastName && (
            <p className="text-sm text-destructive">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            className="pl-10 pr-10"
            {...register("passwordHash")}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="size-4" />
            ) : (
              <Eye className="size-4" />
            )}
          </Button>
        </div>
        {errors.passwordHash && (
          <p className="text-sm text-destructive">{errors.passwordHash.message}</p>
        )}

        {/* Password strength indicator */}
        {password && (
          <div className="space-y-1.5">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    level <= passwordStrength.level
                      ? passwordStrength.color
                      : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p
              className={`text-xs ${
                passwordStrength.level <= 1
                  ? "text-destructive"
                  : passwordStrength.level <= 2
                    ? "text-yellow-500"
                    : "text-green-500"
              }`}
            >
              {passwordStrength.label}
            </p>
          </div>
        )}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full h-10 bg-gradient-brand hover:opacity-90 transition-opacity font-semibold text-white"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          to={PUBLIC_ROUTES.LOGIN}
          className="font-medium text-primary hover:underline underline-offset-4 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
