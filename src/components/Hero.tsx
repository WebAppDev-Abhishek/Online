import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { PcbBackground } from "./PcbBackground";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <PcbBackground />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-center px-4 py-20 sm:px-6">
        <p className="animate-fade-up mb-4 font-[family-name:var(--font-display)] text-sm font-semibold uppercase tracking-[0.2em] text-trace">
          PCB Online
        </p>
        <h1 className="animate-fade-up max-w-3xl font-[family-name:var(--font-display)] text-4xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl md:text-6xl"
          style={{ animationDelay: "0.1s" }}
        >
          Learn PCB Design From Scratch —{" "}
          <span className="text-trace">Free</span>
        </h1>
        <p
          className="animate-fade-up mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
          style={{ animationDelay: "0.2s" }}
        >
          Schematic capture, layout, routing, and manufacturing — taught by a
          working instructor with live chat and voice support.
        </p>
        <div
          className="animate-fade-up mt-10 flex flex-wrap gap-3"
          style={{ animationDelay: "0.3s" }}
        >
          <Link href="/register" className="btn-primary">
            Register Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/courses" className="btn-ghost">
            <Play className="h-4 w-4 text-trace" />
            Explore Courses
          </Link>
        </div>
      </div>
    </section>
  );
}
