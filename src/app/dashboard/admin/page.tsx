import { redirect } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboardClient } from "@/components/AdminDashboardClient";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/dashboard/student");

  const [
    totalStudents,
    totalCourses,
    enrollments,
    completions,
    conversations,
    students,
    courses,
    announcements,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.course.count(),
    prisma.enrollment.count(),
    prisma.certificate.count(),
    prisma.conversation.count(),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        createdAt: true,
        enrollments: { include: { course: { select: { title: true } } } },
      },
    }),
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { enrollments: true } },
        modules: { include: { lessons: true } },
      },
    }),
    prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <AdminDashboardClient
          initial={{
            user: { id: session.id, name: session.name },
            analytics: {
              totalStudents,
              totalCourses,
              enrollments,
              completions,
              completionRate:
                enrollments === 0
                  ? 0
                  : Math.round((completions / enrollments) * 100),
              activeConversations: conversations,
            },
            students: students.map((s) => ({
              ...s,
              createdAt: s.createdAt.toISOString(),
            })),
            courses: courses.map((c) => ({
              id: c.id,
              title: c.title,
              slug: c.slug,
              level: c.level,
              isFree: c.isFree,
              lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
              _count: c._count,
            })),
            announcements: announcements.map((a) => ({
              ...a,
              createdAt: a.createdAt.toISOString(),
            })),
          }}
        />
      </main>
      <Footer />
    </>
  );
}
