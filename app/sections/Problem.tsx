"use client";

import { motion } from "framer-motion";

const stats = [
  {
    value: "£21B+",
    label: "Private capital into robotics in 2025 — more than 2× the year before.",
    cite: "PitchBook, 2025",
  },
  {
    value: "4+ months at £250K+",
    label:
      "Proving readiness requires a physical pilot, often unsafe/barred in regulated sites.",
    cite: "Interact Analysis, The Mobile Robot Market Report, 2026",
  },
  {
    value: "61%",
    label:
      "Share of robotics teams that report lacking the internal capability to scale robotics beyond the pilot phase — the gap Mile's readiness infrastructure closes.",
    cite: "McKinsey & Company, The Robotics Revolution: Scaling Beyond the Pilot Phase, 2025",
  },
];

export function Problem() {
  return (
    <section
      id="problem"
      className="relative py-20 sm:py-28 md:py-36 border-t border-white/5"
    >
      <div className="mx-auto max-w-container px-5 sm:px-6 lg:px-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="eyebrow"
        >
          The Problem
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="headline mt-6 text-[clamp(2rem,4.5vw,3.75rem)] max-w-[24ch]"
        >
          The robots of today are not ready for the real world.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="subhead mt-8 max-w-[64ch] text-lg"
        >
          Industries are scaling robotics teams faster than ever. But the
          environments they actually deploy into are messy, unpredictable, and
          constantly changing. Human decision-making is still the best way for
          robots to adapt. That data doesn’t exist at scale, and physical AI
          training is too slow and expensive.
        </motion.p>

        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-2xl sm:rounded-3xl overflow-hidden">
          {stats.map((s, i) => (
            <motion.div
              key={s.value}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="bg-surface-raised p-6 sm:p-8 md:p-10 flex flex-col"
            >
              <div className="text-[clamp(2.25rem,5vw,3.5rem)] font-medium tracking-tightish text-electric-lime">
                {s.value}
              </div>
              <p className="mt-4 text-white/70 text-sm md:text-base leading-relaxed">
                {s.label}
              </p>
              <p className="mt-auto pt-6 text-[11px] uppercase tracking-[0.18em] text-white/35">
                Source — {s.cite}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
