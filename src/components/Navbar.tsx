import Link from "next/link";
import { CircuitBoard } from "lucide-react";
import { getSession } from "@/lib/auth";

export async function Navbar() {
  const user = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-trace/30 bg-trace/5 text-trace transition group-hover:shadow-[0_8px_20px_rgba(10,37,64,0.15)]">
            <CircuitBoard className="h-5 w-5" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight">
            PCB<span className="text-trace">Online</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted md:flex">
          <Link href="/#courses" className="hover:text-ink transition">
            Courses
          </Link>
          <Link href="/#why" className="hover:text-ink transition">
            Why PCB
          </Link>
          <Link href="/#instructor" className="hover:text-ink transition">
            Instructor
          </Link>
          <Link href="/#faq" className="hover:text-ink transition">
            FAQ
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link
              href={
                user.role === "ADMIN"
                  ? "/dashboard/admin"
                  : "/dashboard/student"
              }
              className="btn-primary !py-2 !px-4 text-sm"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-muted hover:text-ink sm:inline"
              >
                Login
              </Link>
              <Link href="/register" className="btn-primary !py-2 !px-4 text-sm">
                Register Free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
