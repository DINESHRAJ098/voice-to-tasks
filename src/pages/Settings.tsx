import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowLeft, User, Trash2, LogOut, Shield, Bell, Palette } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="text-sm">Dashboard</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-[10px] font-bold text-white">V</div>
            <span className="text-sm font-semibold tracking-tight hidden sm:inline">Voice To Tasks</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your profile, preferences, and account.
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <Card className="border-white/[0.06] bg-card/40">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <User className="size-4" />
                </div>
                <CardTitle className="text-base">Profile</CardTitle>
                <CardDescription>Your account information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {user?.name || "Not set"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">
                      {user?.email || "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* preferences */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-white/[0.06] bg-card/40">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Palette className="size-4" />
                </div>
                <CardTitle className="text-base">Preferences</CardTitle>
                <CardDescription>Customize your experience.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Default Language</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      English — used for speech-to-text and AI extraction.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">English</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Theme</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Dark mode is always on for a focused, distraction-free experience.
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">Dark</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* notifications */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-white/[0.06] bg-card/40">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                  <Bell className="size-4" />
                </div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription>Control what you are alerted about.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "Processing complete", desc: "Get notified when your voice note has been transcribed and tasks extracted." },
                  { label: "Task due tomorrow", desc: "Receive a reminder the day before a task is due." },
                  { label: "Task overdue", desc: "Alert when a task has passed its deadline." },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                    <div className="flex size-5 items-center justify-center rounded border border-emerald-500/30 bg-emerald-500/10">
                      <span className="text-[10px] text-emerald-400">✓</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* privacy */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-white/[0.06] bg-card/40">
              <CardHeader>
                <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                  <Shield className="size-4" />
                </div>
                <CardTitle className="text-base">Privacy &amp; Data</CardTitle>
                <CardDescription>Control your data and privacy settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Data Encryption</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      All voice recordings and transcripts are encrypted in transit and at rest.
                    </p>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Data Isolation</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Your data is completely isolated from other users.
                    </p>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">Active</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* account actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-red-500/20 bg-red-500/[0.03]">
              <CardHeader>
                <CardTitle className="text-base text-red-400">Account Actions</CardTitle>
                <CardDescription>Sign out or delete your account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 border-white/[0.06] text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
                <Separator className="bg-red-500/10" />
                <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/[0.05] px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-red-400">Delete Account</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Permanently delete your account and all associated data.
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-1.5"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
