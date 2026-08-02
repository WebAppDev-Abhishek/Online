import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const cert = await prisma.certificate.findFirst({
        where: { id, userId: user.id },
        include: {
          course: true,
          user: { select: { name: true } },
        },
      });
      if (!cert) return jsonError("Certificate not found", 404);
      return jsonOk({ certificate: cert });
    }

    const certificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: { course: { select: { title: true, slug: true } } },
    });
    return jsonOk({ certificates });
  } catch (err) {
    return handleApiError(err);
  }
}
