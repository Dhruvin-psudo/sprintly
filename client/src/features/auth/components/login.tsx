import { useLogin } from "@/features/auth/hooks/use-login";
import { LoginForm, type LoginFormValues } from "@/features/auth/forms/login-form";

export function Login() {
    const loginMutation = useLogin()

    function handleLogin(data: LoginFormValues) {
        loginMutation.mutate(data)
    }

    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground">
                    Enter your credentials to access your account
                </p>
            </div>

            <LoginForm onSubmit={handleLogin} />
        </div>
    );
}
