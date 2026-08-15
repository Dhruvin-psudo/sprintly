import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { IRegisterRequest } from "../types";
import { register, login } from "@/api/services/auth.api";
import { setAccessToken } from "@/api";
import { PRIVATE_ROUTES } from "@/router/constants/routes";
import { toast } from "sonner";
import axios from "axios";

export function useRegister(options?: {
    onSuccess?: (loginResponse: { accessToken: string; hasOrganization: boolean }) => void;
}) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient()
    const inviteToken = searchParams.get('inviteToken') || searchParams.get('token');

    return useMutation({
        mutationFn: (data: IRegisterRequest) => register(data),
        onSuccess: async (_response, variables) => {
            try {
                // Auto-login: fire login request with the same credentials
                const loginResponse = await login({
                    email: variables.email,
                    password: variables.passwordHash,
                });

                setAccessToken(loginResponse.accessToken);
                queryClient.invalidateQueries({ queryKey: ['user', 'me'] });

                if (options?.onSuccess) {
                    options.onSuccess(loginResponse);
                } else if (inviteToken) {
                    navigate(`${PRIVATE_ROUTES.DASHBOARD}?inviteToken=${inviteToken}`);
                } else if (loginResponse.hasOrganization) {
                    navigate(PRIVATE_ROUTES.DASHBOARD);
                } else {
                    navigate(PRIVATE_ROUTES.CREATE_ORGANIZATION);
                }

                toast.success('Account created successfully');
            } catch {
                // If auto-login fails, still notify success and let user login manually
                toast.success('Account created. Please login to continue.');
                navigate('/login');
            }
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