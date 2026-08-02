import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonOk, handleApiError } from "@/lib/api";

export async function PATCH() {
  try {
    const user = await requireUser();
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
