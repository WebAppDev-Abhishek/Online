import { prisma } from "@/lib/db";
import {
  createSessionToken,
  hashPassword,
  setSessionCookie,
} from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const limited = rateLimit(`register:${ip}`, 5, 60_000);
    if (!limited.ok) {
      return jsonError("Too many signup attempts. Try again shortly.", 429);
    }

    const body = await req.json();
    const data = registerSchema.parse({
      ...body,
      terms: body.terms === true || body.terms === "true",
    });

    const existing = await prisma.user.findUnique({
      where: { phone: data.phone },
    });
    if (existing) {
      return jsonError("An account with this phone number already exists", 409);
    }

    if (data.email) {
      const emailTaken = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (emailTaken) {
        return jsonError("An account with this email already exists", 409);
      }
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        phone: data.phone,
        email: data.email || null,
        passwordHash,
        role: "STUDENT",
      },
    });

    const sessionUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role as "STUDENT" | "ADMIN",
    };
    const token = await createSessionToken(sessionUser);
    await setSessionCookie(token);

    return jsonOk({ user: sessionUser }, 201);
  } catch (err) {
    return handleApiError(err);
  }
}
