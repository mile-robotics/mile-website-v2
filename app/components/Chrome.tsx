"use client";

import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { SectionNav } from "./SectionNav";

// Owns the shared hide-on-scroll state so the side section nav can appear
// exactly when the top nav slides away.
export function Chrome() {
  const [navHidden, setNavHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 80 && y > lastY) setNavHidden(true);
      else setNavHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Navbar hidden={navHidden} />
      <SectionNav visible={navHidden} />
    </>
  );
}
