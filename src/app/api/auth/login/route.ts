import { prisma } from "@/lib/db";
import {
  createSessionToken,
  setSessionCookie,
  verifyPassword,
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";
import { jsonError, jsonOk, handleApiError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    const limited = rateLimit(`login:${ip}`, 10, 60_000);
    if (!limited.ok) {
      return jsonError("Too many login attempts. Try again shortly.", 429);
    }

    const body = await req.json();
    const data = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (!user) {
      return jsonError("Invalid phone number or password", 401);
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return jsonError("Invalid phone number or password", 401);
    }

    const sessionUser = {
      id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role as "STUDENT" | "ADMIN",
    };
    const token = await createSessionToken(sessionUser, !!data.remember);
    await setSessionCookie(token, !!data.remember);

    return jsonOk({ user: sessionUser });
  } catch (err) {
    return handleApiError(err);
  }
}
