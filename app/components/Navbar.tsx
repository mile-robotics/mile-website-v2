"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";

const links = [
  { href: "#problem", label: "Problem" },
  { href: "#solution", label: "Solution" },
  { href: "#updates", label: "Updates" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Hide on scroll down, show on scroll up
      if (y > 80 && y > lastY) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-out",
        hidden && !mobileOpen ? "nav-hidden" : "translate-y-0",
        scrolled
          ? "backdrop-blur-md bg-black/55 border-b border-white/5"
          : "bg-transparent"
      )}
    >
      <nav className="mx-auto max-w-container px-6 lg:px-10 py-4 flex items-center justify-between">
        <a
          href="#hero"
          aria-label="Mile Robotics — go to top"
          className="relative inline-flex items-center"
        >
          <Image
            src="/logo/mile-png-horizontal-dark-long.png"
            alt="Mile Robotics"
            width={520}
            height={64}
            priority
            className="h-7 md:h-8 w-auto"
          />
        </a>

        <ul className="hidden md:flex items-center gap-9 text-sm font-light tracking-wide text-white/80">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="hover:text-electric-lime transition-colors"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium bg-electric-lime text-black hover:bg-white transition-colors"
          >
            Ready to Play
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
          <button
            aria-label="Toggle menu"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15"
          >
            <span className="sr-only">Menu</span>
            <div className="space-y-1">
              <span
                className={clsx(
                  "block h-px w-5 bg-white transition-transform",
                  mobileOpen && "translate-y-1.5 rotate-45"
                )}
              />
              <span
                className={clsx(
                  "block h-px w-5 bg-white transition-opacity",
                  mobileOpen && "opacity-0"
                )}
              />
              <span
                className={clsx(
                  "block h-px w-5 bg-white transition-transform",
                  mobileOpen && "-translate-y-1.5 -rotate-45"
                )}
              />
            </div>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-md">
          <ul className="px-6 py-6 space-y-4 text-base font-light">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1 text-white/80 hover:text-electric-lime"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium bg-electric-lime text-black"
              >
                Ready to Play →
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
