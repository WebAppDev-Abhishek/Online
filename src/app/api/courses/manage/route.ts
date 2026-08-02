import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { courseSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const data = courseSchema.parse(body);
    const base = slugify(data.title);
    let slug = base;
    let i = 1;
    while (await prisma.course.findUnique({ where: { slug } })) {
      slug = `${base}-${i++}`;
    }

    const course = await prisma.course.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        level: data.level,
        duration: data.duration,
        isFree: data.isFree,
        thumbnail: data.thumbnail,
      },
    });

    return jsonOk({ course }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: Request) {
  try {
    await requireAdmin();
    const body = await req.json();
    const { id, ...rest } = body;
    if (!id) return jsonError("Course id required");
    const data = courseSchema.partial().parse(rest);
    const course = await prisma.course.update({
      where: { id },
      data,
    });
    return jsonOk({ course });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return jsonError("Course id required");
    await prisma.course.delete({ where: { id } });
    return jsonOk({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
