import { useSearchParams, useNavigate } from "react-router-dom";
import { Register } from "@/features/auth/components/register";
import { useAcceptInvitation } from "@/features/invitation/hooks/use-accept-invitation";
import { PRIVATE_ROUTES } from "@/router/constants/routes";

function RegisterPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const acceptInvitationMutation = useAcceptInvitation({
    onSuccess: () => {
      navigate(PRIVATE_ROUTES.DASHBOARD);
    },
  });

  const handleSuccess = async (loginResponse: { accessToken: string; hasOrganization: boolean }) => {
    if (token) {
      acceptInvitationMutation.mutate({ token });
      return;
    }

    if (loginResponse.hasOrganization) {
      navigate(PRIVATE_ROUTES.DASHBOARD);
    } else {
      navigate(PRIVATE_ROUTES.CREATE_ORGANIZATION);
    }
  };

  return <Register onSuccess={handleSuccess} />;
}

export { RegisterPage };
