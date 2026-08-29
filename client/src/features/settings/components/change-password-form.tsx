import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useChangePassword } from "@/features/settings/hooks/use-change-password";

const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(8, "Must be at least 8 characters").max(128),
        confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
    const { mutate, isPending } = useChangePassword();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ChangePasswordFormValues>({
        resolver: zodResolver(changePasswordSchema),
    });

    const onSubmit = (data: ChangePasswordFormValues) => {
        mutate(
            { currentPassword: data.currentPassword, newPassword: data.newPassword },
            { onSuccess: () => reset() },
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
            <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter your current password"
                    {...register("currentPassword")}
                />
                {errors.currentPassword && (
                    <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password (min 8 characters)"
                    {...register("newPassword")}
                />
                {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
            </div>
            <Button type="submit" disabled={isPending} className="text-white">
                {isPending ? "Updating..." : "Update Password"}
            </Button>
        </form>
    );
}
