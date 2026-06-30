"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function VideoTransition() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Parallax effect: shift the video vertically as the user scrolls
  const y = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden bg-black"
    >
      <motion.div
        style={{ y }}
        className="absolute inset-0 w-full h-[140%] -top-[20%]"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/videos/mile-playable.mp4" type="video/mp4" />
        </video>
      </motion.div>
    </section>
  );
}
