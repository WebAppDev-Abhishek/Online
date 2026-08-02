"use client";

import { useEffect, useState } from "react";
import { Quote } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Ananya S.",
    role: "ECE Student, Pune",
    text: "I went from zero KiCad knowledge to submitting my first board for fab in three weeks. The instructor chat saved me on routing issues.",
  },
  {
    name: "Vikram M.",
    role: "Maker, Bengaluru",
    text: "Clear lessons, practical DFM tips, and voice support when I got stuck. Best free PCB resource I've found.",
  },
  {
    name: "Priya R.",
    role: "Junior Hardware Eng.",
    text: "The syllabus matches real lab work. Certificates and progress tracking kept me motivated through the modules.",
  },
];

export function Testimonials() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(
      () => setIndex((i) => (i + 1) % TESTIMONIALS.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  const t = TESTIMONIALS[index];

  return (
    <div className="card-surface relative overflow-hidden p-8 sm:p-10">
      <Quote className="absolute right-6 top-6 h-12 w-12 text-trace/20" />
      <p className="max-w-2xl text-lg leading-relaxed text-ink">&ldquo;{t.text}&rdquo;</p>
      <div className="mt-6">
        <p className="font-semibold text-trace">{t.name}</p>
        <p className="text-sm text-muted">{t.role}</p>
      </div>
      <div className="mt-6 flex gap-2">
        {TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Show testimonial ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 w-2 rounded-full transition ${
              i === index ? "bg-trace" : "bg-line"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
