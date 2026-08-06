import { clearAccessToken } from "@/api";
import { logout } from "@/api/services/auth.api";
import { PUBLIC_ROUTES } from "@/router/constants/routes";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useLogout() {
    const navigate = useNavigate();
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: () => logout(),
        onSettled: () => {
            clearAccessToken();
            queryClient.clear();
            navigate(PUBLIC_ROUTES.LOGIN);
            toast.success('Logout successfully')
        }
    })
}