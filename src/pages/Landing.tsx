import { motion } from "framer-motion";
import { ArrowRight, Mic, Sparkles, ListChecks, Clock, Search, Shield } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const start = () => navigate(isAuthenticated ? "/dashboard" : "/auth?returnTo=/dashboard");

  const features = [
    {
      icon: <Mic className="size-5" />,
      title: "Capture Everything",
      desc: "Record voice notes or paste raw text. Capture ideas, meetings, and thoughts without friction.",
      gradient: "from-indigo-500/20 to-cyan-500/20",
    },
    {
      icon: <Sparkles className="size-5" />,
      title: "AI-Powered Analysis",
      desc: "Our extraction engine parses your words and identifies action items, deadlines, and priorities with high accuracy.",
      gradient: "from-purple-500/20 to-indigo-500/20",
    },
    {
      icon: <ListChecks className="size-5" />,
      title: "Structured Output",
      desc: "Every voice note is transformed into organized, editable tasks with due dates, priority levels, and people assigned.",
      gradient: "from-cyan-500/20 to-blue-500/20",
    },
    {
      icon: <Clock className="size-5" />,
      title: "Automatic Deadlines",
      desc: "Natural phrases like \"tomorrow\" or \"by Friday\" are resolved to exact dates. Never miss a deadline again.",
      gradient: "from-blue-500/20 to-indigo-500/20",
    },
    {
      icon: <Search className="size-5" />,
      title: "Searchable Knowledge",
      desc: "Every transcript, task, and note is indexed. Find anything you've ever captured in milliseconds.",
      gradient: "from-indigo-500/20 to-violet-500/20",
    },
    {
      icon: <Shield className="size-5" />,
      title: "Private by Default",
      desc: "Your voice recordings and tasks are encrypted, isolated per user, and fully under your control.",
      gradient: "from-violet-500/20 to-indigo-500/20",
    },
  ];

  const steps = [
    { num: "01", label: "Record or Paste", desc: "Speak your mind or paste raw text from any source." },
    { num: "02", label: "AI Processes", desc: "Speech-to-text converts audio to text, then our engine extracts tasks." },
    { num: "03", label: "Review & Refine", desc: "Edit, approve, or discard extracted tasks before adding them to your list." },
    { num: "04", label: "Stay on Track", desc: "Manage priorities, deadlines, and projects — all from one dashboard." },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* ── animated background ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 size-[600px] rounded-full bg-indigo-600/10 blur-[128px]" />
        <div className="absolute -right-24 top-1/4 size-[500px] rounded-full bg-cyan-500/8 blur-[128px]" />
        <div className="absolute bottom-0 left-1/3 size-[400px] rounded-full bg-violet-500/8 blur-[128px]" />
      </div>

      {/* ── nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-white/5 bg-background/60 backdrop-blur-xl"
      >
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-white text-xs font-bold">V</div>
            <span className="text-base font-semibold tracking-tight">Voice To Tasks</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/auth?returnTo=/dashboard")}
              className="hidden text-sm text-muted-foreground hover:text-foreground transition-colors sm:block"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={start}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors"
            >
              Get Started
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10">
        {/* ── hero ── */}
        <section className="px-6 pb-24 pt-24 sm:pt-32">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300">
                <Sparkles className="size-3.5" />
                AI-Powered Task Extraction
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                <span className="text-foreground">Turn your </span>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  voice
                </span>
                <span className="text-foreground"> into </span>
                <span className="bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  action
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                Voice To Tasks converts raw voice recordings and pasted text into
                structured, automatically organized action items. Stop typing your
                tasks — just speak, paste, and let AI do the rest.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={start}
                  className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
                >
                  Start Extracting Tasks
                  <ArrowRight className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-medium text-muted-foreground hover:bg-white/10 hover:text-foreground transition-all"
                >
                  See How It Works
                </button>
              </div>
            </motion.div>

            {/* ── preview demo ── */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mt-20 rounded-2xl border border-white/[0.08] bg-card/60 p-1 shadow-2xl shadow-indigo-600/5 backdrop-blur-sm"
            >
              <div className="rounded-xl border border-white/[0.06] bg-background/80 p-6 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="size-2 rounded-full bg-red-500/80" />
                  <div className="size-2 rounded-full bg-yellow-500/80" />
                  <div className="size-2 rounded-full bg-green-500/80" />
                  <span className="ml-2 text-xs text-muted-foreground">extracted from voice note</span>
                </div>

                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-4 text-left text-sm text-muted-foreground leading-relaxed font-mono">
                  &quot;Tomorrow I need to call Rahul about the website. Also send the revised proposal
                  to the client by Friday. Remind me to check the payment status next Monday.&quot;
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-indigo-400">
                  <Sparkles className="size-3.5 animate-pulse" />
                  AI analyzing…
                </div>

                <div className="mt-5 space-y-3">
                  {[
                    { t: "Call Rahul about the website", d: "Tomorrow", p: "High", color: "text-orange-400 bg-orange-500/15 border-orange-500/30" },
                    { t: "Send revised proposal to client", d: "Friday", p: "High", color: "text-orange-400 bg-orange-500/15 border-orange-500/30" },
                    { t: "Check payment status", d: "Next Monday", p: "Medium", color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" },
                  ].map((item) => (
                    <div
                      key={item.t}
                      className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-5 items-center justify-center rounded border border-indigo-500/30 bg-indigo-500/10">
                          <span className="text-[10px] text-indigo-400">✓</span>
                        </div>
                        <span className="text-sm text-foreground font-medium">{item.t}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{item.d}</span>
                        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${item.color}`}>
                          {item.p}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── how it works ── */}
        <section id="how-it-works" className="border-t border-white/5 bg-white/[0.01] px-6 py-24">
          <div className="mx-auto max-w-5xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                Four steps from raw speech to actionable tasks. No complex setup required.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative rounded-xl border border-white/[0.06] bg-card/40 p-6 hover:border-indigo-500/30 transition-colors"
                >
                  <span className="text-xs font-bold text-indigo-500 tracking-wider">{step.num}</span>
                  <h3 className="mt-3 text-base font-semibold text-foreground">{step.label}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── features ── */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for Professionals
              </h2>
              <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
                Every feature is designed to help you capture, organize, and act on
                your ideas — without breaking your flow.
              </p>
            </motion.div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group rounded-xl border border-white/[0.06] bg-card/40 p-6 hover:border-indigo-500/30 transition-all"
                >
                  <div className={`mb-4 flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${f.gradient} text-indigo-300`}>
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="border-t border-white/5 bg-white/[0.01] px-6 py-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Stop Typing Your Tasks?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Join thousands of professionals who have already transformed their
              voice into structured, actionable work.
            </p>
            <div className="mt-8">
              <button
                type="button"
                onClick={start}
                className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-8 py-4 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500 transition-all"
              >
                Get Started Free
                <ArrowRight className="size-4" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── footer ── */}
        <footer className="border-t border-white/5 px-6 py-10">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-6 items-center justify-center rounded bg-indigo-600 text-[10px] font-bold text-white">V</div>
              <span className="text-sm font-semibold text-foreground">Voice To Tasks</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Voice To Tasks. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
