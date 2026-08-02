import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
        _count: { select: { enrollments: true } },
      },
    });

    if (!course) return jsonError("Course not found", 404);

    const session = await getSession();
    let enrolled = false;
    let progress: Record<string, boolean> = {};

    if (session) {
      const enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: { userId: session.id, courseId: course.id },
        },
      });
      enrolled = !!enrollment;

      const lessonIds = course.modules.flatMap((m) =>
        m.lessons.map((l) => l.id)
      );
      const done = await prisma.lessonProgress.findMany({
        where: { userId: session.id, lessonId: { in: lessonIds }, completed: true },
      });
      progress = Object.fromEntries(done.map((d) => [d.lessonId, true]));
    }

    return jsonOk({ course, enrolled, progress });
  } catch (err) {
    return handleApiError(err);
  }
}
