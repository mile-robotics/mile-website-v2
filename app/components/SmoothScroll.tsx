"use client";

// Native wheel scroll for snappy feel.
// Anchor jumps (e.g. clicking nav links) get smooth behaviour from the
// `scroll-behavior: smooth` rule on <html> in globals.css.
// We intentionally do NOT hijack the wheel — users found Lenis sluggish.
export function SmoothScroll() {
  return null;
}
