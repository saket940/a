import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Bot, Award, ArrowRight, CheckCircle2, Clock, Users } from "lucide-react";
import { useGetPublicInternships } from "@workspace/api-client-react";
import type { PublicInternship } from "@workspace/api-client-react";

const FIELD_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  "Web Development": { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  "Data Science": { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  "UI/UX Design": { bg: "bg-pink-50 dark:bg-pink-950/30", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-500" },
  "Mobile Development": { bg: "bg-green-50 dark:bg-green-950/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
};

const DEFAULT_IMAGES: Record<string, string> = {
  "Web Development": "https://images.unsplash.com/photo-1547658719-da2b51169166?w=600&q=80&auto=format",
  "Data Science": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80&auto=format",
  "UI/UX Design": "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80&auto=format",
  "Mobile Development": "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&q=80&auto=format",
};

function getFieldColor(field: string) {
  return FIELD_COLORS[field] ?? { bg: "bg-slate-50 dark:bg-slate-900/30", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-500" };
}

function getImage(internship: PublicInternship) {
  if (internship.imageUrl) return internship.imageUrl;
  return DEFAULT_IMAGES[internship.field] ?? `https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80&auto=format`;
}

function InternshipCard({ internship, index }: { internship: PublicInternship; index: number }) {
  const color = getFieldColor(internship.field);
  const image = getImage(internship);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group bg-card rounded-3xl border border-border/50 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={image}
          alt={internship.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&q=80&auto=format`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${color.bg} ${color.text} backdrop-blur-sm border border-white/20`}>
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${color.dot} mr-1.5 align-middle`} />
          {internship.field}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {internship.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
          {internship.description}
        </p>

        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {internship.taskCount} day{internship.taskCount !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Open enrollment
          </span>
        </div>

        <Link href={`/register?internshipId=${internship.id}`}>
          <Button className="w-full mt-4 rounded-2xl group/btn">
            Get Started
            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const { data, isLoading } = useGetPublicInternships();
  const internships = data?.internships ?? [];

  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 z-0">
          <img
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
            alt="Abstract futuristic shapes"
            className="w-full h-full object-cover opacity-15 dark:opacity-5"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/60 to-background" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center rounded-full px-4 py-1.5 mb-8 border border-primary/20 bg-primary/5 text-primary text-sm font-semibold shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
            100% Automated Internship Platform
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="max-w-4xl mx-auto text-5xl lg:text-7xl font-display font-bold tracking-tight text-foreground leading-[1.1]"
          >
            Accelerate your career with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              AI-Driven
            </span>{" "}
            Internships
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto mt-6 text-lg text-muted-foreground"
          >
            Choose your internship path, complete structured daily tasks, and earn a verified certificate — no waiting for approvals.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a href="#programs">
              <Button size="lg" className="h-14 px-8 text-base rounded-2xl shadow-shadow-primary hover:shadow-lg hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto">
                Browse Programs <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-2xl border-2 hover:bg-muted w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-card">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: <Bot className="w-8 h-8 text-primary" />,
                title: "Instant Enrollment",
                desc: "No resumes, no interviews. Pick a program and start immediately."
              },
              {
                icon: <CheckCircle2 className="w-8 h-8 text-secondary" />,
                title: "Daily Tasks",
                desc: "Follow a structured curriculum with daily locked tasks. Submit to unlock the next challenge."
              },
              {
                icon: <Award className="w-8 h-8 text-yellow-500" />,
                title: "Auto-Certification",
                desc: "Reach 100% completion and instantly receive a verifiable PDF certificate."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-background rounded-3xl p-8 border border-border/50 shadow-sm hover:shadow-xl transition-shadow duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-black shadow-md border flex items-center justify-center mb-6 relative z-10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Internship Programs Section */}
      <section id="programs" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center rounded-full px-3 py-1 mb-4 border border-primary/20 bg-primary/5 text-primary text-xs font-semibold"
            >
              Available Programs
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="text-3xl lg:text-4xl font-display font-bold text-foreground"
            >
              Choose your internship path
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-4 text-muted-foreground"
            >
              Each program is a fully structured, day-by-day curriculum designed to take you from beginner to job-ready.
            </motion.p>
          </div>

          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card rounded-3xl border h-80 animate-pulse" />
              ))}
            </div>
          ) : internships.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg font-medium">No programs available yet.</p>
              <p className="text-sm mt-1">Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {internships.map((internship, index) => (
                <InternshipCard key={internship.id} internship={internship} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>
    </AppLayout>
  );
}
