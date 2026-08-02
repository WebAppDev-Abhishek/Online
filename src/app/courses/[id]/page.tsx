import { notFound } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { CourseViewer } from "./CourseViewer";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
      isPublished: true,
    },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          lessons: {
            orderBy: { order: "asc" },
            include: { quiz: true },
          },
        },
      },
    },
  });

  if (!course) notFound();

  let enrolled = false;
  let progress: Record<string, boolean> = {};

  if (session) {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.id, courseId: course.id },
      },
    });
    enrolled = !!enrollment;
    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const done = await prisma.lessonProgress.findMany({
      where: {
        userId: session.id,
        lessonId: { in: lessonIds },
        completed: true,
      },
    });
    progress = Object.fromEntries(done.map((d) => [d.lessonId, true]));
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <CourseViewer
          course={course}
          enrolled={enrolled}
          progress={progress}
          isLoggedIn={!!session}
        />
      </main>
      <Footer />
    </>
  );
}
