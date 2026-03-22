import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Clock, ChevronDown, X } from "lucide-react";
import { useGetPublicInternships } from "@workspace/api-client-react";
import type { PublicInternship } from "@workspace/api-client-react";

export default function Register() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const { login } = useAuth();
  const { toast } = useToast();

  const params = new URLSearchParams(search);
  const preselectedId = params.get("internshipId") ? Number(params.get("internshipId")) : null;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedInternship, setSelectedInternship] = useState<PublicInternship | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data } = useGetPublicInternships();
  const internships = data?.internships ?? [];

  useEffect(() => {
    if (preselectedId && internships.length > 0) {
      const found = internships.find(i => i.id === preselectedId);
      if (found) setSelectedInternship(found);
    }
  }, [preselectedId, internships]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship) {
      toast({ title: "Please select an internship", description: "You must choose a program to continue.", variant: "destructive" });
      return;
    }
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name, email, password,
          ...(selectedInternship ? { internshipId: selectedInternship.id } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Registration failed", description: data.message || "Something went wrong.", variant: "destructive" });
        return;
      }
      login(data.token, data.user);
      toast({
        title: "Welcome to InternHub!",
        description: `You've been enrolled in ${data.user.internshipTitle}.`,
      });
      setLocation("/dashboard");
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center py-12 px-4 bg-gradient-to-b from-background to-muted/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="mx-auto w-full max-w-md"
        >
          <div className="bg-card py-10 px-8 shadow-xl rounded-3xl border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-display font-bold text-foreground">Create account</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Start your internship journey today
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Internship Picker */}
              <div>
                <Label className="mb-1.5 block">Internship Program <span className="text-destructive">*</span></Label>
                {selectedInternship ? (
                  <div className="flex items-start gap-3 p-3 rounded-xl border bg-primary/5 border-primary/30">
                    {selectedInternship.imageUrl && (
                      <img src={selectedInternship.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground leading-tight">{selectedInternship.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {selectedInternship.taskCount} days
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button type="button" onClick={() => setShowPicker(true)} className="p-1 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setSelectedInternship(null)} className="p-1 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border bg-background text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all"
                  >
                    <span>Select an internship program…</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
                {!selectedInternship && (
                  <p className="text-xs text-destructive/80 mt-1.5 ml-1 font-medium">
                    Required — please select an internship program to register.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-12 rounded-xl bg-background"
                  placeholder="Jane Doe"
                  minLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-background"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="h-12 rounded-xl bg-background"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-xl text-base shadow-shadow-primary hover:-translate-y-0.5 transition-all duration-200 mt-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Internship Picker Modal */}
      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPicker(false)} />
          <div className="relative z-10 bg-card w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden">
            <div className="p-5 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">Choose a program</h3>
              <button onClick={() => setShowPicker(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-3 max-h-96 overflow-y-auto space-y-2">
              {internships.length === 0 && (
                <p className="text-center text-muted-foreground py-8 text-sm">No programs available yet.</p>
              )}
              {internships.map(i => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => { setSelectedInternship(i); setShowPicker(false); }}
                  className={`w-full flex items-start gap-3 p-3 rounded-2xl border text-left hover:bg-muted/60 transition-all ${selectedInternship?.id === i.id ? "border-primary/50 bg-primary/5" : "border-transparent"}`}
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img
                      src={i.imageUrl ?? `https://images.unsplash.com/photo-1547658719-da2b51169166?w=200&q=80&auto=format`}
                      alt={i.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200&q=80&auto=format"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-foreground leading-tight">{i.title}</p>
                      {selectedInternship?.id === i.id && <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{i.field} · {i.taskCount} day{i.taskCount !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{i.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
