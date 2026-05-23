"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

type Update = {
  date: string;
  tag: string;
  title: string;
  body: string;
  accent: string;
};

const updates: Update[] = [
  {
    date: "Mar 2026",
    tag: "Award",
    title: "Winner — Manchester Cyber and AI Hackathon",
    body: "First place at the Manchester Cyber and AI Hackathon (with judges from Google, Barclays, Plexal, and Solid Bond) — validating the human-in-the-loop approach to robotics data.",
    accent: "bg-electric-violet/15",
  },
  {
    date: "Mar 2026",
    tag: "Research",
    title: "Direct market research with Innovate UK",
    body: "On the floor of the Robotics and Automation Exhibition, talking to industry buyers about the readiness problem.",
    accent: "bg-emerald-teal/15",
  },
  {
    date: "May 2026",
    tag: "Milestone",
    title: "Registered with Companies House",
    body: "Mile Robotics Ltd is formally incorporated in England and Wales — company number 17195589.",
    accent: "bg-electric-lime/15",
  },
  {
    date: "May 2026",
    tag: "Pilot",
    title: "Ongoing pilot with IceNine Robotics Limited",
    body: "Nuclear decommissioning robotics — applying the human data layer to one of the hardest, highest-stakes domains in the field.",
    accent: "bg-sky-blue/15",
  },
  {
    date: "Jul 2026",
    tag: "Programme",
    title:
      "Cohort 7 — Greater Manchester Digital Security Hub (DiSH) Accelerator",
    body: "Secured a slot in DiSH Accelerator (co-organised by Barclays Eagle Labs and Plexal) — deepening our work at the intersection of robotics and cybersecurity.",
    accent: "bg-coral/15",
  },
  {
    date: "From Jun 2026",
    tag: "Funding",
    title: "Non-dilutive grant funding round",
    body: "Pursuing UK and EU non-dilutive grants ahead of a SEIS / Pre-Seed round later in 2026.",
    accent: "bg-electric-violet/15",
  },
];

const AUTO_SCROLL_PX_PER_SEC = 28;
const RESUME_AFTER_IDLE_MS = 1500;

function UpdateCard({ u, ariaHidden }: { u: Update; ariaHidden?: boolean }) {
  return (
    <article
      aria-hidden={ariaHidden}
      className={`shrink-0 w-[280px] sm:w-[340px] md:w-[420px] rounded-2xl sm:rounded-3xl border border-white/10 ${u.accent} p-6 sm:p-7 md:p-8 backdrop-blur-sm`}
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
        <span>{u.date}</span>
        <span className="text-electric-lime">{u.tag}</span>
      </div>
      <h3 className="mt-6 text-xl md:text-2xl font-medium tracking-tightish leading-snug">
        {u.title}
      </h3>
      <p className="mt-4 text-sm md:text-base text-white/70 leading-relaxed">
        {u.body}
      </p>
    </article>
  );
}

export function Updates() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  // Pause auto-scroll, then resume after a brief idle window.
  // Single source of truth for the "user just touched it" debounce.
  const bumpPause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_IDLE_MS);
  };

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    let last = performance.now();
    let rafId = 0;
    // Sub-pixel accumulator — Chrome rounds scrollLeft to an integer, so
    // fractional per-frame increments would be lost. We accumulate the
    // fractional bits here and only flush whole pixels to scrollLeft.
    let acc = 0;

    const tick = (now: number) => {
      // Clamp dt — if the tab was backgrounded, the first frame after
      // refocus has a huge gap. Cap at one 30Hz frame to avoid jumps.
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      if (!pausedRef.current) {
        acc += AUTO_SCROLL_PX_PER_SEC * dt;
        const whole = Math.floor(acc);
        if (whole > 0) {
          el.scrollLeft += whole;
          acc -= whole;
        }
        // Seamless wrap — second half of the list is a duplicate, so
        // jumping back by halfWidth is invisible to the eye.
        const halfWidth = el.scrollWidth / 2;
        if (halfWidth > 0 && el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    // Pause on hover, resume immediately on leave
    const onEnter = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    const onLeave = () => {
      pausedRef.current = false;
    };
    const onWheel = () => bumpPause();
    // Touch: pause while finger is down, resume after lift
    const onTouchStart = onEnter;
    const onTouchEnd = () => bumpPause();

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: true });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    // Also pause when the tab is hidden (saves cycles, prevents drift)
    const onVisibility = () => {
      if (document.hidden) pausedRef.current = true;
      else bumpPause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const scrollByStep = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    bumpPause();
    const card = el.querySelector<HTMLElement>("article");
    const step = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  // Render the list twice so the auto-scroll can loop seamlessly.
  // The second pass is aria-hidden so screen readers don't read duplicates.
  return (
    <section
      id="updates"
      className="relative py-20 sm:py-28 md:py-36 border-t border-white/5 overflow-hidden"
    >
      <div className="mx-auto max-w-container px-5 sm:px-6 lg:px-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="eyebrow"
            >
              Updates
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
              className="headline mt-6 text-[clamp(2rem,4.5vw,3.5rem)] max-w-[22ch]"
            >
              Where we are right now.
            </motion.h2>

            <p className="subhead mt-6 max-w-[58ch]">
              Quiet, steady progress — pilots, awards, research, and the moments
              worth marking.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 shrink-0 mb-2">
            <button
              type="button"
              onClick={() => scrollByStep(-1)}
              aria-label="Scroll updates left"
              className="h-11 w-11 rounded-full border border-white/15 hover:border-electric-lime hover:text-electric-lime text-white/80 flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
                <path
                  d="M13 8H3M7 12 3 8l4-4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scrollByStep(1)}
              aria-label="Scroll updates right"
              className="h-11 w-11 rounded-full border border-white/15 hover:border-electric-lime hover:text-electric-lime text-white/80 flex items-center justify-center transition-colors"
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden>
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-12 sm:mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-black to-transparent" />

        <div
          ref={trackRef}
          className="
            flex gap-4 sm:gap-5
            overflow-x-auto overscroll-x-contain
            px-5 sm:px-6 lg:px-10
            pb-2
            no-scrollbar
          "
        >
          {updates.map((u) => (
            <UpdateCard key={`a-${u.title}`} u={u} />
          ))}
          {updates.map((u) => (
            <UpdateCard key={`b-${u.title}`} u={u} ariaHidden />
          ))}
        </div>
      </div>
    </section>
  );
}
