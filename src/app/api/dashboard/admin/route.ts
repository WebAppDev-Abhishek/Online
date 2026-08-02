import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalStudents,
      totalCourses,
      enrollments,
      conversations,
      recentStudents,
      courses,
      announcements,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.conversation.findMany({
        include: {
          student: { select: { id: true, name: true, phone: true } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
        orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      }),
      prisma.user.findMany({
        where: { role: "STUDENT" },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          createdAt: true,
          enrollments: {
            include: { course: { select: { title: true } } },
          },
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
        take: 10,
      }),
    ]);

    const completions = await prisma.certificate.count();
    const completionRate =
      enrollments === 0 ? 0 : Math.round((completions / enrollments) * 100);

    return jsonOk({
      analytics: {
        totalStudents,
        totalCourses,
        enrollments,
        completions,
        completionRate,
        activeConversations: conversations.length,
      },
      students: recentStudents,
      courses: courses.map((c) => ({
        ...c,
        lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
      })),
      conversations,
      announcements,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
