"use client";

import { motion } from "framer-motion";

type Update = {
  date: string;
  tag: string;
  title: string;
  body: string;
  accent: string;
};

// Sourced from the pitch deck "Traction" page
const updates: Update[] = [
  {
    date: "Mar 2026",
    tag: "Award",
    title: "Winner — Manchester Cyber and AI Hackathon",
    body: "First place at the Manchester Cyber and AI Hackathon — validating the human-in-the-loop approach to robotics data.",
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
    title: "Ongoing pilot with IceNine Robotics",
    body: "Nuclear decommissioning robotics — applying the human data layer to one of the hardest, highest-stakes domains in the field.",
    accent: "bg-sky-blue/15",
  },
  {
    date: "Jul 2026",
    tag: "Programme",
    title: "Cohort 7 — Greater Manchester Digital Security Accelerator",
    body: "Selected for the Greater Manchester Digital Security Accelerator — deepening our work at the intersection of robotics and security.",
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
      className={`shrink-0 w-[320px] md:w-[420px] rounded-3xl border border-white/8 ${u.accent} p-7 md:p-8 backdrop-blur-sm`}
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
  // Duplicate the row to create a seamless marquee loop
  const row = [...updates, ...updates];

  return (
    <section
      id="updates"
      className="relative py-28 md:py-36 border-t border-white/5 overflow-hidden"
    >
      <div className="mx-auto max-w-container px-6 lg:px-10">
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

      {/* Edge fade masks for the marquee */}
      <div className="relative mt-14">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 z-10 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 z-10 bg-gradient-to-l from-black to-transparent" />

        <div className="flex gap-5 animate-marquee w-max">
          {row.map((u, i) => (
            <UpdateCard key={`${u.title}-${i}`} u={u} />
          ))}
        </div>
      </div>
    </section>
  );
}
