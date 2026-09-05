/**
 * Action-item extraction engine for pasted text.
 *
 * v1 uses rule-based NLP. Upgrade to LLM-backed extraction
 * by swapping extractActionItems() internals — the interface
 * (ExtractedTask[]) stays the same.
 */

export type Priority = "low" | "medium" | "high" | "urgent";

export interface ExtractedTask {
  title: string;
  description?: string;
  dueDate?: string | null;
  priority: Priority;
  person?: string;
  project?: string;
  confidence: number;
}

// ── date helpers ──────────────────────────────────────────────

function weekDay(name: string): number {
  const d = new Date();
  while (d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() !== name)
    d.setDate(d.getDate() + 1);
  return d.getTime();
}

function addDays(from: Date, n: number): number {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  d.setHours(9, 0, 0, 0);
  return d.getTime();
}

function relativeDate(
  text: string,
  ref = new Date(),
): string | null {
  const t = text.toLowerCase();

  if (/\bend of (the )?week\b|\bby eow\b|\bby fri(day)?\b|\bbefore fri(day)?\b|\bthis fri(day)?\b/.test(t))
    return new Date(weekDay("friday")).toISOString().slice(0, 10);
  if (/\bnext month\b/.test(t)) {
    const d = new Date(ref.getFullYear(), ref.getMonth() + 1, 1, 9);
    return d.toISOString().slice(0, 10);
  }
  if (/\bnext week\b/.test(t))
    return new Date(addDays(ref, 7)).toISOString().slice(0, 10);
  if (/\bnext (mon|tue|wed|thu|fri|sat|sun)/i.test(t)) {
    const day = t.match(/next (mon|tue|wed|thu|fri|sat|sun)/i)![1].toLowerCase();
    const map: Record<string, string> = {
      mon: "monday", tue: "tuesday", wed: "wednesday",
      thu: "thursday", fri: "friday", sat: "saturday", sun: "sunday",
    };
    return new Date(weekDay(map[day] ?? "monday")).toISOString().slice(0, 10);
  }
  if (/\bby tomorrow\b|\bin two days\b/.test(t))
    return new Date(addDays(ref, 2)).toISOString().slice(0, 10);
  if (/\btomorrow\b/.test(t))
    return new Date(addDays(ref, 1)).toISOString().slice(0, 10);
  if (/\bby today\b|\blater today\b|\btoday\b|\btonight\b/.test(t))
    return new Date(ref.getFullYear(), ref.getMonth(), ref.getDate(), 9, 0, 0, 0).toISOString().slice(0, 10);

  return null;
}

// ── person detection ──────────────────────────────────────────

function findPeople(text: string): string[] {
  const names = new Set<string>();
  const re =
    /\b(?:ask|tell|call|email|remind|send|talk to|follow up with|reach out to|contact|notify|loop in|cc|assign|delegate)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) names.add(m[1]);
  return [...names];
}

// ── priority detection ────────────────────────────────────────

function detectPriority(text: string): Priority {
  const t = text.toLowerCase();
  if (/\burgent(ly)?\b|\basap\b|\bimmediately\b|\bcritical\b|\bdo it now\b/.test(t)) return "urgent";
  if (/\bimportant\b|\bneed to\b|\bmust\b|\bhigh priority\b/.test(t)) return "high";
  if (/\bwhenever (you|u) (get time|can)\b|\bwhen (you|u) can\b|\blow priority\b|\bwhen possible\b|\bno rush\b/.test(t)) return "low";
  return "medium";
}

// ── title cleanup ─────────────────────────────────────────────

function cleanTitle(s: string): string {
  let t = s.trim();
  // strip leading discourse markers
  t = t.replace(/^(?:okay,?\s*|ok,?\s*|so,?\s*|alright,?\s*|right,?\s*|well,?\s*|hey,?\s*|also,?\s*|and then,?\s*|um,?\s*|uh,?\s*|by the way,?\s*|btw,?\s*|just a reminder,?\s*|don'?t forget to,?\s*|make sure to,?\s*)/i, "");
  t = t.replace(/[,;]+$/, "");
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return t;
}

// ── confidence score ──────────────────────────────────────────

function score(title: string, date: string | null, people: string[]): number {
  let c = 0.5;
  if (/\b(need|must|should|have to|make sure|remember|don'?t forget|schedule|plan|create|send|call|email|follow up|check|review|update|prepare|finish|complete|submit|book|arrange|fix|set up|buy|order|pay|write|draft|review)\b/i.test(title)) c += 0.25;
  if (date) c += 0.1;
  if (people.length) c += 0.05;
  return Math.min(c, 0.99);
}

// ── non-action sentences to skip ──────────────────────────────

const SKIP = [
  /^(?:the .+ (?:was|is|are|has been|went|looks?)|we discussed|i (?:think|believe|feel|meant)|it (?:was|is|are)|they (?:were|are|said)|he (?:was|is|said)|she (?:was|is|said))\b/i,
  /^(?:good|great|nice|cool|fine|okay|ok|alright|right|wow|thanks|thank you|sorry|no problem|sure|sounds good|perfect|awesome|excellent|love that|noted|got it|will do)\s*[.!?]?$/i,
];

// ── main extraction ───────────────────────────────────────────

export function extractActionItems(text: string): ExtractedTask[] {
  if (!text?.trim()) return [];

  const now = new Date();
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

  // merge sentence fragments
  const sentences: string[] = [];
  for (const line of lines) {
    if (/^[a-z]/.test(line) && sentences.length) {
      sentences[sentences.length - 1] += " " + line;
    } else {
      sentences.push(line);
    }
  }

  const seen = new Set<string>();
  const tasks: ExtractedTask[] = [];

  for (const raw of sentences) {
    const s = raw.replace(/\s+/g, " ").trim();
    if (s.length < 3) continue;
    if (SKIP.some((p) => p.test(s))) continue;

    const actionPatterns =
      /\b(need to|must|should|have to|make sure|remember to|don'?t forget|please|can you|could you|would you|try to|plan to|want to|going to|about to|schedule|plan|create|send|call|email|write|draft|review|update|prepare|finish|complete|submit|book|arrange|fix|set up|follow up|check|buy|order|pay|cancel|confirm|verify|assign|delegate|research|find|look into|reach out|contact|notify|remind|ask|tell|buy|install|deploy|release|push|merge|refactor|test|audit|migrate)\b/i;

    if (!actionPatterns.test(s)) continue;

    const lower = s.toLowerCase();
    const subject = lower.replace(actionPatterns, "").trim();
    if (subject.length < 3 && !/(?:send|call|email|check|review|update|create|fix|submit|buy|pay|install|deploy)\b/i.test(lower)) continue;
    if (subject.length < 2) continue;

    const title = cleanTitle(s);
    if (seen.has(title.toLowerCase())) continue;
    seen.add(title.toLowerCase());

    const due = relativeDate(s, now);
    const people = findPeople(s);

    tasks.push({
      title,
      description: undefined,
      dueDate: due,
      priority: detectPriority(s),
      person: people[0],
      project: undefined,
      confidence: score(title, due, people),
    });
  }

  return tasks;
}
