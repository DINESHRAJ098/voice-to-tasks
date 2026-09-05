import type { Priority } from "./extract";

/** Format epoch ms to a readable date string */
export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format epoch ms to short time */
export function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Relative time string ("2 hours ago", "Yesterday", etc.) */
export function relativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return formatDate(ts);
}

/** "tomorrow", "today", or formatted date */
export function formatDueDate(dueDate: number | undefined | null): string {
  if (!dueDate) return "No due date";
  const d = new Date(dueDate);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (d.toDateString() === todayStart.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  const diffDays = Math.ceil((d.getTime() - todayStart.getTime()) / 86_400_000);
  if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
  if (diffDays <= 6) {
    return d.toLocaleDateString("en-US", { weekday: "long" });
  }

  return formatDate(dueDate);
}

/** Priority badge config */
export const PRIORITY_STYLES: Record<Priority, { label: string; className: string }> = {
  urgent: {
    label: "Urgent",
    className: "bg-red-500/15 text-red-400 border-red-500/30",
  },
  high: {
    label: "High",
    className: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  },
  low: {
    label: "Low",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
};

/** Status label */
export function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] ?? status;
}

/** Summary label for a status */
export function summaryLabel(status: string): string {
  const map: Record<string, string> = {
    uploaded: "Uploaded",
    transcribing: "Transcribing…",
    transcribed: "Transcribed",
    processing: "Processing…",
    completed: "Completed",
    failed: "Failed",
  };
  return map[status] ?? status;
}
