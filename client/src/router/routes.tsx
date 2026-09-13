/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";

import { PublicRoute } from "./guards/public-route";
import { ProtectedRoute } from "./guards/protected-route";
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from "./constants/routes";

function PageLoader() {
  return (
    <div className="flex-1 w-full h-full min-h-[300px] flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground animate-pulse">Loading...</p>
      </div>
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

const LandingLayout = lazy(() =>
  import("@/components/layout/landing-layout").then((m) => ({ default: m.LandingLayout }))
);

const AuthLayout = lazy(() =>
  import("@/components/layout/auth-layout").then((m) => ({ default: m.AuthLayout }))
);

const AppLayout = lazy(() =>
  import("@/components/layout/app-layout").then((m) => ({ default: m.AppLayout }))
);

const LandingPage = lazy(() =>
  import("@/pages/landing-page/landing-page").then((m) => ({ default: m.LandingPage }))
);

const FeaturesPage = lazy(() =>
  import("@/pages/landing-page/features-page").then((m) => ({ default: m.FeaturesPage }))
);

const PricingPage = lazy(() =>
  import("@/pages/landing-page/pricing-page").then((m) => ({ default: m.PricingPage }))
);

const AboutPage = lazy(() =>
  import("@/pages/landing-page/about-page").then((m) => ({ default: m.AboutPage }))
);

const ContactPage = lazy(() =>
  import("@/pages/landing-page/contact-page").then((m) => ({ default: m.ContactPage }))
);

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

const CalendarPage = lazy(() =>
  import("@/pages/calendar/calendar-page").then((m) => ({
    default: m.CalendarPage,
  }))
);

const SettingsPage = lazy(() =>
  import("@/pages/settings/settings-page").then((m) => ({
    default: m.SettingsPage,
  }))
);

const NotFoundPage = lazy(() =>
  import("@/pages/not-found/not-found-page").then((m) => ({
    default: m.NotFoundPage,
  }))
);

export const router = createBrowserRouter([
  /* Public invitation acceptance route */
  {
    path: PUBLIC_ROUTES.ACCEPT_INVITE,
    element: withSuspense(<AcceptInvitePage />),
  },
  /* Public-only auth routes (redirects to dashboard if already logged in) */
  {
    element: <PublicRoute />,
    children: [
      {
        element: withSuspense(<AuthLayout />),
        children: [
          {
            path: PUBLIC_ROUTES.REGISTER,
            element: withSuspense(<RegisterPage />),
          },
          {
            path: PUBLIC_ROUTES.LOGIN,
            element: withSuspense(<LoginPage />),
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
        element: withSuspense(<AppLayout />),
        children: [
          {
            path: PRIVATE_ROUTES.DASHBOARD,
            element: withSuspense(<DashboardPage />),
          },
          {
            path: PRIVATE_ROUTES.PROJECTS,
            element: withSuspense(<ProjectPage />),
          },
          {
            path: PRIVATE_ROUTES.PROJECT_DETAIL,
            element: withSuspense(<ProjectDetailPage />),
          },
          {
            path: PRIVATE_ROUTES.TASKS,
            element: withSuspense(<TasksPage />),
          },
          {
            path: PRIVATE_ROUTES.SPRINTS,
            element: withSuspense(<TasksPage />),
          },
          {
            path: PRIVATE_ROUTES.MEMBERS,
            element: withSuspense(<MembersPage />),
          },
          {
            path: PRIVATE_ROUTES.CALENDAR,
            element: withSuspense(<CalendarPage />),
          },
          {
            path: PRIVATE_ROUTES.SETTINGS,
            element: withSuspense(<SettingsPage />),
          },
          {
            path: PUBLIC_ROUTES.NOT_FOUND,
            element: withSuspense(<NotFoundPage />),
          },
        ],
      },

      {
        element: withSuspense(<AuthLayout />),
        children: [
          {
            path: PRIVATE_ROUTES.CREATE_ORGANIZATION,
            element: withSuspense(<CreateOrganizationPage />),
          },
        ],
      },
    ],
  },
  /* Public landing layout & marketing routes */
  {
    path: "/",
    element: withSuspense(<LandingLayout />),
    children: [
      { index: true, element: withSuspense(<LandingPage />) },
      { path: PUBLIC_ROUTES.FEATURES, element: withSuspense(<FeaturesPage />) },
      { path: PUBLIC_ROUTES.PRICING, element: withSuspense(<PricingPage />) },
      { path: PUBLIC_ROUTES.ABOUT, element: withSuspense(<AboutPage />) },
      { path: PUBLIC_ROUTES.CONTACT, element: withSuspense(<ContactPage />) },
    ],
  },
  /* Global catch-all 404 route */
  {
    path: PUBLIC_ROUTES.NOT_FOUND,
    element: withSuspense(<NotFoundPage />),
  },
]);

