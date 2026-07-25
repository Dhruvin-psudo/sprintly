import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ILoginRequest } from "../types";
import { login } from "@/api/services/auth.api";
import { setAccessToken } from "@/api";
import { toast } from "sonner";
import axios from "axios";
import { PRIVATE_ROUTES } from "@/router/constants/routes";

export function useLogin() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ILoginRequest) => login(data),
        onSuccess: (response) => {
            setAccessToken(response.accessToken)
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] })
            navigate(PRIVATE_ROUTES.DASHBOARD)
            toast.success('Login successful')
        },
        onError: (error: unknown) => {
            if (axios.isAxiosError(error)){
                const message = error.response?.data?.message ?? 'Login failed';
                toast.error(Array.isArray(message) ? message[0] : message)
            } else {
                toast.error('Login failed')
            }
        }
    })
}