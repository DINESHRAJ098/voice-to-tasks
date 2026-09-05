import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import {
  ArrowLeft,
  ListChecks,
  CheckCircle2,
  X,
  CalendarDays,
} from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatDueDate,
  PRIORITY_STYLES,
  statusLabel,
} from "@/lib/ui-utils";
import { ThemeToggle } from "@/components/ThemeToggle";

type Status = "all" | "pending" | "in_progress" | "completed" | "cancelled";
type Priority = "all" | "low" | "medium" | "high" | "urgent";

const STATUS_TABS: { key: Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

const PRIORITY_OPTIONS: { key: Priority; label: string }[] = [
  { key: "all", label: "Any" },
  { key: "urgent", label: "Urgent" },
  { key: "high", label: "High" },
  { key: "medium", label: "Medium" },
  { key: "low", label: "Low" },
];

export default function Tasks() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority>("all");

  const allTasks = useQuery(api.tasks.list, {});
  const toggleComplete = useMutation(api.tasks.toggleComplete);
  const deleteTask = useMutation(api.tasks.remove);

  const tasks = (allTasks ?? []).filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  const overdueTasks = tasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.dueDate !== undefined &&
      t.dueDate !== null &&
      t.dueDate < Date.now(),
  );

  const pendingCount = (allTasks ?? []).filter((t) => t.status === "pending").length;
  const completedCount = (allTasks ?? []).filter((t) => t.status === "completed").length;
  const overdueCount = (allTasks ?? []).filter(
    (t) =>
      t.status !== "completed" &&
      t.dueDate !== undefined &&
      t.dueDate !== null &&
      t.dueDate < Date.now(),
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white">V</div>
            <span className="text-sm font-semibold tracking-tight hidden sm:inline">Voice To Tasks</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold tracking-tight">All Tasks</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, filter, and manage every task across all your voice notes.
          </p>
        </motion.div>

        {/* mini stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="rounded-lg border border-white/[0.06] bg-card/40 px-4 py-2.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
            <p className="mt-0.5 text-lg font-bold text-foreground">{pendingCount}</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-card/40 px-4 py-2.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Completed</p>
            <p className="mt-0.5 text-lg font-bold text-emerald-400">{completedCount}</p>
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-card/40 px-4 py-2.5">
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Overdue</p>
            <p className="mt-0.5 text-lg font-bold text-red-400">{overdueCount}</p>
          </div>
        </div>

        {/* filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
          <div className="flex gap-1 rounded-lg bg-muted p-0.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  statusFilter === tab.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-lg bg-muted p-0.5">
            {PRIORITY_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setPriorityFilter(opt.key)}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  priorityFilter === opt.key
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-card/20 py-20 text-center">
            <ListChecks className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {statusFilter === "all" && priorityFilter === "all"
                ? "No tasks yet. Go to the dashboard to extract some."
                : "No tasks match the current filters."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => {
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
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
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
                          <span className={`flex items-center gap-1 ${isOverdue ? "text-red-400 font-medium" : ""}`}>
                            <CalendarDays className="size-3" />
                            {formatDueDate(task.dueDate)}
                          </span>
                        )}
                        {task.person && <span>• {task.person}</span>}
                        {task.project && <span>• {task.project}</span>}
                        <span className="text-muted-foreground/50">
                          {statusLabel(task.status)}
                        </span>
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
      </main>
    </div>
  );
}
