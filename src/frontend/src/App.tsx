import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { BarChart3, Loader2, LogIn } from "lucide-react";
import { KRATable } from "./components/KRATable";
import { KeyMetricsSidebar } from "./components/KeyMetricsSidebar";
import { Navbar } from "./components/Navbar";
import { ProfileSetup } from "./components/ProfileSetup";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile, useIsAdmin } from "./hooks/useQueries";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <BarChart3 size={18} className="text-primary-foreground" />
        </div>
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading KRAFlow...</p>
      </div>
    </div>
  );
}

function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm">
        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto">
          <BarChart3 size={28} className="text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">KRAFlow</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Track your Key Result Areas — daily, monthly, and quarterly.
          </p>
        </div>
        <Button
          data-ocid="login.primary_button"
          onClick={login}
          disabled={isLoggingIn}
          size="lg"
          className="w-full"
        >
          {isLoggingIn ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogIn className="mr-2 h-4 w-4" />
          )}
          {isLoggingIn ? "Connecting..." : "Sign In"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Powered by Internet Identity — secure, decentralized login.
        </p>
      </div>
    </div>
  );
}

function MainApp() {
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { data: isAdmin = false } = useIsAdmin();

  if (profileLoading) return <LoadingScreen />;
  if (!profile || !profile.name) return <ProfileSetup />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar profile={profile} />
      <main className="pt-14">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          {/* Page header */}
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Task Tracking Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Manage daily, monthly, and quarterly performance objectives
            </p>
          </header>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Main table */}
            <KRATable isAdmin={isAdmin} />

            {/* Sidebar */}
            <KeyMetricsSidebar />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-5 text-xs text-muted-foreground border-t border-border mt-8">
        © {new Date().getFullYear()} KRAFlow. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors underline"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorLoading } = useActor();

  if (isInitializing || actorLoading) return <LoadingScreen />;
  if (!identity) return <LoginScreen />;

  return (
    <>
      <MainApp />
      <Toaster richColors position="top-right" />
    </>
  );
}
