import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import {
  FileQuestion,
  ArrowLeft,
  LayoutDashboard,
  Home,
  LogIn
} from "lucide-react";
import type { NotFoundViewProps } from "../types";

export function NotFoundView({
  isAuthenticated,
  onGoBack,
  onNavigateHome,
  onNavigateDashboard,
  onNavigateLogin,
}: NotFoundViewProps) {

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6 sm:p-12 text-center select-none">
      {/* Top Brand Logo for Unauthenticated Standalone Mode */}
      {!isAuthenticated && (
        <div className="mb-8">
          <BrandLogo />
        </div>
      )}

      {/* Main 404 Visual Content Card */}
      <div className="w-full max-w-2xl bg-card/60 backdrop-blur-xl border border-border/80 rounded-2xl p-8 sm:p-12 shadow-sm space-y-8">
        {/* Decorative 404 Icon & Badge */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative flex items-center justify-center size-20 rounded-2xl bg-gradient-brand/10 border border-primary/20 text-primary">
            <FileQuestion className="size-10" />
            <div className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-primary animate-ping" />
          </div>

          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            404 PAGE NOT FOUND
          </div>
        </div>

        {/* Text Content */}
        <div className="space-y-3 max-w-md mx-auto">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Lost in space?
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The page you are looking for doesn’t exist, was removed, or the URL might be mistyped.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {isAuthenticated ? (
            <Button
              onClick={onNavigateDashboard}
              className="gap-2 px-5 h-10 bg-primary hover:bg-primary/90 font-medium text-white"
            >
              <LayoutDashboard className="size-4" />
              <span>Go to Dashboard</span>
            </Button>
          ) : (
            <Button
              onClick={onNavigateHome}
              className="gap-2 px-5 h-10 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              <Home className="size-4" />
              <span>Back to Home</span>
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onGoBack}
            className="gap-2 px-5 h-10 border-border hover:bg-accent font-medium"
          >
            <ArrowLeft className="size-4" />
            <span>Go Back</span>
          </Button>

          {!isAuthenticated && (
            <Button
              variant="secondary"
              onClick={onNavigateLogin}
              className="gap-2 px-5 h-10 rounded-lg cursor-pointer text-sm font-medium"
            >
              <LogIn className="size-4" />
              <span>Log In</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
