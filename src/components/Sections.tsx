import {
  Cpu,
  Layers,
  MessageSquare,
  Mic,
  ShieldCheck,
  Workflow,
} from "lucide-react";
import Link from "next/link";

const BENEFITS = [
  {
    icon: Layers,
    title: "End-to-end PCB workflow",
    text: "From schematic to Gerber — structured modules, not random YouTube clips.",
  },
  {
    icon: Cpu,
    title: "Industry-aligned tools",
    text: "Practice with KiCad and manufacturing-ready design rules used in real fabs.",
  },
  {
    icon: MessageSquare,
    title: "Instructor chat",
    text: "Stuck on a net or footprint? Message the admin directly from your dashboard.",
  },
  {
    icon: Mic,
    title: "In-browser voice calls",
    text: "Talk through layout issues in real time — no phone numbers exposed.",
  },
  {
    icon: Workflow,
    title: "Quizzes & certificates",
    text: "Module quizzes lock in concepts; finish the course to download your cert.",
  },
  {
    icon: ShieldCheck,
    title: "Mobile-first & secure",
    text: "Phone + password auth with rate limiting and httpOnly session cookies.",
  },
];

export function WhySection() {
  return (
    <section id="why" className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink sm:text-4xl">
          Why Learn PCB Design
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Hardware careers start with boards you can actually manufacture. We
          teach the craft with live support — not just recorded dumps.
        </p>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b) => (
            <div
              key={b.title}
              className="card-surface p-6 transition hover:border-trace/40"
            >
              <b.icon className="mb-4 h-7 w-7 text-trace" />
              <h3 className="font-semibold text-ink">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstructorSection() {
  return (
    <section id="instructor" className="border-b border-line bg-elevated/40">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-card">
          <div className="pcb-grid absolute inset-0" />
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full border-2 border-trace bg-trace/10 font-[family-name:var(--font-display)] text-3xl font-bold text-trace">
              RK
            </div>
            <p className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold">
              Rajesh Kumar
            </p>
            <p className="mt-1 text-sm text-muted">
              Senior PCB Design Instructor
            </p>
          </div>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold text-ink">
            Meet your instructor
          </h2>
          <p className="mt-4 leading-relaxed text-muted">
            8+ years designing multi-layer boards for IoT and industrial
            products. Former fab liaison, KiCad community mentor, and patient
            teacher who answers student questions via chat and voice every week.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span className="text-trace">▸</span> IPC-aware design practices
            </li>
            <li className="flex gap-2">
              <span className="text-trace">▸</span> 50+ boards taken to production
            </li>
            <li className="flex gap-2">
              <span className="text-trace">▸</span> Available for 1-on-1 doubt clearing
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function ChatBanner() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="relative overflow-hidden rounded-2xl border border-trace/20 bg-gradient-to-r from-elevated via-white to-elevated p-8 sm:p-12">
          <div className="pcb-grid absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink sm:text-3xl">
              Chat with our instructor
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              Questions on footprints, ERC, or fab quotes? Reach the admin
              instantly from your student dashboard — text or voice.
            </p>
            <Link href="/register" className="btn-primary mt-8 inline-flex">
              Get started free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
