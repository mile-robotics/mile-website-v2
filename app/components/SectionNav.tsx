"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

const sections = [
  { id: "hero", label: "Top" },
  { id: "problem", label: "Problem" },
  { id: "solution", label: "Solution" },
  { id: "updates", label: "Updates" },
  { id: "contact", label: "Contact" },
];

export function SectionNav({ visible }: { visible: boolean }) {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (!el) return;
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(s.id);
          });
        },
        // Trigger when the section's mid-line crosses the viewport mid-line
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      io.observe(el);
      observers.push(io);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <nav
      aria-label="Section navigation"
      className={clsx(
        "fixed right-4 md:right-6 top-1/2 -translate-y-1/2 z-40",
        "transition-all duration-300 ease-out",
        // Only show on tablet+ AND when top nav is hidden
        "hidden md:flex flex-col items-end gap-3",
        visible
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 translate-x-3 pointer-events-none"
      )}
    >
      {sections.map((s) => {
        const isActive = active === s.id;
        return (
          <a
            key={s.id}
            href={`#${s.id}`}
            aria-label={`Jump to ${s.label}`}
            aria-current={isActive ? "true" : undefined}
            className="group relative flex items-center gap-3 py-1"
          >
            {/* Label appears on hover */}
            <span
              className={clsx(
                "text-[11px] uppercase tracking-[0.2em] font-medium",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                isActive ? "text-electric-lime" : "text-white/70"
              )}
            >
              {s.label}
            </span>
            {/* The dot/pill */}
            <span
              className={clsx(
                "block rounded-full transition-all duration-300",
                isActive
                  ? "h-2 w-8 bg-electric-lime"
                  : "h-2 w-2 bg-white/30 group-hover:bg-white/70"
              )}
            />
          </a>
        );
      })}
    </nav>
  );
}
