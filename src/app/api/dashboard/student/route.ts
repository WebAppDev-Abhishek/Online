import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { calcProgress } from "@/lib/utils";
import { jsonOk, handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireUser();

    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            modules: { include: { lessons: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: { course: { select: { title: true, slug: true } } },
    });

    const courses = await Promise.all(
      enrollments.map(async (e) => {
        const lessonIds = e.course.modules.flatMap((m) =>
          m.lessons.map((l) => l.id)
        );
        const completed = await prisma.lessonProgress.count({
          where: {
            userId: user.id,
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
          thumbnail: e.course.thumbnail,
          enrolledAt: e.createdAt,
          totalLessons: lessonIds.length,
          completedLessons: completed,
          percent: calcProgress(completed, lessonIds.length),
        };
      })
    );

    return jsonOk({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      courses,
      notifications,
      certificates,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
