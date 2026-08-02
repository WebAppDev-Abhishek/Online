import { prisma } from "@/lib/db";
import { requireAdmin, requireUser } from "@/lib/auth";
import { messageSchema } from "@/lib/validations";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

async function getOrCreateConversation(studentId: string) {
  return prisma.conversation.upsert({
    where: { studentId },
    update: {},
    create: { studentId },
  });
}

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (user.role === "ADMIN") {
      if (!conversationId) {
        const list = await prisma.conversation.findMany({
          include: {
            student: { select: { id: true, name: true, phone: true } },
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
          orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
        });
        return jsonOk({ conversations: list });
      }

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, role: true } },
        },
      });

      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: user.id },
          readAt: null,
        },
        data: { readAt: new Date() },
      });

      return jsonOk({ messages });
    }

    // Student
    const conversation = await getOrCreateConversation(user.id);
    const messages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        senderId: { not: user.id },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return jsonOk({ conversation, messages });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const data = messageSchema.parse(body);

    let conversationId = data.conversationId;

    if (user.role === "STUDENT") {
      const conversation = await getOrCreateConversation(user.id);
      conversationId = conversation.id;
    } else {
      await requireAdmin();
      if (!conversationId) return jsonError("conversationId required");
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversationId!,
        senderId: user.id,
        body: data.body,
      },
      include: {
        sender: { select: { id: true, name: true, role: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId! },
      data: { updatedAt: new Date() },
    });

    // Notify the other party
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId! },
    });
    if (conversation) {
      const recipientId =
        user.role === "ADMIN" ? conversation.studentId : undefined;
      if (recipientId) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            title: "New message from instructor",
            body: data.body.slice(0, 120),
          },
        });
      } else if (user.role === "STUDENT") {
        const admins = await prisma.user.findMany({
          where: { role: "ADMIN" },
          select: { id: true },
        });
        await prisma.notification.createMany({
          data: admins.map((a) => ({
            userId: a.id,
            title: `Message from ${user.name}`,
            body: data.body.slice(0, 120),
          })),
        });
      }
    }

    return jsonOk({ message }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: Request) {
  try {
    await requireAdmin();
    const { conversationId, pinned, flagged } = await req.json();
    if (!conversationId) return jsonError("conversationId required");

    const conversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        ...(typeof pinned === "boolean" ? { pinned } : {}),
        ...(typeof flagged === "boolean" ? { flagged } : {}),
      },
    });

    return jsonOk({ conversation });
  } catch (err) {
    return handleApiError(err);
  }
}
