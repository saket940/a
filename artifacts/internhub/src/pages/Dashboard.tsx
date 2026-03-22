import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { useGetTasks } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Target, Trophy, Clock, Code2, ArrowRight, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const { user, authHeaders } = useAuth();
  
  const { data: tasksData, isLoading } = useGetTasks({
    query: { enabled: !!user },
    request: { headers: authHeaders }
  });

  if (isLoading || !user) {
    return <AppLayout requireAuth />;
  }

  const nextTask = tasksData?.tasks.find(t => t.status === 'pending');
  const progressPercent = Math.round(user.progress);
  
  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Welcome back, {user.name.split(' ')[0]} 👋
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center">
              <Code2 className="w-4 h-4 mr-2" />
              {user.internshipTitle} • Started {format(new Date(user.startDate), "MMM d, yyyy")}
            </p>
          </div>
          {user.certificateGenerated && (
            <Link href="/certificate">
              <Button className="rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white shadow-lg border-none">
                <Trophy className="w-4 h-4 mr-2" /> View Certificate
              </Button>
            </Link>
          )}
        </div>

        {/* Progress Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm mb-8"
        >
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" /> 
                Internship Progress
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {user.tasksCompleted} of {user.totalTasks} days completed
              </p>
            </div>
            <div className="text-3xl font-display font-bold text-primary">
              {progressPercent}%
            </div>
          </div>
          
          <div className="h-4 w-full bg-muted rounded-full overflow-hidden relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary rounded-full"
            />
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Next Task Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-6 md:p-8 border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            
            <h3 className="text-lg font-bold flex items-center text-primary mb-4">
              <Clock className="w-5 h-5 mr-2" /> 
              {nextTask ? "Today's Assignment" : "All Caught Up!"}
            </h3>
            
            {nextTask ? (
              <>
                <h4 className="text-2xl font-display font-bold text-foreground mb-2">Day {nextTask.dayNumber}: {nextTask.title}</h4>
                <p className="text-muted-foreground mb-6 line-clamp-2">
                  {nextTask.description}
                </p>
                <Link href="/tasks">
                  <Button className="rounded-xl shadow-shadow-primary hover:-translate-y-0.5 transition-all">
                    Start Task <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </>
            ) : (
              <div className="py-6">
                <h4 className="text-2xl font-display font-bold text-foreground mb-2">
                  {user.certificateGenerated ? "Internship Completed 🎉" : "Pending Next Unlock"}
                </h4>
                <p className="text-muted-foreground mb-6">
                  {user.certificateGenerated 
                    ? "You have successfully completed all tasks and earned your certificate."
                    : "Great job! Your next task will be available soon."}
                </p>
                <Link href="/tasks">
                  <Button variant="outline" className="rounded-xl">
                    Review Past Tasks
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="bg-card rounded-3xl p-6 border shadow-sm flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Field of Study</p>
              <p className="text-lg font-bold text-foreground leading-tight">{user.internshipField}</p>
            </div>
            <div className="bg-card rounded-3xl p-6 border shadow-sm flex-1 flex flex-col justify-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
              <div className="flex items-center mt-1">
                {user.certificateGenerated ? (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/20 text-success-foreground">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Graduated
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2" /> Active
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
