import { useMutation } from "@tanstack/react-query";
import { changePassword, type IChangePasswordRequest } from "@/api/services/user.api";
import { toast } from "sonner";

export function useChangePassword() {
    return useMutation({
        mutationFn: (data: IChangePasswordRequest) => changePassword(data),
        onSuccess: () => {
            toast.success("Password updated successfully");
        },
        onError: (error: unknown) => {
            const message =
                (error as { response?: { data?: { message?: string } } })?.response?.data
                    ?.message || "Failed to update password";
            toast.error(typeof message === "string" ? message : JSON.stringify(message));
        },
    });
}
