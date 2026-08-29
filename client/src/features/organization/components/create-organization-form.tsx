import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Mail, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ─── Schema (co-located per AGENTS.md) ─── */

const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Organization name is required")
    .max(100, "Organization name must be at most 100 characters"),
  email: z
    .string()
    .email("Please enter a valid email address")
    .optional()
    .or(z.literal("")),
});

export type CreateOrganizationFormValues = z.infer<
  typeof createOrganizationSchema
>;

/* ─── Component ─── */

interface CreateOrganizationFormProps {
  onSubmit: (data: CreateOrganizationFormValues) => void;
  isPending?: boolean;
}

export function CreateOrganizationForm({
  onSubmit,
  isPending = false,
}: CreateOrganizationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleFormSubmit = (data: CreateOrganizationFormValues) => {
    onSubmit({
      ...data,
      email: data.email ? data.email.toLowerCase().trim() : "",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      {/* Organization Name */}
      <div className="space-y-2">
        <Label htmlFor="org-name">Organization Name</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="org-name"
            type="text"
            placeholder="Acme Inc."
            autoComplete="organization"
            className="pl-10"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Organization Email */}
      <div className="space-y-2">
        <Label htmlFor="org-email">
          Organization Email{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            id="org-email"
            type="email"
            placeholder="contact@acme.com"
            autoComplete="email"
            className="pl-10"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full h-10 bg-gradient-brand hover:opacity-90 transition-opacity font-semibold text-white mt-2"
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating Organization…
          </>
        ) : (
          "Create Organization"
        )}
      </Button>
    </form>
  );
}
