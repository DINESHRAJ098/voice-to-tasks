import { useParams, useNavigate } from "react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  Clock,
  Trash2,
  ListChecks,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatDate,
  relativeTime,
  formatDueDate,
  PRIORITY_STYLES,
  summaryLabel,
} from "@/lib/ui-utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useState } from "react";

export default function NoteDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  const note = useQuery(
    api.notes.get,
    id ? { noteId: id as any } : "skip",
  );

  const tasks = useQuery(
    api.tasks.list,
    id ? { noteId: id as any } : {},
  );

  const deleteNote = useMutation(api.notes.remove);

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Delete this note and all its tasks? This cannot be undone.")) return;
    setDeleting(true);
    await deleteNote({ noteId: id as any });
    navigate("/notes");
  };

  if (note === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Note not found.</p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => navigate("/notes")}
          >
            Back to Notes
          </Button>
        </div>
      </div>
    );
  }

  const noteTasks = tasks ?? [];
  const completedCount = noteTasks.filter((t) => t.status === "completed").length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/notes")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">Notes</span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="text-muted-foreground hover:text-red-400 gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {note.title}
              </h1>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {relativeTime(note.createdAt)}
                </span>
                <span>•</span>
                <span>{formatDate(note.createdAt)}</span>
                <Badge variant="outline" className="border-white/10 text-[10px]">
                  {summaryLabel(note.status)}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        {/* transcript */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText className="size-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-foreground">Transcript</h2>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-card/40 p-5">
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-mono">
              {note.rawText}
            </p>
          </div>
        </motion.div>

        {/* tasks */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks className="size-4 text-indigo-400" />
              <h2 className="text-sm font-semibold text-foreground">
                Extracted Tasks ({completedCount}/{noteTasks.length} completed)
              </h2>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="text-xs text-indigo-400 hover:text-indigo-300"
            >
              Manage in Dashboard →
            </Button>
          </div>

          {noteTasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/[0.08] bg-card/20 py-12 text-center">
              <AlertTriangle className="mx-auto mb-2 size-6 text-amber-400/60" />
              <p className="text-sm text-muted-foreground">
                No tasks were extracted from this note.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {noteTasks.map((task) => {
                const ps = PRIORITY_STYLES[task.priority];
                const isCompleted = task.status === "completed";
                const isOverdue =
                  !isCompleted &&
                  task.dueDate !== undefined &&
                  task.dueDate !== null &&
                  task.dueDate < Date.now();
                return (
                  <div
                    key={task._id}
                    className={`flex items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                      isCompleted
                        ? "border-white/[0.04] bg-white/[0.01] opacity-60"
                        : isOverdue
                          ? "border-red-500/20 bg-red-500/[0.03]"
                          : "border-white/[0.06] bg-card/40"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {isCompleted ? (
                        <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                      ) : (
                        <div className="flex size-4 shrink-0 items-center justify-center rounded border border-indigo-500/30 bg-indigo-500/10">
                          <span className="text-[8px] text-indigo-400">•</span>
                        </div>
                      )}
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
                    <Badge variant="outline" className={`${ps.className} border text-[10px] shrink-0 ml-3`}>
                      {ps.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
