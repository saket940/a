import { useAuth } from "@/lib/auth-context";
import { useLocation, Link } from "wouter";
import { useEffect } from "react";
import { Shield, LayoutDashboard, BookOpen, Users, LogOut, ChevronRight } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumb?: string;
}

export function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/admin/login");
    }
  }, [user, navigate]);

  if (!user || !user.isAdmin) return null;

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/internships", label: "Internships", icon: BookOpen },
    { href: "/admin/users", label: "Users", icon: Users },
  ];

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col shrink-0">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground">InternHub</p>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}>
                <a className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="px-4 py-2 mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Logged in as</p>
            <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-card px-8 py-4 flex items-center gap-2 text-sm text-muted-foreground">
          <span>Admin</span>
          {breadcrumb && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-foreground font-medium">{breadcrumb}</span>
            </>
          )}
        </div>
        <div className="p-8">
          {title && <h1 className="text-2xl font-bold text-foreground mb-6">{title}</h1>}
          {children}
        </div>
      </main>
    </div>
  );
}
