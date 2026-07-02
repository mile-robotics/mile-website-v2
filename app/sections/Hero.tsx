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

/** Build the src string for a given frame index (0-based). */
function frameSrc(index: number): string {
  const padded = String(index).padStart(3, "0");
  // The delay portion varies slightly but follows this pattern
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
    // Use devicePixelRatio for crisp rendering on retina displays
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

      // Cover the viewport (object-fit: cover equivalent)
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;
      let drawW: number, drawH: number, dx: number, dy: number;

      if (imgRatio > canvasRatio) {
        // Image is wider — fit height, crop sides
        drawH = ch;
        drawW = ch * imgRatio;
        dx = (cw - drawW) / 2;
        dy = 0;
      } else {
        // Image is taller — fit width, crop top/bottom
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

  /* ---- Map scroll progress → frame index via motion event ---- */
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const frameIndex = Math.min(
      TOTAL_FRAMES - 1,
      Math.max(0, Math.floor(latest * TOTAL_FRAMES))
    );

    if (frameIndex !== currentFrameRef.current) {
      currentFrameRef.current = frameIndex;

      // Cancel any pending rAF to coalesce updates
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        drawFrame(frameIndex);
        rafRef.current = null;
      });
    }
  });

  /* ---- Content opacity fades out as user scrolls through ---- */
  const contentOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.35], ["0%", "-8%"]);

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

        {/* Dark overlay for text legibility */}
        <div className="absolute inset-0 z-[1] bg-black/50 pointer-events-none" />

        {/* Animated aurora + grid backdrop */}
        <div className="aurora z-[2]" aria-hidden />
        <div
          className="absolute inset-0 grid-backdrop opacity-50 z-[2]"
          aria-hidden
        />

        {/* Hero content */}
        <motion.div
          style={{ opacity: contentOpacity, y: contentY }}
          className="relative z-[3] mx-auto max-w-container w-full px-5 sm:px-6 lg:px-10 pt-32 sm:pt-36 pb-20 sm:pb-24 h-full flex flex-col justify-center"
        >
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
            transition={{
              duration: 0.9,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="subhead mt-6 sm:mt-8 max-w-[58ch] text-base sm:text-lg md:text-xl"
          >
            We turn immersive, game-like simulations into training data for
            robots. Every action, hesitation, and correction becomes a signal
            that plugs straight into robot learning pipelines.
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
        </motion.div>
      </div>
    </section>
  );
}
