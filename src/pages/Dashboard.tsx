import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router";
import {
  ListChecks,
  CheckCircle2,
  Clock,
  FileText,
  Sparkles,
  X,
  Plus,
  LogOut,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { extractActionItems, type ExtractedTask } from "@/lib/extract";
import {
  formatDate,
  relativeTime,
  formatDueDate,
  PRIORITY_STYLES,
} from "@/lib/ui-utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type Priority = "low" | "medium" | "high" | "urgent";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [extracted, setExtracted] = useState<ExtractedTask[]>([]);
  const [noteId, setNoteId] = useState<Id<"notes"> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingTask, setEditingTask] = useState<ExtractedTask | null>(null);
  const [editingIdx, setEditingIdx] = useState<number>(-1);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<Priority>("medium");

  const allTasks = useQuery(api.tasks.list, {});
  const notes = useQuery(api.notes.list, {});
  const allNotes = notes ?? [];

  const filteredTasks = (allTasks ?? []).filter((t) => {
    if (statusFilter === "pending") return t.status === "pending";
    if (statusFilter === "completed") return t.status === "completed";
    if (statusFilter === "overdue") {
      return (
        t.status !== "completed" &&
        t.dueDate !== undefined &&
        t.dueDate !== null &&
        t.dueDate < Date.now()
      );
    }
    return true;
  });

  const pendingTasks = (allTasks ?? []).filter((t) => t.status === "pending");
  const completedTasks = (allTasks ?? []).filter((t) => t.status === "completed");
  const overdueTasks = (allTasks ?? []).filter(
    (t) =>
      t.status !== "completed" &&
      t.dueDate !== undefined &&
      t.dueDate !== null &&
      t.dueDate < Date.now(),
  );

  const stats = [
    { label: "Total Tasks", value: allTasks?.length ?? 0, icon: <ListChecks className="size-4" /> },
    { label: "Pending", value: pendingTasks.length, icon: <Clock className="size-4" /> },
    { label: "Completed", value: completedTasks.length, icon: <CheckCircle2 className="size-4" /> },
    { label: "Notes", value: allNotes.length, icon: <FileText className="size-4" /> },
  ];

  const createNote = useMutation(api.notes.create);
  const batchCreateTasks = useMutation(api.tasks.batchCreate);
  const toggleComplete = useMutation(api.tasks.toggleComplete);
  const deleteTask = useMutation(api.tasks.remove);
  const createTask = useMutation(api.tasks.create);

  const handleExtract = useCallback(async () => {
    if (!text.trim()) return;
    setIsProcessing(true);

    try {
      const now = Date.now();
      const id = await createNote({
        title:
          text.trim().split("\n")[0].slice(0, 80) ||
          "Untitled Note",
        rawText: text,
        status: "processing",
      });
      setNoteId(id);

      await new Promise((r) => setTimeout(r, 600));

      const tasks = extractActionItems(text);
      setExtracted(tasks);
    } finally {
      setIsProcessing(false);
    }
  }, [text, createNote]);

  const handleCreateTasks = useCallback(async () => {
    if (!noteId || extracted.length === 0) return;
    await batchCreateTasks({
      noteId,
      tasks: extracted.map((t) => ({
        title: t.title,
        description: t.description,
        dueDate: t.dueDate ? new Date(t.dueDate).getTime() : undefined,
        priority: t.priority,
        person: t.person,
        project: t.project,
        confidence: t.confidence,
      })),
    });
    setText("");
    setExtracted([]);
    setNoteId(null);
  }, [noteId, extracted, batchCreateTasks]);

  const handleRemoveExtracted = (idx: number) => {
    setExtracted((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleEditExtracted = (idx: number) => {
    setEditingTask({ ...extracted[idx] });
    setEditingIdx(idx);
  };

  const handleSaveEdit = () => {
    if (!editingTask || editingIdx < 0) return;
    setExtracted((prev) =>
      prev.map((t, i) => (i === editingIdx ? { ...editingTask } : t)),
    );
    setEditingTask(null);
    setEditingIdx(-1);
  };

  const handleAddTask = async () => {
    if (!noteId || !newTaskTitle.trim()) return;
    await createTask({
      noteId,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
    });
    setNewTaskTitle("");
    setNewTaskPriority("medium");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "overdue", label: "Overdue" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ── top bar ── */}
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2"
          >
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white">V</div>
            <span className="text-sm font-semibold tracking-tight">Voice To Tasks</span>
          </button>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/notes")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Notes
            </button>
            <button
              type="button"
              onClick={() => navigate("/tasks")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Tasks
            </button>
            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="size-8 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* ── welcome ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste your text below and let AI extract your action items.
          </p>
        </motion.div>

        {/* ── stats ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-white/[0.06] bg-card/40 p-4"
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                {s.icon}
                <span className="text-xs font-medium">{s.label}</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-foreground">{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* ── extraction input ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl border border-indigo-500/20 bg-indigo-500/[0.04] p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-foreground">Extract Action Items</h2>
          </div>

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your notes, meeting transcript, or raw text here…&#10;&#10;Example: Tomorrow I need to call Rahul about the website. Also send the revised proposal to the client by Friday."
            className="min-h-[160px] bg-background/80 border-white/[0.06] placeholder:text-muted-foreground/50 resize-none text-sm font-mono"
            disabled={isProcessing}
          />

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {text.trim().length > 0
                ? `${text.trim().split(/\s+/).filter(Boolean).length} words`
                : "Type or paste your text above"}
            </span>
            <div className="flex gap-2">
              {text.trim() && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setText("");
                    setExtracted([]);
                    setNoteId(null);
                  }}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleExtract}
                disabled={!text.trim() || isProcessing}
                className="bg-indigo-600 hover:bg-indigo-500 text-white"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-1.5" />
                    Processing…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4 mr-1.5" />
                    Extract Tasks
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── extracted tasks review ── */}
        <AnimatePresence>
          {extracted.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-400" />
                    <h3 className="text-sm font-semibold text-foreground">
                      AI extracted {extracted.length} action item{extracted.length !== 1 ? "s" : ""}
                    </h3>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleCreateTasks}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                  >
                    <Plus className="size-4 mr-1" />
                    Create {extracted.length} Task{extracted.length !== 1 ? "s" : ""}
                  </Button>
                </div>

                <div className="space-y-2">
                  {extracted.map((task, i) => {
                    const ps = PRIORITY_STYLES[task.priority];
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="flex size-5 shrink-0 items-center justify-center rounded border border-indigo-500/30 bg-indigo-500/10">
                            <span className="text-[10px] text-indigo-400">✓</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
                            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              {task.dueDate && <span>{formatDueDate(new Date(task.dueDate).getTime())}</span>}
                              {task.person && <span>• {task.person}</span>}
                              {task.confidence !== undefined && task.confidence < 0.6 && (
                                <span className="text-amber-400">⚠ Low confidence</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          <Badge variant="outline" className={`${ps.className} border text-[10px]`}>
                            {ps.label}
                          </Badge>
                          <button
                            type="button"
                            onClick={() => handleEditExtracted(i)}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors px-1.5"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtracted(i)}
                            className="text-xs text-red-400 hover:text-red-300 transition-colors px-1.5"
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── tasks ── */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">Your Tasks</h2>
            <div className="flex gap-1 rounded-lg bg-muted p-0.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    statusFilter === f.key
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-card/20 py-16 text-center">
              <ListChecks className="mx-auto mb-3 size-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                {statusFilter === "all"
                  ? "No tasks yet. Paste some text above to get started."
                  : `No ${statusFilter} tasks.`}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => {
                const ps = PRIORITY_STYLES[task.priority];
                const isCompleted = task.status === "completed";
                const isOverdue =
                  !isCompleted &&
                  task.dueDate !== undefined &&
                  task.dueDate !== null &&
                  task.dueDate < Date.now();
                return (
                  <motion.div
                    key={task._id}
                    layout
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                      isCompleted
                        ? "border-white/[0.04] bg-white/[0.01] opacity-60"
                        : isOverdue
                          ? "border-red-500/20 bg-red-500/[0.03]"
                          : "border-white/[0.06] bg-card/40 hover:border-indigo-500/20"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => toggleComplete({ taskId: task._id })}
                        className="border-white/20 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`}>
                          {task.title}
                        </p>
                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {task.dueDate && (
                            <span className={isOverdue ? "text-red-400 font-medium" : ""}>
                              {formatDueDate(task.dueDate)}
                            </span>
                          )}
                          {task.person && <span>• {task.person}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <Badge variant="outline" className={`${ps.className} border text-[10px]`}>
                        {ps.label}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => deleteTask({ taskId: task._id })}
                        className="text-xs text-muted-foreground hover:text-red-400 transition-colors px-1"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── recent notes ── */}
        {allNotes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold tracking-tight">Recent Notes</h2>
              <button
                type="button"
                onClick={() => navigate("/notes")}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                View all →
              </button>
            </div>
            <div className="space-y-2">
              {allNotes.slice(0, 3).map((note) => (
                <button
                  key={note._id}
                  type="button"
                  onClick={() => navigate(`/notes/${note._id}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-card/40 px-4 py-3 text-left hover:border-indigo-500/20 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{note.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{relativeTime(note.createdAt)}</p>
                  </div>
                  <Badge variant="outline" className="border-white/10 text-[10px] text-muted-foreground shrink-0">
                    {note.summary ? note.summary.slice(0, 60) : note.rawText.slice(0, 60)}…
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── edit extracted task dialog ── */}
      <Dialog open={!!editingTask} onOpenChange={() => setEditingTask(null)}>
        <DialogContent className="sm:max-w-md border-white/[0.08] bg-card">
          <DialogHeader>
            <DialogTitle>Edit Action Item</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Title</label>
                <Input
                  value={editingTask.title}
                  onChange={(e) =>
                    setEditingTask((p) => (p ? { ...p, title: e.target.value } : null))
                  }
                  className="bg-background/80 border-white/[0.06]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Due Date</label>
                <Input
                  type="date"
                  value={editingTask.dueDate ?? ""}
                  onChange={(e) =>
                    setEditingTask((p) =>
                      p ? { ...p, dueDate: e.target.value || null } : null,
                    )
                  }
                  className="bg-background/80 border-white/[0.06]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Priority</label>
                <Select
                  value={editingTask.priority}
                  onValueChange={(v) =>
                    setEditingTask((p) =>
                      p ? { ...p, priority: v as Priority } : null,
                    )
                  }
                >
                  <SelectTrigger className="bg-background/80 border-white/[0.06]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-white/[0.08]">
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Person</label>
                <Input
                  value={editingTask.person ?? ""}
                  onChange={(e) =>
                    setEditingTask((p) =>
                      p ? { ...p, person: e.target.value || undefined } : null,
                    )
                  }
                  placeholder="Who is this for?"
                  className="bg-background/80 border-white/[0.06]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
