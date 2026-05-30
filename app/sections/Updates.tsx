"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

type Update = {
  date: string;
  tag: string;
  title: string;
  accent: string;
  image: string;
};

const row1Updates: Update[] = [
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
    title: "Ongoing pilot with IceNine Robotics Limited",
    accent: "bg-sky-blue/15",
    image: "/updates/icenine-robotics-pilot.jpg",
  },
  {
    date: "Jul 2026",
    tag: "Programme",
    title: "Cohort 7 — Greater Manchester Digital Security Hub (DiSH) Accelerator",
    accent: "bg-coral/15",
    image: "/updates/dish-accelerator-cohort-7.jpg",
  },
];

// TODO: Re-enable row2Updates when ready
// const row2Updates: Update[] = [
//   {
//     date: "Mar 2026",
//     tag: "Award",
//     title: "Winner — Manchester Cyber and AI Hackathon",
//     accent: "bg-electric-violet/15",
//     image: "/updates/manchester-cyber-ai-hackathon.jpg",
//   },
//   {
//     date: "Mar 2026",
//     tag: "Research",
//     title: "Direct market research with robotics industry leaders",
//     accent: "bg-emerald-teal/15",
//     image: "/updates/robotics-market-research.jpg",
//   },
//   {
//     date: "May 2026",
//     tag: "Milestone",
//     title: "Registered with Companies House",
//     accent: "bg-electric-lime/15",
//     image: "/updates/companies-house-registration.jpg",
//   },
//   {
//     date: "May 2026",
//     tag: "Pilot",
//     title: "Ongoing pilot with IceNine Robotics Limited",
//     accent: "bg-sky-blue/15",
//     image: "/updates/icenine-robotics-pilot.jpg",
//   },
//   {
//     date: "Jul 2026",
//     tag: "Programme",
//     title: "Cohort 7 — Greater Manchester Digital Security Hub (DiSH) Accelerator",
//     accent: "bg-coral/15",
//     image: "/updates/dish-accelerator-cohort-7.jpg",
//   },
//   {
//     date: "From Jun 2026",
//     tag: "Funding",
//     title: "Non-dilutive grant funding round",
//     accent: "bg-electric-violet/15",
//     image: "/updates/grant-funding-round.jpg",
//   },
// ];

const AUTO_SCROLL_PX_PER_SEC = 28;
const RESUME_AFTER_IDLE_MS = 1500;

function UpdateCard({ u, ariaHidden }: { u: Update; ariaHidden?: boolean }) {
  return (
    <article
      aria-hidden={ariaHidden}
      className={`shrink-0 w-[200px] sm:w-[230px] md:w-[260px] rounded-xl sm:rounded-2xl border border-white/10 ${u.accent} overflow-hidden backdrop-blur-sm`}
    >
      <div className="relative w-full aspect-video bg-white/5">
        <Image
          src={u.image}
          alt={u.title}
          fill
          sizes="(max-width: 640px) 200px, (max-width: 768px) 230px, 260px"
          className="object-cover"
        />
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/50">
          <span>{u.date}</span>
          <span className="text-electric-lime">{u.tag}</span>
        </div>
        <h3 className="mt-3 text-base font-medium leading-snug line-clamp-2">
          {u.title}
        </h3>
      </div>
    </article>
  );
}

export function Updates() {
  const track1Ref = useRef<HTMLDivElement>(null);
  // const track2Ref = useRef<HTMLDivElement>(null); // TODO: Re-enable with row2
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const bumpPause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_AFTER_IDLE_MS);
  };

  useEffect(() => {
    const el1 = track1Ref.current;
    // const el2 = track2Ref.current; // TODO: Re-enable with row2
    if (!el1) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    // TODO: Re-enable with row2
    // el2.scrollLeft = el2.scrollWidth / 2;

    let last = performance.now();
    let rafId = 0;
    let acc1 = 0;
    // let acc2 = 0; // TODO: Re-enable with row2

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      if (!pausedRef.current) {
        // Row 1 — scrolls left
        acc1 += AUTO_SCROLL_PX_PER_SEC * dt;
        const whole1 = Math.floor(acc1);
        if (whole1 > 0) {
          el1.scrollLeft += whole1;
          acc1 -= whole1;
        }
        const half1 = el1.scrollWidth / 2;
        if (half1 > 0 && el1.scrollLeft >= half1) {
          el1.scrollLeft -= half1;
        }

        // TODO: Re-enable with row2
        // // Row 2 — scrolls right
        // acc2 += AUTO_SCROLL_PX_PER_SEC * dt;
        // const whole2 = Math.floor(acc2);
        // if (whole2 > 0) {
        //   el2.scrollLeft -= whole2;
        //   acc2 -= whole2;
        // }
        // const half2 = el2.scrollWidth / 2;
        // if (half2 > 0 && el2.scrollLeft <= 0) {
        //   el2.scrollLeft += half2;
        // }
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const onEnter = () => {
      pausedRef.current = true;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
    const onLeave = () => { pausedRef.current = false; };
    const onWheel = () => bumpPause();
    const onTouchStart = onEnter;
    const onTouchEnd = () => bumpPause();

    [el1].forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
      el.addEventListener("wheel", onWheel, { passive: true });
      el.addEventListener("touchstart", onTouchStart, { passive: true });
      el.addEventListener("touchend", onTouchEnd);
    });

    const onVisibility = () => {
      if (document.hidden) pausedRef.current = true;
      else bumpPause();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      [el1].forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("touchstart", onTouchStart);
        el.removeEventListener("touchend", onTouchEnd);
      });
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
      </div>

      <div className="relative mt-12 sm:mt-14 flex flex-col gap-6">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-12 sm:w-24 z-10 bg-gradient-to-r from-black to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-12 sm:w-24 z-10 bg-gradient-to-l from-black to-transparent" />

        {/* Row 1 — scrolls left */}
        <div
          ref={track1Ref}
          className="flex gap-6 overflow-x-auto overscroll-x-contain px-5 sm:px-6 lg:px-10 no-scrollbar"
        >
          {row1Updates.map((u) => (
            <UpdateCard key={`a-${u.title}`} u={u} />
          ))}
          {row1Updates.map((u) => (
            <UpdateCard key={`b-${u.title}`} u={u} ariaHidden />
          ))}
        </div>

        {/* TODO: Re-enable Row 2 when ready */}
        {/* <div
          ref={track2Ref}
          className="flex gap-6 overflow-x-auto overscroll-x-contain px-5 sm:px-6 lg:px-10 no-scrollbar"
        >
          {row2Updates.map((u) => (
            <UpdateCard key={`a-${u.title}`} u={u} />
          ))}
          {row2Updates.map((u) => (
            <UpdateCard key={`b-${u.title}`} u={u} ariaHidden />
          ))}
        </div> */}
      </div>
    </section>
  );
}
