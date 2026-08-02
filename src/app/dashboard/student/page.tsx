import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { StudentDashboardClient } from "@/components/StudentDashboardClient";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calcProgress } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMIN") redirect("/dashboard/admin");

  const enrollments = await prisma.enrollment.findMany({
    where: { userId: session.id },
    include: {
      course: { include: { modules: { include: { lessons: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  const courses = await Promise.all(
    enrollments.map(async (e) => {
      const lessonIds = e.course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id)
      );
      const completed = await prisma.lessonProgress.count({
        where: {
          userId: session.id,
          lessonId: { in: lessonIds },
          completed: true,
        },
      });
      return {
        id: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        level: e.course.level,
        duration: e.course.duration,
        totalLessons: lessonIds.length,
        completedLessons: completed,
        percent: calcProgress(completed, lessonIds.length),
      };
    })
  );

  const notifications = await prisma.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const certificates = await prisma.certificate.findMany({
    where: { userId: session.id },
    include: { course: { select: { title: true, slug: true } } },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <StudentDashboardClient
          initial={{
            user: {
              id: session.id,
              name: session.name,
              phone: session.phone,
              role: session.role,
            },
            courses,
            notifications: notifications.map((n) => ({
              ...n,
              createdAt: n.createdAt.toISOString(),
            })),
            certificates: certificates.map((c) => ({
              id: c.id,
              code: c.code,
              issuedAt: c.issuedAt.toISOString(),
              course: c.course,
            })),
          }}
        />
      </main>
      <Footer />
    </>
  );
}
