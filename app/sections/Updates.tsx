"use client";

import { useRef } from "react";
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

function UpdateCard({ u }: { u: Update }) {
  return (
    <article
      className={`shrink-0 snap-start w-[280px] sm:w-[340px] md:w-[420px] rounded-2xl sm:rounded-3xl border border-white/10 ${u.accent} p-6 sm:p-7 md:p-8 backdrop-blur-sm`}
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

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("article");
    const step = (card?.offsetWidth ?? 320) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

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

          {/* Desktop scroll controls */}
          <div className="hidden md:flex items-center gap-2 shrink-0 mb-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
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
              onClick={() => scrollBy(1)}
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

      {/* Edge fade masks + scroll track */}
      <div className="relative mt-12 sm:mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-black to-transparent" />

        <div
          ref={trackRef}
          className="
            flex gap-4 sm:gap-5
            overflow-x-auto overscroll-x-contain
            snap-x snap-mandatory
            scroll-pl-5 sm:scroll-pl-6 lg:scroll-pl-10
            scroll-pr-5 sm:scroll-pr-6 lg:scroll-pr-10
            px-5 sm:px-6 lg:px-10
            pb-4
            [scrollbar-width:thin]
            [&::-webkit-scrollbar]:h-1.5
            [&::-webkit-scrollbar-thumb]:bg-white/15
            [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-track]:bg-transparent
          "
        >
          {updates.map((u) => (
            <UpdateCard key={u.title} u={u} />
          ))}
        </div>
      </div>
    </section>
  );
}
