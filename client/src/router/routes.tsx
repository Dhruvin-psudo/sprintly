/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";

import { LandingLayout } from "@/components/layout/landing-layout";
import { AuthLayout } from "@/components/layout/auth-layout";
import { AppLayout } from "@/components/layout/app-layout";
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

const ProjectPage = lazy(() =>
  import("@/pages/project/project-page").then((m) => ({
    default: m.ProjectPage,
  }))
);

const ProjectDetailPage = lazy(() =>
  import("@/pages/project/project-detail-page").then((m) => ({
    default: m.ProjectDetailPage,
  }))
);

const TasksPage = lazy(() =>
  import("@/pages/task/tasks-page").then((m) => ({
    default: m.TasksPage,
  }))
);

const MembersPage = lazy(() =>
  import("@/pages/members/members-page").then((m) => ({
    default: m.MembersPage,
  }))
);

const AcceptInvitePage = lazy(() =>
  import("@/pages/auth/accept-invite-page").then((m) => ({
    default: m.AcceptInvitePage,
  }))
);

export const router = createBrowserRouter([
  /* Public invitation acceptance route */
  {
    path: PUBLIC_ROUTES.ACCEPT_INVITE,
    element: <AcceptInvitePage />,
  },
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
        ],
      },
    ],
  },
  /* Protected routes (requires valid session token) */
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: PRIVATE_ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: PRIVATE_ROUTES.PROJECTS,
            element: <ProjectPage />,
          },
          {
            path: PRIVATE_ROUTES.PROJECT_DETAIL,
            element: <ProjectDetailPage />,
          },
          {
            path: PRIVATE_ROUTES.TASKS,
            element: <TasksPage />,
          },
          {
            path: PRIVATE_ROUTES.SPRINTS,
            element: <TasksPage />,
          },
          {
            path: PRIVATE_ROUTES.MEMBERS,
            element: <MembersPage />,
          },
        ],
      },

      {
        element: <AuthLayout />,
        children: [
          {
            path: PRIVATE_ROUTES.CREATE_ORGANIZATION,
            element: <CreateOrganizationPage />,
          },
        ],
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
