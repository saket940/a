import { useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/lib/auth-context";
import {
  useAdminGetInternship,
  useAdminUpdateInternship,
  useAdminCreateTaskTemplate,
  useAdminUpdateTaskTemplate,
  useAdminDeleteTaskTemplate,
} from "@workspace/api-client-react";
import type { AdminTaskTemplate, MCQQuestion, AdminCreateTaskTemplateRequestVideoType } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Plus, Trash2, Pencil, Save, Loader2, X, GripVertical, ImagePlus, Video, HelpCircle, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TaskFormData {
  dayNumber: string;
  title: string;
  description: string;
  instructions: string;
  videoUrl: string;
  videoType: string;
  questions: MCQQuestion[];
}

const emptyTaskForm: TaskFormData = {
  dayNumber: "", title: "", description: "", instructions: "",
  videoUrl: "", videoType: "youtube", questions: [],
};

function MCQBuilder({ questions, onChange }: {
  questions: MCQQuestion[];
  onChange: (q: MCQQuestion[]) => void;
}) {
  const addQuestion = () => {
    onChange([...questions, { question: "", options: ["", ""], correctIndex: 0 }]);
  };
  const removeQuestion = (qi: number) => onChange(questions.filter((_, i) => i !== qi));
  const updateQuestion = (qi: number, field: keyof MCQQuestion, value: unknown) => {
    onChange(questions.map((q, i) => i === qi ? { ...q, [field]: value } : q));
  };
  const addOption = (qi: number) => {
    const updated = [...questions];
    updated[qi] = { ...updated[qi], options: [...updated[qi].options, ""] };
    onChange(updated);
  };
  const removeOption = (qi: number, oi: number) => {
    const updated = [...questions];
    const opts = updated[qi].options.filter((_, i) => i !== oi);
    const correctIndex = updated[qi].correctIndex >= opts.length ? 0 : updated[qi].correctIndex;
    updated[qi] = { ...updated[qi], options: opts, correctIndex };
    onChange(updated);
  };
  const updateOption = (qi: number, oi: number, value: string) => {
    const updated = [...questions];
    const opts = [...updated[qi].options];
    opts[oi] = value;
    updated[qi] = { ...updated[qi], options: opts };
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {questions.map((q, qi) => (
        <div key={qi} className="p-4 rounded-xl border bg-background space-y-3">
          <div className="flex items-start gap-2">
            <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-2">{qi + 1}</span>
            <div className="flex-1">
              <input
                value={q.question}
                onChange={e => updateQuestion(qi, "question", e.target.value)}
                placeholder="Enter question text..."
                className="w-full px-3 py-2 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <button type="button" onClick={() => removeQuestion(qi)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="ml-8 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">Answer options (select the correct one):</p>
            {q.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${qi}`}
                  checked={q.correctIndex === oi}
                  onChange={() => updateQuestion(qi, "correctIndex", oi)}
                  className="accent-primary w-4 h-4 shrink-0"
                  title="Mark as correct answer"
                />
                <input
                  value={opt}
                  onChange={e => updateOption(qi, oi, e.target.value)}
                  placeholder={`Option ${oi + 1}…`}
                  className="flex-1 px-3 py-1.5 rounded-lg border bg-muted/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                {q.options.length > 2 && (
                  <button type="button" onClick={() => removeOption(qi, oi)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => addOption(qi)} className="text-xs text-primary hover:underline font-medium">
              + Add option
            </button>
            <p className="text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded-full bg-primary mr-1 align-middle" />
              Radio button = correct answer
            </p>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/30 text-primary text-sm font-medium hover:bg-primary/5 hover:border-primary/50 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Add MCQ Question
      </button>
    </div>
  );
}

export default function AdminInternshipDetail() {
  const [, params] = useRoute("/admin/internships/:id");
  const internshipId = parseInt(params?.id ?? "0", 10);
  const { authHeaders, token } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editingInternship, setEditingInternship] = useState(false);
  const [internshipForm, setInternshipForm] = useState({ title: "", field: "", description: "", imageUrl: "", isActive: true });
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskFormData>(emptyTaskForm);
  const [editingTask, setEditingTask] = useState<AdminTaskTemplate | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const { data, isLoading } = useAdminGetInternship(
    internshipId,
    { request: { headers: authHeaders } }
  );

  const invalidate = () => queryClient.invalidateQueries();

  const updateInternshipMutation = useAdminUpdateInternship({
    mutation: {
      onSuccess: () => { invalidate(); setEditingInternship(false); toast({ title: "Internship updated!" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    },
    request: { headers: authHeaders },
  });

  const createTaskMutation = useAdminCreateTaskTemplate({
    mutation: {
      onSuccess: () => { invalidate(); setShowTaskForm(false); setTaskForm(emptyTaskForm); setEditingTask(null); toast({ title: "Task added!" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    },
    request: { headers: authHeaders },
  });

  const updateTaskMutation = useAdminUpdateTaskTemplate({
    mutation: {
      onSuccess: () => { invalidate(); setShowTaskForm(false); setTaskForm(emptyTaskForm); setEditingTask(null); toast({ title: "Task updated!" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    },
    request: { headers: authHeaders },
  });

  const deleteTaskMutation = useAdminDeleteTaskTemplate({
    mutation: {
      onSuccess: () => { invalidate(); setDeletingTaskId(null); toast({ title: "Task deleted!" }); },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    },
    request: { headers: authHeaders },
  });

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/uploads/image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { imageUrl } = await res.json();
      setInternshipForm(f => ({ ...f, imageUrl }));
      setPreviewUrl(imageUrl);
      toast({ title: "Image uploaded!" });
    } catch {
      toast({ title: "Upload failed", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleEditInternship = () => {
    if (!data) return;
    setInternshipForm({ title: data.title, field: data.field, description: data.description, imageUrl: data.imageUrl ?? "", isActive: data.isActive });
    setPreviewUrl(data.imageUrl ?? "");
    setEditingInternship(true);
  };

  const handleSaveInternship = (e: React.FormEvent) => {
    e.preventDefault();
    updateInternshipMutation.mutate({ internshipId, data: { ...internshipForm, imageUrl: internshipForm.imageUrl || null } });
  };

  const handleEditTask = (task: AdminTaskTemplate) => {
    setEditingTask(task);
    setTaskForm({
      dayNumber: String(task.dayNumber),
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      videoUrl: task.videoUrl ?? "",
      videoType: task.videoType ?? "youtube",
      questions: task.questions ?? [],
    });
    setShowTaskForm(true);
  };

  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validQuestions = taskForm.questions.filter(q => q.question.trim() && q.options.every(o => o.trim()));
    const payload = {
      dayNumber: Number(taskForm.dayNumber),
      title: taskForm.title,
      description: taskForm.description,
      instructions: taskForm.instructions,
      videoUrl: taskForm.videoUrl.trim() || null,
      videoType: (taskForm.videoUrl.trim() ? taskForm.videoType : null) as AdminCreateTaskTemplateRequestVideoType | null,
      questions: validQuestions.length > 0 ? validQuestions : null,
    };
    if (editingTask) {
      updateTaskMutation.mutate({ taskTemplateId: editingTask.id, data: payload });
    } else {
      createTaskMutation.mutate({ internshipId, data: payload });
    }
  };

  const closeTaskForm = () => { setShowTaskForm(false); setEditingTask(null); setTaskForm(emptyTaskForm); };

  if (isLoading || !data) {
    return (
      <AdminLayout breadcrumb="Internship Detail">
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumb={data.title}>
      {/* Internship Header */}
      <div className="bg-card rounded-2xl border p-6 mb-6">
        {editingInternship ? (
          <form onSubmit={handleSaveInternship} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Cover Image</label>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden h-32 bg-muted">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setPreviewUrl(""); setInternshipForm(f => ({ ...f, imageUrl: "" })); }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="w-full h-24 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                  {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
                  <span className="text-sm">{uploading ? "Uploading…" : "Upload cover image"}</span>
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold mb-1.5">Title</label><input value={internshipForm.title} onChange={e => setInternshipForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required /></div>
              <div><label className="block text-sm font-semibold mb-1.5">Field</label><input value={internshipForm.field} onChange={e => setInternshipForm(f => ({ ...f, field: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required /></div>
            </div>
            <div><label className="block text-sm font-semibold mb-1.5">Description</label><textarea value={internshipForm.description} onChange={e => setInternshipForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" required /></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="editActive" checked={internshipForm.isActive} onChange={e => setInternshipForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-primary" /><label htmlFor="editActive" className="text-sm font-medium">Active</label></div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setEditingInternship(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" disabled={updateInternshipMutation.isPending || uploading} className="rounded-xl gap-2">
                {updateInternshipMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-4">
            {data.imageUrl && <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0"><img src={data.imageUrl} alt={data.title} className="w-full h-full object-cover" /></div>}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl font-bold text-foreground">{data.title}</h1>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${data.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>{data.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{data.field} • {data.tasks.length} tasks</p>
                  <p className="text-sm text-foreground/80 mt-2">{data.description}</p>
                </div>
                <Button variant="outline" onClick={handleEditInternship} className="rounded-xl gap-2 shrink-0"><Pencil className="w-4 h-4" /> Edit</Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tasks */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">Task Templates <span className="text-muted-foreground font-normal text-base">({data.tasks.length})</span></h2>
        <Button onClick={() => { setEditingTask(null); setTaskForm(emptyTaskForm); setShowTaskForm(true); }} className="rounded-xl gap-2" size="sm">
          <Plus className="w-4 h-4" /> Add Task
        </Button>
      </div>

      {data.tasks.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border text-muted-foreground">
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm mt-1">Add your first task template to this internship.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...data.tasks].sort((a, b) => a.dayNumber - b.dayNumber).map(task => (
            <div key={task.id} className="bg-card rounded-xl border p-4 flex items-start gap-4 group hover:shadow-sm transition-all">
              <GripVertical className="w-4 h-4 text-muted-foreground mt-1 shrink-0 opacity-40" />
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-sm shrink-0">
                {task.dayNumber}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm">{task.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                  {task.videoUrl && (
                    <span className="flex items-center gap-1">
                      {task.videoType === "mp3" ? <Music className="w-3 h-3" /> : <Video className="w-3 h-3" />}
                      {task.videoType === "mp3" ? "Audio" : "Video"}
                    </span>
                  )}
                  {task.questions && task.questions.length > 0 && (
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {task.questions.length} MCQ{task.questions.length !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditTask(task)} className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeletingTaskId(task.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeTaskForm} />
          <div className="relative z-10 bg-card w-full max-w-2xl rounded-2xl border shadow-xl flex flex-col max-h-[94vh]">
            <div className="p-5 border-b flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold">{editingTask ? "Edit Task" : "Add Task"}</h2>
              <button onClick={closeTaskForm} className="p-1 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTaskSubmit} className="overflow-y-auto flex-1 p-5 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Day Number</label>
                  <input type="number" min="1" value={taskForm.dayNumber} onChange={e => setTaskForm(f => ({ ...f, dayNumber: e.target.value }))} placeholder="e.g. 1" className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Title</label>
                  <input value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} placeholder="Task title…" className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" required />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Instructions</label>
                <textarea value={taskForm.instructions} onChange={e => setTaskForm(f => ({ ...f, instructions: e.target.value }))} rows={4} className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" required />
              </div>

              {/* Video Section */}
              <div className="p-4 rounded-xl bg-muted/40 border space-y-3">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  <label className="text-sm font-semibold">Video / Audio (optional)</label>
                </div>
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <input
                      value={taskForm.videoUrl}
                      onChange={e => setTaskForm(f => ({ ...f, videoUrl: e.target.value }))}
                      placeholder="YouTube URL, MP4 link, or MP3 link…"
                      className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                  <div>
                    <select
                      value={taskForm.videoType}
                      onChange={e => setTaskForm(f => ({ ...f, videoType: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="mp4">MP4 Video</option>
                      <option value="mp3">MP3 Audio</option>
                    </select>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">For YouTube, paste the full URL (e.g. https://youtube.com/watch?v=…)</p>
              </div>

              {/* MCQ Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  <label className="text-sm font-semibold">Quiz Questions (MCQ)</label>
                  <span className="text-xs text-muted-foreground ml-1">— user must answer all correctly to complete task</span>
                </div>
                <MCQBuilder
                  questions={taskForm.questions}
                  onChange={q => setTaskForm(f => ({ ...f, questions: q }))}
                />
              </div>

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-card pb-1">
                <Button type="button" variant="outline" onClick={closeTaskForm} className="flex-1 rounded-xl">Cancel</Button>
                <Button type="submit" disabled={createTaskMutation.isPending || updateTaskMutation.isPending} className="flex-1 rounded-xl">
                  {(createTaskMutation.isPending || updateTaskMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : editingTask ? "Save Changes" : "Add Task"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation */}
      {deletingTaskId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeletingTaskId(null)} />
          <div className="relative z-10 bg-card w-full max-w-sm rounded-2xl border shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="w-6 h-6 text-destructive" /></div>
            <h3 className="text-lg font-bold mb-2">Delete Task?</h3>
            <p className="text-muted-foreground text-sm mb-6">This task template will be permanently removed.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeletingTaskId(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button variant="destructive" disabled={deleteTaskMutation.isPending} onClick={() => deleteTaskMutation.mutate({ taskTemplateId: deletingTaskId })} className="flex-1 rounded-xl">
                {deleteTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
