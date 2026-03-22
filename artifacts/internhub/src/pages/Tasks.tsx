import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { useGetTasks, useCompleteTask } from "@workspace/api-client-react";
import type { Task, MCQQuestion } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Lock, CheckCircle2, PlayCircle, Loader2, X, Video,
  AlertCircle, ChevronRight, Music
} from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

function getYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/shorts\/))([^&?/\s]{11})/);
  return match ? match[1] : null;
}

function VideoPlayer({ url, type }: { url: string; type: string }) {
  if (type === "youtube") {
    const videoId = getYouTubeId(url);
    if (!videoId) return <div className="text-destructive text-sm">Invalid YouTube URL</div>;
    return (
      <div className="relative w-full rounded-2xl overflow-hidden bg-black" style={{ paddingTop: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="Task Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (type === "mp4") {
    return (
      <video controls className="w-full rounded-2xl bg-black" style={{ maxHeight: 320 }}>
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }
  if (type === "mp3") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 bg-muted/50 rounded-2xl border">
        <Music className="w-8 h-8 text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Audio Lesson</p>
        <audio controls className="w-full max-w-sm">
          <source src={url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    );
  }
  return null;
}

function MCQSection({
  questions,
  answers,
  onChange,
  wrongAnswers,
  disabled,
}: {
  questions: MCQQuestion[];
  answers: (number | null)[];
  onChange: (qIndex: number, optionIndex: number) => void;
  wrongAnswers: number[];
  disabled: boolean;
}) {
  return (
    <div className="space-y-6">
      {questions.map((q, qi) => {
        const isWrong = wrongAnswers.includes(qi);
        const answered = answers[qi] !== null && answers[qi] !== undefined;
        return (
          <div
            key={qi}
            className={`p-4 rounded-2xl border transition-colors ${isWrong ? "border-destructive/50 bg-destructive/5" : answered ? "border-primary/20 bg-primary/5" : "border-border bg-card"}`}
          >
            <div className="flex items-start gap-2 mb-3">
              <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${isWrong ? "bg-destructive text-white" : "bg-primary text-white"}`}>
                {qi + 1}
              </span>
              <p className="font-semibold text-foreground text-sm leading-snug">{q.question}</p>
            </div>
            <div className="space-y-2 ml-8">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                return (
                  <label
                    key={oi}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer border transition-all ${isSelected ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"} ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`question-${qi}`}
                      value={oi}
                      checked={isSelected}
                      onChange={() => !disabled && onChange(qi, oi)}
                      className="accent-primary w-4 h-4 shrink-0"
                      disabled={disabled}
                    />
                    <span className="text-sm text-foreground">{opt}</span>
                  </label>
                );
              })}
            </div>
            {isWrong && (
              <div className="ml-8 mt-2 flex items-center gap-1.5 text-destructive text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Incorrect — try again
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Tasks() {
  const { user, authHeaders } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);

  const { data, isLoading } = useGetTasks({
    query: { enabled: !!user },
    request: { headers: authHeaders },
  });

  const completeMutation = useCompleteTask({
    mutation: {
      onSuccess: (res) => {
        queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
        queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
        setSelectedTask(null);
        setAnswers([]);
        setWrongAnswers([]);
        if (res.certificateGenerated) {
          triggerConfetti();
          toast({ title: "Internship Completed!", description: "Your certificate is now available." });
        } else {
          toast({ title: "All correct! Task completed.", description: `${res.tasksCompleted} of ${res.totalTasks} days done.` });
        }
      },
      onError: (err: any) => {
        const data = err?.response?.data ?? err;
        if (data?.wrongAnswers && Array.isArray(data.wrongAnswers)) {
          setWrongAnswers(data.wrongAnswers);
          toast({ title: "Some answers are wrong", description: data.message ?? "Review highlighted questions.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: data?.message || "Please try again.", variant: "destructive" });
        }
      },
    },
    request: { headers: authHeaders },
  });

  const triggerConfetti = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#4f46e5", "#06b6d4", "#facc15"];
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const handleTaskClick = (task: Task) => {
    if (task.status === "locked") return;
    setSelectedTask(task);
    const qCount = task.questions?.length ?? 0;
    setAnswers(Array(qCount).fill(null));
    setWrongAnswers([]);
  };

  const handleAnswerChange = (qIndex: number, optionIndex: number) => {
    setAnswers(prev => {
      const copy = [...prev];
      copy[qIndex] = optionIndex;
      return copy;
    });
    setWrongAnswers(prev => prev.filter(i => i !== qIndex));
  };

  const handleSubmit = () => {
    if (!selectedTask) return;
    const questions = selectedTask.questions ?? [];
    const answersPayload = questions.length > 0 ? (answers as number[]) : [];
    completeMutation.mutate({
      taskId: selectedTask.id,
      data: { answers: answersPayload },
    });
  };

  const allAnswered = selectedTask
    ? (selectedTask.questions?.length ?? 0) === 0 || answers.every(a => a !== null)
    : false;

  if (isLoading || !data) {
    return <AppLayout requireAuth><div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout requireAuth>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Your Roadmap</h1>
          <p className="text-muted-foreground mt-2">
            Watch the day's video, answer all quiz questions correctly, and unlock the next task.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.tasks.map((task, idx) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleTaskClick(task)}
              className={`
                relative rounded-3xl p-6 border transition-all duration-300
                ${task.status === "locked" ? "bg-muted/50 border-border/50 cursor-not-allowed opacity-75" : ""}
                ${task.status === "completed" ? "bg-card border-green-200 dark:border-green-900/50 hover:border-green-400/50 cursor-pointer shadow-sm hover:shadow-md" : ""}
                ${task.status === "pending" ? "bg-gradient-to-b from-card to-primary/5 border-primary/30 cursor-pointer shadow-md shadow-primary/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10" : ""}
              `}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`
                  inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-base
                  ${task.status === "locked" ? "bg-muted text-muted-foreground" : ""}
                  ${task.status === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" : ""}
                  ${task.status === "pending" ? "bg-primary text-primary-foreground shadow-inner" : ""}
                `}>
                  {task.dayNumber}
                </div>
                {task.status === "locked" && <Lock className="w-5 h-5 text-muted-foreground" />}
                {task.status === "completed" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {task.status === "pending" && <PlayCircle className="w-6 h-6 text-primary animate-pulse" />}
              </div>

              <h3 className="font-bold text-lg text-foreground line-clamp-2">{task.title}</h3>

              {(task.videoUrl || (task.questions && task.questions.length > 0)) && (
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  {task.videoUrl && (
                    <span className="flex items-center gap-1">
                      {task.videoType === "mp3" ? <Music className="w-3.5 h-3.5" /> : <Video className="w-3.5 h-3.5" />}
                      {task.videoType === "mp3" ? "Audio" : "Video"}
                    </span>
                  )}
                  {task.questions && task.questions.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="font-semibold text-primary">{task.questions.length}</span> Quiz Q
                    </span>
                  )}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border/50">
                <span className={`text-xs font-semibold uppercase tracking-wider
                  ${task.status === "locked" ? "text-muted-foreground" : ""}
                  ${task.status === "completed" ? "text-green-500" : ""}
                  ${task.status === "pending" ? "text-primary" : ""}
                `}>
                  {task.status === "locked" ? "Locked" : task.status === "completed" ? "Completed" : "Today's Task"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTask(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card w-full max-w-2xl max-h-[92vh] rounded-3xl shadow-2xl border flex flex-col relative z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/30 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="bg-primary text-primary-foreground w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                    {selectedTask.dayNumber}
                  </div>
                  <h2 className="text-lg font-bold font-display leading-tight line-clamp-1">{selectedTask.title}</h2>
                </div>
                <button onClick={() => setSelectedTask(null)} className="p-2 rounded-full hover:bg-muted transition-colors ml-2 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Description */}
                <div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{selectedTask.description}</p>
                </div>

                {/* Video */}
                {selectedTask.videoUrl && selectedTask.videoType && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      {selectedTask.videoType === "mp3" ? <Music className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                      {selectedTask.videoType === "mp3" ? "Audio Lesson" : "Video Lesson"}
                    </h3>
                    <VideoPlayer url={selectedTask.videoUrl} type={selectedTask.videoType} />
                  </div>
                )}

                {/* Instructions */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Instructions</h3>
                  <div className="bg-muted/50 p-4 rounded-xl border">
                    <p className="whitespace-pre-line text-sm text-foreground/90 m-0">{selectedTask.instructions}</p>
                  </div>
                </div>

                {/* MCQ Questions */}
                {selectedTask.questions && selectedTask.questions.length > 0 && selectedTask.status !== "completed" && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-primary" />
                      Quiz — Answer All Questions to Complete
                    </h3>
                    <MCQSection
                      questions={selectedTask.questions}
                      answers={answers}
                      onChange={handleAnswerChange}
                      wrongAnswers={wrongAnswers}
                      disabled={completeMutation.isPending}
                    />
                    {!allAnswered && (
                      <p className="text-xs text-muted-foreground mt-3 text-center">
                        Answer all {selectedTask.questions.length} question(s) to unlock the submit button.
                      </p>
                    )}
                  </div>
                )}

                {/* Completed state */}
                {selectedTask.status === "completed" && (
                  <div className="flex items-center gap-3 p-4 rounded-2xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-green-700 dark:text-green-400">Task completed!</p>
                      {selectedTask.completedAt && (
                        <p className="text-xs text-green-600/70 dark:text-green-500/70 mt-0.5">
                          Completed on {new Date(selectedTask.completedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t bg-muted/10 flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setSelectedTask(null)} className="rounded-xl">
                  Close
                </Button>
                {selectedTask.status === "pending" && (
                  <Button
                    onClick={handleSubmit}
                    disabled={completeMutation.isPending || !allAnswered}
                    className="rounded-xl px-6"
                  >
                    {completeMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4 mr-2" /> Submit Answers</>
                    )}
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
