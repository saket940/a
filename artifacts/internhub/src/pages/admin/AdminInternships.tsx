import { useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuth } from "@/lib/auth-context";
import {
  useAdminGetInternships,
  useAdminCreateInternship,
  useAdminDeleteInternship,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, Trash2, Pencil, BookOpen, ArrowRight, Loader2, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface InternshipFormData {
  title: string;
  field: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
}

const emptyForm: InternshipFormData = { title: "", field: "", description: "", imageUrl: "", isActive: true };

export default function AdminInternships() {
  const { authHeaders, token } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<InternshipFormData>(emptyForm);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const { data, isLoading } = useAdminGetInternships({ request: { headers: authHeaders } });

  const createMutation = useAdminCreateInternship({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/internships"] });
        setShowForm(false);
        setForm(emptyForm);
        setPreviewUrl("");
        toast({ title: "Internship created!", description: "You can now add tasks to it." });
      },
      onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
    },
    request: { headers: authHeaders },
  });

  const deleteMutation = useAdminDeleteInternship({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/admin/internships"] });
        setDeletingId(null);
        toast({ title: "Internship deleted" });
      },
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
      setForm(f => ({ ...f, imageUrl }));
      setPreviewUrl(imageUrl);
      toast({ title: "Image uploaded!" });
    } catch {
      toast({ title: "Upload failed", description: "Please try a smaller image.", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { ...form, imageUrl: form.imageUrl || null } });
  };

  const internships = data?.internships ?? [];

  return (
    <AdminLayout title="Internship Programs" breadcrumb="Internships">
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground text-sm">{internships.length} programs configured</p>
        <Button onClick={() => setShowForm(true)} className="rounded-xl gap-2">
          <Plus className="w-4 h-4" /> Add Internship
        </Button>
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative z-10 bg-card w-full max-w-lg rounded-2xl border shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">New Internship Program</h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold mb-1.5">Cover Image</label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }}
                />
                {previewUrl ? (
                  <div className="relative rounded-xl overflow-hidden h-36 bg-muted">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPreviewUrl(""); setForm(f => ({ ...f, imageUrl: "" })); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-28 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground"
                  >
                    {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
                    <span className="text-sm">{uploading ? "Uploading…" : "Click to upload image"}</span>
                    <span className="text-xs">JPEG, PNG, WEBP · max 5MB</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Title</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Mobile App Development Internship"
                  className="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Field / Category</label>
                <input
                  value={form.field}
                  onChange={e => setForm(f => ({ ...f, field: e.target.value }))}
                  placeholder="e.g. Mobile Development"
                  className="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description of what interns will learn..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="isActive" className="text-sm font-medium">Active (visible to new registrations)</label>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || uploading} className="flex-1 rounded-xl">
                  {createMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</> : "Create Internship"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Internships List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : internships.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No internships yet</p>
          <p className="text-sm mt-1">Create your first internship program to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {internships.map(i => (
            <div key={i.id} className="bg-card rounded-2xl border p-4 flex items-center gap-4 group hover:shadow-sm transition-all">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0">
                {i.imageUrl ? (
                  <img src={i.imageUrl} alt={i.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-muted-foreground opacity-40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">{i.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${i.isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {i.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5 truncate">{i.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{i.field} • {i.taskCount} tasks</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setDeletingId(i.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <Link href={`/admin/internships/${i.id}`}>
                  <a className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeletingId(null)} />
          <div className="relative z-10 bg-card w-full max-w-sm rounded-2xl border shadow-xl p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="text-lg font-bold mb-2">Delete Internship?</h3>
            <p className="text-muted-foreground text-sm mb-6">This will permanently delete the internship and all its task templates.</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeletingId(null)} className="flex-1 rounded-xl">Cancel</Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate({ internshipId: deletingId })}
                className="flex-1 rounded-xl"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
