"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "Is the beginner PCB course really free?",
    a: "Yes. Core beginner courses are free forever. Advanced / paid tracks will be optional later.",
  },
  {
    q: "Do I need hardware to start?",
    a: "No. You can learn schematic capture and layout with free tools like KiCad on any laptop. Hardware kits are optional.",
  },
  {
    q: "How do I talk to the instructor?",
    a: "After registering, use the student dashboard Chat or Voice Call buttons for 1-on-1 support — no phone number is shared.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes. Complete all lessons in a course and your certificate PDF unlocks automatically.",
  },
  {
    q: "Is OTP required to sign up?",
    a: "Not for now. Register with phone + password. OTP verification may be added later for extra security.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="card-surface overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-medium text-ink">{item.q}</span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-trace transition",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <p className="border-t border-line px-5 py-4 text-sm leading-relaxed text-muted">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const SYLLABUS = [
  {
    title: "Module 1 — PCB Fundamentals",
    items: ["Board layers & materials", "Schematic vs layout", "Design workflow"],
  },
  {
    title: "Module 2 — Schematic Capture",
    items: ["EDA tools overview", "Symbols & nets", "Electrical rules check"],
  },
  {
    title: "Module 3 — Layout & Routing",
    items: ["Footprints & placement", "Trace width & clearance", "Ground planes"],
  },
  {
    title: "Module 4 — Manufacturing",
    items: ["Gerber & drill files", "DFM checklist", "Working with fabs"],
  },
];

export function SyllabusAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {SYLLABUS.map((mod, i) => {
        const isOpen = open === i;
        return (
          <div key={mod.title} className="card-surface overflow-hidden">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="font-[family-name:var(--font-display)] font-semibold text-ink">
                {mod.title}
              </span>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-trace transition",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            {isOpen && (
              <ul className="space-y-2 border-t border-line px-5 py-4 text-sm text-muted">
                {mod.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-trace">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
