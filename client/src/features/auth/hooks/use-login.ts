import { useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ILoginRequest } from "../types";
import { login } from "@/api/services/auth.api";
import { setAccessToken } from "@/api";
import { toast } from "sonner";
import axios from "axios";
import { PRIVATE_ROUTES } from "@/router/constants/routes";

export function useLogin() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

    const inviteToken = searchParams.get('inviteToken') || searchParams.get('token');

    return useMutation({
        mutationFn: (data: ILoginRequest) => login(data),
        onSuccess: (response) => {
            setAccessToken(response.accessToken)
            queryClient.invalidateQueries({ queryKey: ['user', 'me'] })

            if (inviteToken) {
                navigate(`${PRIVATE_ROUTES.DASHBOARD}?inviteToken=${inviteToken}`)
            } else if (response.hasOrganization) {
                navigate(PRIVATE_ROUTES.DASHBOARD)
            } else {
                navigate(PRIVATE_ROUTES.CREATE_ORGANIZATION)
            }

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