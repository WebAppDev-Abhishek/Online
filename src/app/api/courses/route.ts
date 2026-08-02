import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "asc" },
      include: {
        modules: {
          include: { lessons: true },
          orderBy: { order: "asc" },
        },
        _count: { select: { enrollments: true } },
      },
    });

    const session = await getSession();
    let enrolledIds: string[] = [];
    if (session) {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId: session.id },
        select: { courseId: true },
      });
      enrolledIds = enrollments.map((e) => e.courseId);
    }

    return jsonOk({
      courses: courses.map((c) => ({
        ...c,
        lessonCount: c.modules.reduce((n, m) => n + m.lessons.length, 0),
        enrolled: enrolledIds.includes(c.id),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}
