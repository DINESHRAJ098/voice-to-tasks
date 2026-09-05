import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { Search, FileText, ArrowLeft, Clock } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { relativeTime, summaryLabel } from "@/lib/ui-utils";

export default function Notes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const notes = useQuery(api.notes.list, {});
  const allNotes = notes ?? [];

  const filtered = allNotes.filter((n) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.rawText.toLowerCase().includes(q)
    );
  });

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
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight">Voice Notes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All your captured voice notes and transcripts, fully searchable.
          </p>
        </motion.div>

        {/* search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes by title or content…"
            className="h-10 w-full rounded-xl border border-white/[0.06] bg-card/40 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-indigo-500/40 transition-colors"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.08] bg-card/20 py-20 text-center">
            <FileText className="mx-auto mb-3 size-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {search ? "No notes match your search." : "No voice notes yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((note, i) => (
              <motion.button
                key={note._id}
                type="button"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/notes/${note._id}`)}
                className="flex w-full items-start gap-4 rounded-xl border border-white/[0.06] bg-card/40 p-5 text-left hover:border-indigo-500/20 transition-all"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <FileText className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{note.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {note.rawText.slice(0, 180)}{note.rawText.length > 180 ? "…" : ""}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" />
                      {relativeTime(note.createdAt)}
                    </span>
                    <Badge variant="outline" className="border-white/10 text-[10px]">
                      {summaryLabel(note.status)}
                    </Badge>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
