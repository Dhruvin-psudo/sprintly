import { useRegister } from "@/features/auth/hooks/use-register";
import { RegisterForm, type RegisterFormValues } from "@/features/auth/forms/register-form";

export function Register() {
  const registerMutation = useRegister()

  function handleRegister(data: RegisterFormValues) {
    registerMutation.mutate(data)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Get started with Sprintly — it&apos;s free
        </p>
      </div>

      <RegisterForm onSubmit={handleRegister} />
    </div>
  );
}
