"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Bell,
  LogOut,
  MessageSquare,
  Mic,
  BookOpen,
} from "lucide-react";
import { ChatWindow } from "@/components/ChatWindow";
import { VoiceCallModal } from "@/components/VoiceCallModal";
import { downloadCertificatePdf } from "@/lib/certificate";

type DashData = {
  user: { id: string; name: string; phone: string; role: string };
  courses: {
    id: string;
    title: string;
    slug: string;
    level: string;
    duration: string;
    totalLessons: number;
    completedLessons: number;
    percent: number;
  }[];
  notifications: {
    id: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: string;
  }[];
  certificates: {
    id: string;
    code: string;
    issuedAt: string;
    course: { title: string; slug: string };
  }[];
};

export function StudentDashboardClient({ initial }: { initial: DashData }) {
  const router = useRouter();
  const [tab, setTab] = useState<"courses" | "chat" | "certs" | "alerts">(
    "courses"
  );
  const [callOpen, setCallOpen] = useState(false);
  const [data, setData] = useState(initial);

  useEffect(() => {
    setData(initial);
  }, [initial]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function markAlertsRead() {
    await fetch("/api/notifications/read", { method: "PATCH" });
    setData((d) => ({
      ...d,
      notifications: d.notifications.map((n) => ({ ...n, read: true })),
    }));
  }

  const unread = data.notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-trace">Student dashboard</p>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
            Hi, {data.user.name}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTab("chat")}
            className="btn-ghost !py-2 text-sm"
          >
            <MessageSquare className="h-4 w-4 text-trace" />
            Chat
          </button>
          <button
            type="button"
            onClick={() => setCallOpen(true)}
            className="btn-ghost !py-2 text-sm"
          >
            <Mic className="h-4 w-4 text-trace" />
            Voice call
          </button>
          <button
            type="button"
            onClick={logout}
            className="btn-ghost !py-2 text-sm"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 border-b border-line pb-3">
        {(
          [
            ["courses", "Courses", BookOpen],
            ["chat", "Chat", MessageSquare],
            ["certs", "Certificates", Award],
            ["alerts", `Alerts${unread ? ` (${unread})` : ""}`, Bell],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setTab(key);
              if (key === "alerts") markAlertsRead();
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
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

      {tab === "courses" && (
        <div className="grid gap-4">
          {data.courses.length === 0 ? (
            <div className="card-surface p-8 text-center">
              <p className="text-muted">No enrollments yet.</p>
              <Link href="/courses" className="btn-primary mt-4 inline-flex">
                Browse free courses
              </Link>
            </div>
          ) : (
            data.courses.map((c) => (
              <div
                key={c.id}
                className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-ink">{c.title}</h3>
                  <p className="text-sm text-muted">
                    {c.level} · {c.completedLessons}/{c.totalLessons} lessons
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-elevated">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-trace to-accent transition-all"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-trace">{c.percent}% complete</p>
                </div>
                <Link
                  href={`/courses/${c.slug}`}
                  className="btn-primary !py-2 text-sm"
                >
                  Continue
                </Link>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "chat" && (
        <ChatWindow role="STUDENT" currentUserId={data.user.id} />
      )}

      {tab === "certs" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.certificates.length === 0 ? (
            <p className="text-muted">
              Complete a course to unlock your certificate.
            </p>
          ) : (
            data.certificates.map((cert) => (
              <div key={cert.id} className="card-surface p-5">
                <Award className="mb-3 h-8 w-8 text-copper" />
                <h3 className="font-semibold text-ink">{cert.course.title}</h3>
                <p className="mt-1 text-xs text-muted">Code: {cert.code}</p>
                <button
                  type="button"
                  className="btn-primary mt-4 !py-2 text-sm"
                  onClick={() =>
                    downloadCertificatePdf({
                      studentName: data.user.name,
                      courseTitle: cert.course.title,
                      code: cert.code,
                      issuedAt: cert.issuedAt,
                    })
                  }
                >
                  Download PDF
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "alerts" && (
        <ul className="space-y-3">
          {data.notifications.map((n) => (
            <li key={n.id} className="card-surface p-4">
              <p className="font-medium text-ink">{n.title}</p>
              <p className="mt-1 text-sm text-muted">{n.body}</p>
              <p className="mt-2 text-xs text-muted">
                {new Date(n.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
          {data.notifications.length === 0 && (
            <p className="text-muted">No notifications yet.</p>
          )}
        </ul>
      )}

      <VoiceCallModal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        userId={data.user.id}
        role="STUDENT"
        peerName="Instructor"
      />
    </div>
  );
}
