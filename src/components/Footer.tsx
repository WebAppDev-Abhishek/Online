import Link from "next/link";
import { CircuitBoard, ExternalLink, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-line bg-elevated">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <CircuitBoard className="h-6 w-6 text-trace" />
            <span className="font-[family-name:var(--font-display)] text-xl font-bold">
              PCB<span className="text-trace">Online</span>
            </span>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Learn professional PCB design from scratch — free courses, live
            instructor chat, and in-browser voice support. Built for Indian
            makers and engineering students.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink">
            Explore
          </h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>
              <Link href="/courses" className="hover:text-trace">
                All Courses
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-trace">
                Register Free
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-trace">
                Student Login
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink">
            Contact
          </h4>
          <ul className="space-y-2 text-sm text-muted">
            <li>support@pcbonline.in</li>
            <li>+91 99999 99999</li>
            <li className="flex gap-3 pt-2">
              <a
                href="https://wa.me/919999999999"
                target="_blank"
                rel="noreferrer"
                className="text-trace hover:opacity-80"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-trace" aria-label="Social links">
                <ExternalLink className="h-5 w-5" />
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6">
          <p>© {new Date().getFullYear()} PCB Online. All rights reserved.</p>
          <p>Personal data handled per India&apos;s DPDP Act guidelines.</p>
        </div>
      </div>

      <a
        href="https://wa.me/919999999999"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105"
      >
        <MessageCircle className="h-5 w-5" />
        WhatsApp
      </a>
    </footer>
  );
}
