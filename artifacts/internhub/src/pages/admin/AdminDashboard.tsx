import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/lib/auth-context";
import { useAdminGetInternships, useAdminGetUsers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { BookOpen, Users, CheckCircle2, TrendingUp, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { authHeaders } = useAuth();

  const { data: internshipsData } = useAdminGetInternships({ request: { headers: authHeaders } });
  const { data: usersData } = useAdminGetUsers({ request: { headers: authHeaders } });

  const internships = internshipsData?.internships ?? [];
  const users = usersData?.users ?? [];

  const totalUsers = users.length;
  const completedUsers = users.filter(u => u.certificateGenerated).length;
  const avgProgress = totalUsers > 0
    ? Math.round(users.reduce((sum, u) => sum + u.progress, 0) / totalUsers)
    : 0;

  const stats = [
    { label: "Total Internships", value: internships.length, icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Total Users", value: totalUsers, icon: Users, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Certificates Issued", value: completedUsers, icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50" },
    { label: "Avg. Progress", value: `${avgProgress}%`, icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <AdminLayout title="Dashboard" breadcrumb="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-card rounded-2xl border p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Internships */}
        <div className="bg-card rounded-2xl border">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-bold text-foreground">Internship Programs</h2>
            <Link href="/admin/internships">
              <Button size="sm" variant="outline" className="rounded-lg text-xs gap-1">
                <Plus className="w-3 h-3" /> Add New
              </Button>
            </Link>
          </div>
          <div className="divide-y">
            {internships.length === 0 && (
              <p className="p-5 text-muted-foreground text-sm">No internships yet.</p>
            )}
            {internships.map(i => (
              <Link key={i.id} href={`/admin/internships/${i.id}`}>
                <a className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group">
                  <div>
                    <p className="font-medium text-sm text-foreground">{i.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{i.field} • {i.taskCount} tasks</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${i.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                      {i.isActive ? "Active" : "Inactive"}
                    </span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent users */}
        <div className="bg-card rounded-2xl border">
          <div className="p-5 border-b flex items-center justify-between">
            <h2 className="font-bold text-foreground">Recent Users</h2>
            <Link href="/admin/users">
              <Button size="sm" variant="outline" className="rounded-lg text-xs">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y">
            {users.length === 0 && (
              <p className="p-5 text-muted-foreground text-sm">No users yet.</p>
            )}
            {users.slice(0, 6).map(u => (
              <div key={u.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.internshipTitle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{Math.round(u.progress)}%</p>
                  {u.certificateGenerated && (
                    <span className="text-xs text-green-600 font-medium">Graduated</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
