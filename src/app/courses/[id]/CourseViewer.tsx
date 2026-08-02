"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileText, HelpCircle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Lesson = {
  id: string;
  title: string;
  type: string;
  contentUrl: string | null;
  contentText: string | null;
  durationMin: number;
  quiz?: { questions: string } | null;
};

type Module = {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  isFree: boolean;
  modules: Module[];
};

export function CourseViewer({
  course,
  enrolled,
  progress,
  isLoggedIn,
}: {
  course: Course;
  enrolled: boolean;
  progress: Record<string, boolean>;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(
    course.modules[0]?.lessons[0] || null
  );
  const [localProgress, setLocalProgress] = useState(progress);
  const [enrolling, setEnrolling] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function enroll() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setEnrolling(true);
    setMessage("");
    try {
      const res = await fetch(`/api/courses/${course.id}/enroll`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "Could not enroll");
        return;
      }
      router.refresh();
    } finally {
      setEnrolling(false);
    }
  }

  async function markComplete(lessonId: string) {
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId }),
    });
    const data = await res.json();
    if (res.ok) {
      setLocalProgress((p) => ({ ...p, [lessonId]: true }));
      if (data.certificate) {
        setMessage("Course complete! Certificate unlocked on your dashboard.");
      }
    }
  }

  function submitQuiz(lesson: Lesson) {
    if (!lesson.quiz) return;
    const questions = JSON.parse(lesson.quiz.questions) as {
      q: string;
      options: string[];
      answer: number;
    }[];
    let score = 0;
    questions.forEach((q, i) => {
      if (quizAnswers[i] === q.answer) score += 1;
    });
    setQuizScore(score);
    if (score === questions.length) {
      markComplete(lesson.id);
    }
  }

  const iconFor = (type: string) => {
    if (type === "PDF") return FileText;
    if (type === "QUIZ") return HelpCircle;
    return PlayCircle;
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[280px_1fr]">
      <aside className="card-surface h-fit p-4 lg:sticky lg:top-20">
        <p className="mb-1 text-xs uppercase tracking-wider text-trace">
          {course.level} · {course.duration}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink">
          {course.title}
        </h1>
        {!enrolled && (
          <button
            type="button"
            onClick={enroll}
            disabled={enrolling}
            className="btn-primary mt-4 w-full !py-2.5 text-sm"
          >
            {enrolling ? "Enrolling…" : "Join Free"}
          </button>
        )}
        {message && (
          <p className="mt-3 text-xs text-trace">{message}</p>
        )}
        <div className="mt-6 space-y-5">
          {course.modules.map((mod) => (
            <div key={mod.id}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {mod.title}
              </p>
              <ul className="space-y-1">
                {mod.lessons.map((lesson) => {
                  const Icon = iconFor(lesson.type);
                  const done = localProgress[lesson.id];
                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        disabled={!enrolled}
                        onClick={() => {
                          setActiveLesson(lesson);
                          setQuizAnswers({});
                          setQuizScore(null);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition",
                          activeLesson?.id === lesson.id
                            ? "bg-trace/15 text-trace"
                            : "text-muted hover:bg-elevated hover:text-ink",
                          !enrolled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-trace" />
                        ) : (
                          <Icon className="h-4 w-4 shrink-0" />
                        )}
                        <span className="line-clamp-2">{lesson.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <section className="card-surface min-h-[420px] p-6 sm:p-8">
        {!enrolled ? (
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              About this course
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              {course.description}
            </p>
            <p className="mt-6 text-sm text-muted">
              Enroll free to unlock lessons, quizzes, and certificate tracking.
            </p>
          </div>
        ) : activeLesson ? (
          <div>
            <p className="text-xs uppercase tracking-wider text-trace">
              {activeLesson.type} · {activeLesson.durationMin} min
            </p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
              {activeLesson.title}
            </h2>

            {activeLesson.type === "VIDEO" && (
              <div className="mt-6">
                {activeLesson.contentUrl ? (
                  <div className="aspect-video overflow-hidden rounded-xl border border-line bg-bg">
                    <iframe
                      src={activeLesson.contentUrl}
                      title={activeLesson.title}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-xl border border-dashed border-line bg-bg text-muted">
                    Video placeholder — content coming soon
                  </div>
                )}
                {activeLesson.contentText && (
                  <p className="mt-4 text-sm leading-relaxed text-muted">
                    {activeLesson.contentText}
                  </p>
                )}
              </div>
            )}

            {activeLesson.type === "PDF" && (
              <div className="mt-6 rounded-xl border border-line bg-bg p-6">
                <FileText className="mb-3 h-8 w-8 text-copper" />
                <p className="text-sm leading-relaxed text-muted">
                  {activeLesson.contentText || "Downloadable resource notes."}
                </p>
                <button
                  type="button"
                  className="btn-ghost mt-4 !py-2 text-sm"
                  onClick={() =>
                    alert("PDF download placeholder — wire to storage later.")
                  }
                >
                  Download PDF
                </button>
              </div>
            )}

            {activeLesson.type === "QUIZ" && activeLesson.quiz && (
              <div className="mt-6 space-y-6">
                {(
                  JSON.parse(activeLesson.quiz.questions) as {
                    q: string;
                    options: string[];
                    answer: number;
                  }[]
                ).map((q, qi) => (
                  <div key={qi} className="rounded-xl border border-line p-4">
                    <p className="font-medium text-ink">
                      {qi + 1}. {q.q}
                    </p>
                    <div className="mt-3 space-y-2">
                      {q.options.map((opt, oi) => (
                        <label
                          key={oi}
                          className="flex cursor-pointer items-center gap-2 text-sm text-muted"
                        >
                          <input
                            type="radio"
                            name={`q-${qi}`}
                            checked={quizAnswers[qi] === oi}
                            onChange={() =>
                              setQuizAnswers((a) => ({ ...a, [qi]: oi }))
                            }
                            className="accent-[var(--trace)]"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => submitQuiz(activeLesson)}
                >
                  Submit quiz
                </button>
                {quizScore !== null && (
                  <p className="text-sm text-trace">
                    Score: {quizScore} —{" "}
                    {quizScore ===
                    JSON.parse(activeLesson.quiz.questions).length
                      ? "Perfect! Lesson marked complete."
                      : "Try again to unlock completion."}
                  </p>
                )}
              </div>
            )}

            {activeLesson.type !== "QUIZ" && !localProgress[activeLesson.id] && (
              <button
                type="button"
                className="btn-primary mt-8"
                onClick={() => markComplete(activeLesson.id)}
              >
                Mark as complete
              </button>
            )}
            {localProgress[activeLesson.id] && (
              <p className="mt-8 inline-flex items-center gap-2 text-sm text-trace">
                <CheckCircle2 className="h-4 w-4" /> Completed
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted">Select a lesson to begin.</p>
        )}
      </section>
    </div>
  );
}
