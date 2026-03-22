import React from "react";
import { Navbar } from "./Navbar";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export function AppLayout({ children, requireAuth = false }: { children: React.ReactNode, requireAuth?: boolean }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (requireAuth && isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Auth guard is handled at page level or router level usually, 
  // but we can handle basic redirect here if required.
  if (requireAuth && !isAuthenticated && !isLoading) {
    window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20 selection:text-primary">
      <Navbar />
      <main className="flex-1 w-full relative">
        {children}
      </main>
    </div>
  );
}
