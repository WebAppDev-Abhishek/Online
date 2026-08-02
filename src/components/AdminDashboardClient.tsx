"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  LogOut,
  Megaphone,
  MessageSquare,
  Mic,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import { VoiceCallModal } from "@/components/VoiceCallModal";

type AdminData = {
  user: { id: string; name: string };
  analytics: {
    totalStudents: number;
    totalCourses: number;
    enrollments: number;
    completions: number;
    completionRate: number;
    activeConversations: number;
  };
  students: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    createdAt: string;
    enrollments: { course: { title: string } }[];
  }[];
  courses: {
    id: string;
    title: string;
    slug: string;
    level: string;
    isFree: boolean;
    lessonCount: number;
    _count: { enrollments: number };
  }[];
  announcements: { id: string; title: string; body: string; createdAt: string }[];
};

export function AdminDashboardClient({ initial }: { initial: AdminData }) {
  const router = useRouter();
  const [tab, setTab] = useState<
    "overview" | "courses" | "students" | "chat" | "announce"
  >("overview");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [callOpen, setCallOpen] = useState(false);
  const [callPeer, setCallPeer] = useState<{ id: string; name: string } | null>(
    null
  );
  const [msg, setMsg] = useState("");

  const students = useMemo(() => {
    return initial.students.filter((s) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.email || "").toLowerCase().includes(q);
      const matchCourse =
        !courseFilter ||
        s.enrollments.some((e) => e.course.title === courseFilter);
      return matchQ && matchCourse;
    });
  }, [initial.students, search, courseFilter]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function createCourse(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/courses/manage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        level: form.get("level") || "Beginner",
        duration: form.get("duration") || "4 weeks",
        isFree: true,
      }),
    });
    if (res.ok) {
      setMsg("Course created.");
      router.refresh();
      e.currentTarget.reset();
    } else {
      const data = await res.json();
      setMsg(data.error || "Failed to create course");
    }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course?")) return;
    await fetch(`/api/courses/manage?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function broadcast(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        body: form.get("body"),
      }),
    });
    if (res.ok) {
      setMsg("Announcement sent to all students.");
      router.refresh();
      e.currentTarget.reset();
    }
  }

  const a = initial.analytics;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-trace">Admin dashboard</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            {initial.user.name}
          </h1>
        </div>
        <button type="button" onClick={logout} className="btn-ghost !py-2 text-sm">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>

      {msg && (
        <p className="mb-4 rounded-lg border border-trace/30 bg-trace/10 px-3 py-2 text-sm text-trace">
          {msg}
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {(
          [
            ["overview", "Overview", BarChart3],
            ["courses", "Courses", BookOpen],
            ["students", "Students", Users],
            ["chat", "Live chat", MessageSquare],
            ["announce", "Broadcast", Megaphone],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
              tab === key
                ? "bg-trace/15 text-trace"
                : "text-muted hover:text-ink"
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Students", a.totalStudents],
            ["Courses", a.totalCourses],
            ["Enrollments", a.enrollments],
            ["Certificates", a.completions],
            ["Completion rate", `${a.completionRate}%`],
            ["Active chats", a.activeConversations],
          ].map(([label, value]) => (
            <div key={label as string} className="card-surface p-5">
              <p className="text-sm text-muted">{label}</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-bold text-trace">
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {tab === "courses" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={createCourse} className="card-surface space-y-3 p-5">
            <h3 className="font-semibold">Add course</h3>
            <input name="title" required placeholder="Title" className="input-field" />
            <textarea
              name="description"
              required
              placeholder="Description"
              className="input-field min-h-24"
            />
            <div className="grid grid-cols-2 gap-3">
              <input name="level" placeholder="Level" className="input-field" defaultValue="Beginner" />
              <input name="duration" placeholder="Duration" className="input-field" defaultValue="4 weeks" />
            </div>
            <button type="submit" className="btn-primary w-full">
              Create course
            </button>
          </form>
          <div className="space-y-3">
            {initial.courses.map((c) => (
              <div
                key={c.id}
                className="card-surface flex items-start justify-between gap-3 p-4"
              >
                <div>
                  <p className="font-medium text-ink">{c.title}</p>
                  <p className="text-xs text-muted">
                    {c.level} · {c.lessonCount} lessons · {c._count.enrollments}{" "}
                    enrolled
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteCourse(c.id)}
                  className="rounded border border-line p-2 text-danger hover:border-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "students" && (
        <div>
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                className="input-field pl-9"
                placeholder="Search name, phone, email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="input-field max-w-xs"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="">All courses</option>
              {initial.courses.map((c) => (
                <option key={c.id} value={c.title}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-elevated text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Courses</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium">Call</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <td className="px-4 py-3 text-ink">{s.name}</td>
                    <td className="px-4 py-3 text-muted">{s.phone}</td>
                    <td className="px-4 py-3 text-muted">
                      {s.enrollments.map((e) => e.course.title).join(", ") ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-trace hover:underline"
                        onClick={() => {
                          setCallPeer({ id: s.id, name: s.name });
                          setCallOpen(true);
                        }}
                      >
                        <Mic className="h-4 w-4" />
                        Call
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "chat" && (
        <ChatWindow role="ADMIN" currentUserId={initial.user.id} />
      )}

      {tab === "announce" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={broadcast} className="card-surface space-y-3 p-5">
            <h3 className="font-semibold">Broadcast announcement</h3>
            <input name="title" required className="input-field" placeholder="Title" />
            <textarea
              name="body"
              required
              className="input-field min-h-28"
              placeholder="Message to all students"
            />
            <button type="submit" className="btn-primary w-full">
              Send to all
            </button>
          </form>
          <div className="space-y-3">
            {initial.announcements.map((ann) => (
              <div key={ann.id} className="card-surface p-4">
                <p className="font-medium">{ann.title}</p>
                <p className="mt-1 text-sm text-muted">{ann.body}</p>
                <p className="mt-2 text-xs text-muted">
                  {new Date(ann.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <VoiceCallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        userId={initial.user.id}
        role="ADMIN"
        peerId={callPeer?.id}
        peerName={callPeer?.name}
      />
    </div>
  );
}
