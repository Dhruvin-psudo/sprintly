import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from "@/router/constants/routes";
import { getAccessToken } from "@/api";
import { useVerifyInvitation } from "@/features/invitation/hooks/use-verify-invitation";

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const {
    invitation: inviteDetails,
  } = useVerifyInvitation(token, !!token && !getAccessToken());

  useEffect(() => {
    if (!token) {
      navigate(PUBLIC_ROUTES.LOGIN, { replace: true });
      return;
    }

    if (getAccessToken()) {
      navigate(`${PRIVATE_ROUTES.DASHBOARD}?inviteToken=${encodeURIComponent(token)}`, { replace: true });
      return;
    }

    if (inviteDetails) {
      if (inviteDetails.isRegistered) {
        navigate(`${PUBLIC_ROUTES.LOGIN}?token=${encodeURIComponent(token)}`, { replace: true });
      } else {
        navigate(`${PUBLIC_ROUTES.REGISTER}?token=${encodeURIComponent(token)}`, { replace: true });
      }
    }
  }, [token, inviteDetails, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md text-center py-8">
        <CardContent className="space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Verifying your invitation...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
