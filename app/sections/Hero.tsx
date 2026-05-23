"use client";

import { motion } from "framer-motion";

export function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate overflow-hidden min-h-[100svh] flex items-center"
    >
      {/* Animated aurora + grid backdrop */}
      <div className="aurora" aria-hidden />
      <div className="absolute inset-0 grid-backdrop opacity-50" aria-hidden />

      {/*
        Video banner slot — drop /public/hero.mp4 to enable.
        Hidden until a video file is provided so we don't render an empty placeholder.
      */}
      <video
        className="absolute inset-0 z-[-1] h-full w-full object-cover opacity-40 mix-blend-screen [&:not([data-loaded])]:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedData={(e) =>
          (e.currentTarget as HTMLVideoElement).setAttribute("data-loaded", "true")
        }
        aria-hidden
      >
        <source src="/hero.mp4" type="video/mp4" />
      </video>

      <div className="relative mx-auto max-w-container w-full px-5 sm:px-6 lg:px-10 pt-32 sm:pt-36 pb-20 sm:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="eyebrow"
        >
          Multimodal Immersive Lab Environments
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="headline mt-6 text-[clamp(2.25rem,7vw,6.5rem)] max-w-[18ch]"
        >
          A Human Data Layer for{" "}
          <span className="bg-gradient-1 bg-clip-text text-transparent animate-gradient-pan [background-size:200%_200%]">
            Robotics
          </span>{" "}
          and{" "}
          <span className="bg-gradient-3 bg-clip-text text-transparent animate-gradient-pan [background-size:200%_200%] [animation-delay:-3s]">
            Physical AI
          </span>
          .
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.45 }}
          className="subhead mt-6 sm:mt-8 max-w-[58ch] text-base sm:text-lg md:text-xl"
        >
          We turn immersive, game-like simulations into training data for
          robots. Every action, hesitation, and correction becomes a signal that
          plugs straight into robot learning pipelines.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-white text-black hover:bg-electric-lime transition-colors"
          >
            Get in Touch
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 8h10M9 4l4 4-4 4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a
            href="#solution"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium border border-white/20 text-white hover:border-electric-lime hover:text-electric-lime transition-colors"
          >
            See how it works
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="hidden sm:flex absolute bottom-10 left-6 lg:left-10 text-xs uppercase tracking-[0.2em] text-white/50 items-center gap-3"
        >
          <span className="block h-px w-10 bg-white/40" />
          Scroll
        </motion.div>
      </div>
    </section>
  );
}
