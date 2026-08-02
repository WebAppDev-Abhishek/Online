import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const { title, body } = await req.json();
    if (!title?.trim() || !body?.trim()) {
      return jsonError("Title and body required");
    }

    const announcement = await prisma.announcement.create({
      data: { title: title.trim(), body: body.trim() },
    });

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true },
    });

    if (students.length) {
      await prisma.notification.createMany({
        data: students.map((s) => ({
          userId: s.id,
          title: `Announcement: ${announcement.title}`,
          body: announcement.body.slice(0, 200),
        })),
      });
    }

    return jsonOk({ announcement }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
