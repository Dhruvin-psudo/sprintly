import { useNavigate } from "react-router-dom";
import { getAccessToken } from "@/api";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "@/router/constants/routes";
import { NotFoundView } from "./components/not-found-view";

export function NotFoundContainer() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(getAccessToken());

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleNavigateHome = () => {
    navigate(PUBLIC_ROUTES.FEATURES);
  };

  const handleNavigateDashboard = () => {
    navigate(PRIVATE_ROUTES.DASHBOARD);
  };

  const handleNavigateLogin = () => {
    navigate(PUBLIC_ROUTES.LOGIN);
  };

  return (
    <NotFoundView
      isAuthenticated={isAuthenticated}
      onGoBack={handleGoBack}
      onNavigateHome={handleNavigateHome}
      onNavigateDashboard={handleNavigateDashboard}
      onNavigateLogin={handleNavigateLogin}
    />
  );
}
