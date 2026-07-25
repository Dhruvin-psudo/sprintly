import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import { LandingLayout } from "@/components/layout/landing-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { LandingPage } from "@/pages/landing-page/landing-page";
import { PublicRoute } from "./guards/public-route";
import { ProtectedRoute } from "./guards/protected-route";
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from "./constants/routes";

const LoginPage = lazy(() =>
  import("@/pages/auth/login-page").then((m) => ({ default: m.LoginPage }))
);

const RegisterPage = lazy(() =>
  import("@/pages/auth/register-page").then((m) => ({ default: m.RegisterPage }))
);

const CreateOrganizationPage = lazy(() =>
  import("@/pages/organization/create-organization-page").then((m) => ({
    default: m.CreateOrganizationPage,
  }))
);

const DashboardPage = lazy(() =>
  import("@/pages/dashboard/dashboard-page").then((m) => ({
    default: m.DashboardPage,
  }))
);

export const router = createBrowserRouter([
  /* Public-only auth routes (redirects to dashboard if already logged in) */
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: PUBLIC_ROUTES.REGISTER,
            element: <RegisterPage />,
          },
          {
            path: PUBLIC_ROUTES.LOGIN,
            element: <LoginPage />,
          },
          {
            path: PUBLIC_ROUTES.CREATE_ORGANIZATION,
            element: <CreateOrganizationPage />,
          },
        ],
      },
    ],
  },
  /* Protected routes (requires valid session token) */
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: PRIVATE_ROUTES.DASHBOARD,
        element: <DashboardPage />,
      },
    ],
  },
  /* Public landing page */
  {
    path: "/",
    element: <LandingLayout />,
    children: [{ index: true, element: <LandingPage /> }],
  },
]);
