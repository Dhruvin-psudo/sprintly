import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import type { IRegisterRequest } from "../types";
import { register } from "@/api/services/auth.api";
import { setAccessToken } from "@/api";
import { PUBLIC_ROUTES } from "@/router/constants/routes";
import { toast } from "sonner";
import axios from "axios";

export function useRegister() {
    const navigate = useNavigate();
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: IRegisterRequest) => register(data),
        onSuccess: (response) => {
            setAccessToken(response.accessToken);
            queryClient.invalidateQueries({ queryKey: ['user', 'me']});
            navigate(PUBLIC_ROUTES.CREATE_ORGANIZATION);
            toast.success('Account created successfully. Please create your organization.')
        },
        onError: (error: unknown) => {
            if(axios.isAxiosError(error)) {
                const message = error.response?.data?.message ?? 'Registered failed';
                toast.error(Array.isArray(message) ? message[0] : message);
            } else {
                toast.error('Registered failed');
            }
        }
    })
}