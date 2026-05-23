"use client";

import { motion } from "framer-motion";

const cards = [
  {
    title: "Immersive Simulations",
    body: "Game-like environments on Desktop, VR, and Mobile. Domain-specific scenarios in sectors such as clean energy, space, and construction — built to feel like the real thing.",
    accent: "from-electric-violet/50 to-transparent",
  },
  {
    title: "Human Data Capture",
    body: "Every choice, hesitation, correction, and recovery is logged. The pause before a risky decision is signal, not noise — and we treat it that way.",
    accent: "from-emerald-teal/50 to-transparent",
  },
  {
    title: "Robot Learning Pipelines",
    body: "Data plugs straight into modern policy learning stacks. Improve sample efficiency on the hard, long-tail moments that physical pilots can’t reach.",
    accent: "from-sky-blue/50 to-transparent",
  },
  {
    title: "Deployment-Readiness Verdict",
    body: "A scientifically grounded readiness score — peer-reviewed methodology, reproducible runs — so teams can prove a robot is ready before it ever leaves the lab.",
    accent: "from-electric-lime/50 to-transparent",
  },
];

const steps = [
  {
    n: "01",
    label: "Build the world",
    text: "Recreate the customer’s site as an interactive digital twin.",
  },
  {
    n: "02",
    label: "Play the scenarios",
    text: "Humans and autonomous robots navigate through gamified missions and unpredictable events.",
  },
  {
    n: "03",
    label: "Capture the signal",
    text: "Decisions, recoveries, and edge cases become structured data.",
  },
  {
    n: "04",
    label: "Train and verify",
    text: "Feed the pipeline. Score readiness. Repeat.",
  },
];

export function Solution() {
  return (
    <section
      id="solution"
      className="relative py-20 sm:py-28 md:py-36 border-t border-white/5"
    >
      <div className="mx-auto max-w-container px-5 sm:px-6 lg:px-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="eyebrow"
        >
          The Solution
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="headline mt-6 text-[clamp(2rem,4.5vw,3.75rem)] max-w-[22ch]"
        >
          Next generation data infrastructure for robotics and physical AI —
          built to be auditable, scientific, and accessible.
        </motion.h2>

        {/* Solution cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {cards.map((c, i) => (
            <motion.article
              key={c.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="card-surface group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 transition-all hover:-translate-y-1 hover:border-white/20"
            >
              <div
                className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${c.accent} opacity-0 group-hover:opacity-100 transition-opacity blur-2xl pointer-events-none`}
              />
              <div className="relative">
                <div className="text-electric-lime text-xs uppercase tracking-[0.2em] font-medium">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mt-4 text-2xl md:text-3xl font-medium tracking-tightish">
                  {c.title}
                </h3>
                <p className="mt-4 text-white/70 leading-relaxed">{c.body}</p>
              </div>
            </motion.article>
          ))}
        </div>

        {/* How it flows */}
        <div className="mt-16 sm:mt-20 rounded-2xl sm:rounded-3xl border border-white/10 bg-surface-raised p-6 sm:p-8 md:p-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative"
              >
                <div className="text-white/40 text-sm tracking-[0.2em]">
                  {s.n}
                </div>
                <div className="mt-3 text-lg font-medium text-white">
                  {s.label}
                </div>
                <p className="mt-2 text-sm text-white/60 leading-relaxed">
                  {s.text}
                </p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-2 right-[-1rem] h-px w-8 bg-gradient-to-r from-white/20 to-transparent" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
