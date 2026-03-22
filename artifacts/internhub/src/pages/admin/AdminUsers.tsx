import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/lib/auth-context";
import { useAdminGetUsers } from "@workspace/api-client-react";
import { Loader2, Users, Trophy, TrendingUp } from "lucide-react";

export default function AdminUsers() {
  const { authHeaders } = useAuth();
  const { data, isLoading } = useAdminGetUsers({ request: { headers: authHeaders } });

  const users = data?.users ?? [];

  return (
    <AdminLayout title="All Users" breadcrumb="Users">
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No users yet</p>
        </div>
      ) : (
        <>
          <p className="text-muted-foreground text-sm mb-4">{users.length} registered users</p>
          <div className="bg-card rounded-2xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">User</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Internship</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Progress</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Tasks</th>
                  <th className="text-left px-5 py-3 font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{u.internshipTitle}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${u.progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-foreground">{Math.round(u.progress)}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> {u.tasksCompleted}/{u.totalTasks}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {u.certificateGenerated ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
                          <Trophy className="w-3 h-3" /> Graduated
                        </span>
                      ) : u.progress > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          In Progress
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                          Not Started
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
