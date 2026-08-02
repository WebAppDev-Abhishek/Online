import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const session = await getSession();
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "asc" },
    include: {
      modules: { include: { lessons: true } },
    },
  });

  let enrolledIds = new Set<string>();
  if (session) {
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: session.id },
      select: { courseId: true },
    });
    enrolledIds = new Set(enrollments.map((e) => e.courseId));
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
            All courses
          </h1>
          <p className="mt-2 text-muted">
            Free PCB courses open to every registered student.
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((c) => (
              <CourseCard
                key={c.id}
                course={{
                  id: c.id,
                  title: c.title,
                  slug: c.slug,
                  description: c.description,
                  level: c.level,
                  duration: c.duration,
                  thumbnail: c.thumbnail,
                  isFree: c.isFree,
                  lessonCount: c.modules.reduce(
                    (n, m) => n + m.lessons.length,
                    0
                  ),
                  enrolled: enrolledIds.has(c.id),
                }}
              />
            ))}
          </div>
          {!session && (
            <p className="mt-10 text-center text-sm text-muted">
              <Link href="/register" className="text-trace hover:underline">
                Register free
              </Link>{" "}
              to enroll and track progress.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
