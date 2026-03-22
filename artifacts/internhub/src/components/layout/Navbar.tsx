import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { BookOpen, LogOut, LayoutDashboard, CheckCircle, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = isAuthenticated
    ? [
        { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
        { href: "/tasks", label: "My Tasks", icon: <CheckCircle className="w-4 h-4 mr-2" /> },
        ...(user?.certificateGenerated
          ? [{ href: "/certificate", label: "Certificate", icon: <Award className="w-4 h-4 mr-2 text-yellow-500" /> }]
          : []),
      ]
    : [
        { href: "/", label: "Home", icon: null },
      ];

  return (
    <header className="sticky top-0 z-50 w-full border-b glass-panel">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-foreground">
            Intern<span className="text-primary">Hub</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Sign In
              </Link>
              <Link href="/register">
                <Button className="rounded-xl shadow-shadow-primary hover:-translate-y-0.5 transition-transform duration-200">
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-bold text-foreground leading-none">{user?.name}</span>
                <span className="text-xs text-muted-foreground">{user?.internshipTitle}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={logout}
                className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
