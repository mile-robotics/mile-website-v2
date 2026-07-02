"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const TOTAL_FRAMES = 240; // frame_000 → frame_239
const FRAME_PATH_PREFIX = "/images/image-sequence/frame_";

/**
 * Scroll-phase breakpoints (fraction of total 400vh scroll):
 *  0.00 → 0.65  Image sequence plays (frames 0–239)
 *  0.65 → 0.80  Content fades/slides IN, last frame stays
 *  0.80 → 0.92  Content fully visible, last frame stays
 *  0.92 → 1.00  Content fades OUT for clean transition to next section
 */
const SEQ_END = 0.65; // scroll fraction where image sequence finishes
const CONTENT_IN_START = 0.60; // content starts fading in (slight overlap)
const CONTENT_IN_END = 0.75; // content fully visible
const CONTENT_OUT_START = 0.88; // content starts fading out
const CONTENT_OUT_END = 1.0; // content fully gone

/** Build the src string for a given frame index (0-based). */
function frameSrc(index: number): string {
  const padded = String(index).padStart(3, "0");
  const delay = index % 3 === 2 ? "0.034s" : "0.033s";
  return `${FRAME_PATH_PREFIX}${padded}_delay-${delay}.png`;
}

/* ------------------------------------------------------------------ */
/*  Hook: preload every frame into an HTMLImageElement[]               */
/* ------------------------------------------------------------------ */
function usePreloadFrames() {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [firstLoaded, setFirstLoaded] = useState(false);

  useEffect(() => {
    const imgs: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let loadedCount = 0;

    const onLoad = () => {
      loadedCount++;
      if (loadedCount === 1) setFirstLoaded(true);
      if (loadedCount === TOTAL_FRAMES) setImages([...imgs]);
    };

    // Load frame 0 first (critical for initial paint)
    const first = new Image();
    first.src = frameSrc(0);
    first.onload = onLoad;
    imgs[0] = first;

    // Load remaining frames
    for (let i = 1; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      img.onload = onLoad;
      imgs[i] = img;
    }

    // Provide partial array immediately so drawing can start
    setImages(imgs);
  }, []);

  return { images, firstLoaded };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  const { images, firstLoaded } = usePreloadFrames();

  /* ---- Scroll tracking ---- */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* ---- Canvas sizing ---- */
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);

    // Redraw current frame after resize
    drawFrame(currentFrameRef.current);
  }, [images]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  /* ---- Draw a single frame to the canvas ---- */
  const drawFrame = useCallback(
    (frameIndex: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const img = images[frameIndex];
      if (!canvas || !ctx || !img || !img.complete || !img.naturalWidth) return;

      const cw = window.innerWidth;
      const ch = window.innerHeight;

      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;
      let drawW: number, drawH: number, dx: number, dy: number;

      if (imgRatio > canvasRatio) {
        drawH = ch;
        drawW = ch * imgRatio;
        dx = (cw - drawW) / 2;
        dy = 0;
      } else {
        drawW = cw;
        drawH = cw / imgRatio;
        dx = 0;
        dy = (ch - drawH) / 2;
      }

      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, drawW, drawH);
    },
    [images]
  );

  /* ---- Draw frame 0 once loaded ---- */
  useEffect(() => {
    if (firstLoaded) drawFrame(0);
  }, [firstLoaded, drawFrame]);

  /* ---- Map scroll progress → frame index ---- */
  /* Sequence plays across 0 → SEQ_END, then holds last frame */
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Remap: scroll 0→SEQ_END maps to frame 0→(TOTAL_FRAMES-1)
    const seqProgress = Math.min(1, Math.max(0, latest / SEQ_END));
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(seqProgress * TOTAL_FRAMES))
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        drawFrame(frameIndex);
        rafRef.current = null;
      });
    }
  });

  /* ---------------------------------------------------------------- */
  /*  Scroll-driven transforms for content reveal                     */
  /* ---------------------------------------------------------------- */

  // Overlay / aurora / grid: fade in as sequence ends, fade out at section end
  const overlayOpacity = useTransform(
    scrollYProgress,
    [CONTENT_IN_START, CONTENT_IN_END, CONTENT_OUT_START, CONTENT_OUT_END],
    [0, 1, 1, 0]
  );

  // Content: fade in + slide up after sequence, then fade out
  const contentOpacity = useTransform(
    scrollYProgress,
    [CONTENT_IN_START, CONTENT_IN_END, CONTENT_OUT_START, CONTENT_OUT_END],
    [0, 1, 1, 0]
  );
  const contentY = useTransform(
    scrollYProgress,
    [CONTENT_IN_START, CONTENT_IN_END, CONTENT_OUT_START, CONTENT_OUT_END],
    ["6%", "0%", "0%", "-8%"]
  );

  // Staggered reveals for individual content elements (eyebrow, h1, subhead, buttons)
  const eyebrowOpacity = useTransform(
    scrollYProgress,
    [CONTENT_IN_START, CONTENT_IN_START + 0.04, CONTENT_OUT_START, CONTENT_OUT_END],
    [0, 1, 1, 0]
  );
  const eyebrowY = useTransform(
    scrollYProgress,
    [CONTENT_IN_START, CONTENT_IN_START + 0.04],
    [12, 0]
  );

  const headlineOpacity = useTransform(
    scrollYProgress,
    [CONTENT_IN_START + 0.02, CONTENT_IN_START + 0.08, CONTENT_OUT_START, CONTENT_OUT_END],
    [0, 1, 1, 0]
  );
  const headlineY = useTransform(
    scrollYProgress,
    [CONTENT_IN_START + 0.02, CONTENT_IN_START + 0.08],
    [24, 0]
  );

  const subheadOpacity = useTransform(
    scrollYProgress,
    [CONTENT_IN_START + 0.05, CONTENT_IN_START + 0.1, CONTENT_OUT_START, CONTENT_OUT_END],
    [0, 1, 1, 0]
  );
  const subheadY = useTransform(
    scrollYProgress,
    [CONTENT_IN_START + 0.05, CONTENT_IN_START + 0.1],
    [16, 0]
  );

  const ctaOpacity = useTransform(
    scrollYProgress,
    [CONTENT_IN_START + 0.07, CONTENT_IN_START + 0.12, CONTENT_OUT_START, CONTENT_OUT_END],
    [0, 1, 1, 0]
  );
  const ctaY = useTransform(
    scrollYProgress,
    [CONTENT_IN_START + 0.07, CONTENT_IN_START + 0.12],
    [16, 0]
  );

  const scrollIndicatorOpacity = useTransform(
    scrollYProgress,
    [0, 0.01, CONTENT_IN_START - 0.05, CONTENT_IN_START],
    [1, 1, 1, 0]
  );

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative bg-black"
      style={{ height: "400vh" }}
    >
      {/* Sticky viewport container — stays fixed while user scrolls */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
        {/* Canvas — full-bleed background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 z-0"
          aria-hidden="true"
        />

        {/* Dark overlay for text legibility — hidden during sequence */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 z-[1] bg-black/50 pointer-events-none"
        />

        {/* Animated aurora + grid backdrop — hidden during sequence */}
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="aurora z-[2]"
          aria-hidden
        />
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="absolute inset-0 grid-backdrop opacity-50 z-[2]"
          aria-hidden
        />

        {/* Scroll indicator — visible during the sequence phase */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="hidden sm:flex absolute bottom-10 left-6 lg:left-10 z-[5] text-xs uppercase tracking-[0.2em] text-white/50 items-center gap-3"
        >
          <span className="block h-px w-10 bg-white/40" />
          Scroll
        </motion.div>

        {/* Hero content — reveals after image sequence finishes */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-[3] mx-auto max-w-container w-full px-5 sm:px-6 lg:px-10 pt-32 sm:pt-36 pb-20 sm:pb-24 h-full flex flex-col justify-center"
        >
          <motion.p
            style={{ opacity: eyebrowOpacity, y: eyebrowY }}
            className="eyebrow"
          >
            Multimodal Immersive Lab Environments
          </motion.p>

          <motion.h1
            style={{ opacity: headlineOpacity, y: headlineY }}
            className="headline mt-6 text-[clamp(2.25rem,6.5vw,6rem)] max-w-[18ch]"
          >
            The Human Data Layer for{" "}
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
            style={{ opacity: subheadOpacity, y: subheadY }}
            className="subhead mt-6 sm:mt-8 max-w-[58ch] text-base sm:text-lg md:text-xl"
          >
            We turn immersive, game-like simulations into training data for
            robots. Every action, hesitation, and correction becomes a signal
            that plugs straight into robot learning pipelines.
          </motion.p>

          <motion.div
            style={{ opacity: ctaOpacity, y: ctaY }}
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
        </motion.div>
      </div>
    </section>
  );
}
