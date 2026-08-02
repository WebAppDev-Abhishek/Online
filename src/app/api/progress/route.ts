import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const { lessonId } = await req.json();
    if (!lessonId) return jsonError("lessonId required");

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) return jsonError("Lesson not found", 404);

    const enrolled = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: lesson.module.courseId,
        },
      },
    });
    if (!enrolled) return jsonError("Enroll in the course first", 403);

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId: user.id, lessonId },
      },
      update: { completed: true, completedAt: new Date() },
      create: {
        userId: user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    // Auto-issue certificate when all lessons done
    const courseId = lesson.module.courseId;
    const allLessons = await prisma.lesson.findMany({
      where: { module: { courseId } },
      select: { id: true },
    });
    const done = await prisma.lessonProgress.count({
      where: {
        userId: user.id,
        completed: true,
        lessonId: { in: allLessons.map((l) => l.id) },
      },
    });

    let certificate = null;
    if (done >= allLessons.length && allLessons.length > 0) {
      const code = `PCB-${user.id.slice(-4).toUpperCase()}-${courseId.slice(-6).toUpperCase()}`;
      certificate = await prisma.certificate.upsert({
        where: {
          userId_courseId: { userId: user.id, courseId },
        },
        update: {},
        create: { userId: user.id, courseId, code },
      });
    }

    return jsonOk({ progress, certificate });
  } catch (err) {
    return handleApiError(err);
  }
}
