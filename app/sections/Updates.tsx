"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Update = {
  date: string;
  tag: string;
  title: string;
  accent: string;
  image: string;
};

const updates: Update[] = [
  {
    date: "Mar 2026",
    tag: "Award",
    title: "Winner — Manchester Cyber and AI Hackathon",
    accent: "bg-electric-violet/15",
    image: "/updates/manchester-cyber-ai-hackathon.jpg",
  },
  {
    date: "Mar 2026",
    tag: "Research",
    title: "Direct market research with robotics industry leaders",
    accent: "bg-emerald-teal/15",
    image: "/updates/robotics-market-research.jpg",
  },
  {
    date: "May 2026",
    tag: "Pilot",
    title: "Ongoing pilot with Ice Nine Robotics",
    accent: "bg-sky-blue/15",
    image: "/updates/icenine-robotics-pilot.jpg",
  },
  {
    date: "Jul 2026",
    tag: "Programme",
    title:
      "Cohort 7 — Greater Manchester Digital Security Hub (DiSH) Accelerator",
    accent: "bg-coral/15",
    image: "/updates/dish-accelerator-cohort-7.jpg",
  },
];

/* ────────────────────────────────────────────────────────
   Bento layout engine
   
   4 structurally unique patterns for 4 items in a 2-col,
   3-row grid.  Each pattern has exactly one "wide" card
   (2 cols × 1 row) and one "tall" card (1 col × 2 rows),
   filling 6 cells perfectly (2 + 2 + 1 + 1 = 6).
   
   Combined with card shuffling → 4 patterns × 24 shuffles
   = 96 visually unique layouts per refresh.
──────────────────────────────────────────────────────── */

type GridPlacement = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

const BENTO_PATTERNS: GridPlacement[][] = [
  // A — Wide top, tall bottom-left
  //  ┌──────────────┐
  //  │  wide (2×1)  │
  //  ├──────┬───────┤
  //  │ tall │   ·   │
  //  │(1×2) ├───────┤
  //  │      │   ·   │
  //  └──────┴───────┘
  [
    { colStart: 1, colEnd: 3, rowStart: 1, rowEnd: 2 },
    { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 4 },
    { colStart: 2, colEnd: 3, rowStart: 2, rowEnd: 3 },
    { colStart: 2, colEnd: 3, rowStart: 3, rowEnd: 4 },
  ],

  // B — Wide top, tall bottom-right
  //  ┌──────────────┐
  //  │  wide (2×1)  │
  //  ├──────┬───────┤
  //  │   ·  │  tall │
  //  ├──────┤ (1×2) │
  //  │   ·  │       │
  //  └──────┴───────┘
  [
    { colStart: 1, colEnd: 3, rowStart: 1, rowEnd: 2 },
    { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3 },
    { colStart: 2, colEnd: 3, rowStart: 2, rowEnd: 4 },
    { colStart: 1, colEnd: 2, rowStart: 3, rowEnd: 4 },
  ],

  // C — Wide bottom, tall top-left
  //  ┌──────┬───────┐
  //  │ tall │   ·   │
  //  │(1×2) ├───────┤
  //  │      │   ·   │
  //  ├──────┴───────┤
  //  │  wide (2×1)  │
  //  └──────────────┘
  [
    { colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 3 },
    { colStart: 2, colEnd: 3, rowStart: 1, rowEnd: 2 },
    { colStart: 2, colEnd: 3, rowStart: 2, rowEnd: 3 },
    { colStart: 1, colEnd: 3, rowStart: 3, rowEnd: 4 },
  ],

  // D — Wide bottom, tall top-right
  //  ┌──────┬───────┐
  //  │   ·  │  tall │
  //  ├──────┤ (1×2) │
  //  │   ·  │       │
  //  ├──────┴───────┤
  //  │  wide (2×1)  │
  //  └──────────────┘
  [
    { colStart: 1, colEnd: 2, rowStart: 1, rowEnd: 2 },
    { colStart: 2, colEnd: 3, rowStart: 1, rowEnd: 3 },
    { colStart: 1, colEnd: 2, rowStart: 2, rowEnd: 3 },
    { colStart: 1, colEnd: 3, rowStart: 3, rowEnd: 4 },
  ],
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function isFeaturedSlot(p: GridPlacement): boolean {
  return p.colEnd - p.colStart > 1 || p.rowEnd - p.rowStart > 1;
}

/* ── Card ──────────────────────────────────────────── */

function BentoCard({
  update,
  placement,
  index,
}: {
  update: Update;
  placement: GridPlacement;
  index: number;
}) {
  const featured = isFeaturedSlot(placement);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.65,
        delay: 0.08 + index * 0.12,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="bento-card group relative rounded-xl sm:rounded-2xl overflow-hidden border border-white/[0.08] hover:border-white/[0.18] transition-[border-color,box-shadow] duration-500 cursor-default"
      style={
        {
          "--bento-col-start": placement.colStart,
          "--bento-col-end": placement.colEnd,
          "--bento-row-start": placement.rowStart,
          "--bento-row-end": placement.rowEnd,
        } as React.CSSProperties
      }
    >
      {/* Full-bleed image */}
      <div className="absolute inset-0">
        <Image
          src={update.image}
          alt={update.title}
          fill
          sizes={
            featured
              ? "(max-width: 768px) 100vw, 66vw"
              : "(max-width: 768px) 100vw, 33vw"
          }
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

      {/* Content */}
      <div
        className={`relative h-full flex flex-col justify-end ${featured ? "p-6 sm:p-8" : "p-5 sm:p-6"}`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-[10px] sm:text-[11px] px-2.5 py-1 rounded-full ${update.accent} backdrop-blur-sm text-white/80 uppercase tracking-[0.14em] font-medium`}
          >
            {update.tag}
          </span>
          <span className="text-[11px] text-white/40 tracking-wide">
            {update.date}
          </span>
        </div>
        <h3
          className={`mt-3 font-medium leading-snug text-white/90 ${
            featured
              ? "text-lg sm:text-xl lg:text-2xl max-w-[30ch]"
              : "text-base line-clamp-2"
          }`}
        >
          {update.title}
        </h3>
      </div>

      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl shadow-[inset_0_0_40px_rgba(169,240,0,0.03)]" />
    </motion.article>
  );
}

/* ── Section ───────────────────────────────────────── */

export function Updates() {
  const [layout, setLayout] = useState<{
    cards: Update[];
    pattern: GridPlacement[];
  } | null>(null);

  useEffect(() => {
    const shuffled = shuffleArray(updates);
    const pattern =
      BENTO_PATTERNS[Math.floor(Math.random() * BENTO_PATTERNS.length)];
    setLayout({ cards: shuffled, pattern });
  }, []);

  return (
    <section
      id="updates"
      className="relative py-20 sm:py-28 md:py-36 border-t border-white/5 overflow-hidden"
    >
      <div className="mx-auto max-w-container px-5 sm:px-6 lg:px-10">
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

        {/* Bento Grid */}
        <div className="bento-grid mt-12 sm:mt-16">
          {layout ? (
            layout.cards.map((update, i) => (
              <BentoCard
                key={update.title}
                update={update}
                placement={layout.pattern[i]}
                index={i}
              />
            ))
          ) : (
            /* Reserve space to prevent layout shift during hydration */
            <div className="col-span-full min-h-[600px] md:min-h-[700px]" />
          )}
        </div>
      </div>
    </section>
  );
}
