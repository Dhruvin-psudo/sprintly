import { Outlet } from "react-router-dom";
import { LandingNavbar } from "@/components/layout/navbar";
import { LandingFooter } from "@/components/layout/footer";

export function LandingLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      <LandingNavbar />

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <LandingFooter />
    </div>
  );
}
