import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser();
    const { id } = await params;

    const course = await prisma.course.findFirst({
      where: { OR: [{ id }, { slug: id }], isPublished: true },
    });
    if (!course) return jsonError("Course not found", 404);
    if (!course.isFree) {
      return jsonError("Paid enrollment coming soon", 402);
    }

    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: { userId: user.id, courseId: course.id },
      },
      update: {},
      create: { userId: user.id, courseId: course.id },
    });

    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Enrollment confirmed",
        body: `You're enrolled in "${course.title}". Start learning anytime.`,
      },
    });

    return jsonOk({ enrollment });
  } catch (err) {
    return handleApiError(err);
  }
}
