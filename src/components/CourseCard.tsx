import Link from "next/link";
import { Clock, Signal, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type CourseCardData = {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: string;
  duration: string;
  thumbnail?: string | null;
  lessonCount?: number;
  enrolled?: boolean;
  isFree?: boolean;
};

export function CourseCard({
  course,
  className,
}: {
  course: CourseCardData;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "card-surface group flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-trace/40 hover:shadow-[0_12px_40px_rgba(10,37,64,0.1)]",
        className
      )}
    >
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-elevated to-bg">
        <div className="pcb-grid absolute inset-0 opacity-50" />
        <div className="relative z-10 rounded-lg border border-trace/30 bg-bg/60 px-4 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-trace">
          {course.level}
        </div>
        {course.isFree !== false && (
          <span className="absolute right-3 top-3 rounded bg-trace/15 px-2 py-0.5 text-xs font-semibold text-trace">
            Free
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink group-hover:text-trace transition">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">
          {course.description}
        </p>
        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.duration}
          </span>
          {typeof course.lessonCount === "number" && (
            <span className="inline-flex items-center gap-1">
              <Signal className="h-3.5 w-3.5" />
              {course.lessonCount} lessons
            </span>
          )}
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="btn-primary mt-5 !py-2.5 text-sm"
        >
          {course.enrolled ? "Continue" : "Join Free"}
        </Link>
      </div>
    </article>
  );
}

export function TrustBar() {
  const stats = [
    { label: "Students enrolled", value: "2,400+", icon: Users },
    { label: "Courses completed", value: "1,100+", icon: Signal },
    { label: "Years teaching PCB", value: "8+", icon: Clock },
  ];
  return (
    <section className="border-b border-line bg-elevated/60">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-10 sm:grid-cols-3 sm:px-6">
        {stats.map((s) => (
          <div key={s.label} className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-trace/30 bg-trace/10 text-trace">
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink">
                {s.value}
              </p>
              <p className="text-sm text-muted">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
