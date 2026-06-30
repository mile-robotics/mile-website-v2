import { Chrome } from "./components/Chrome";
import { Hero } from "./sections/Hero";
import { Problem } from "./sections/Problem";
import { VideoTransition } from "./sections/VideoTransition";
import { Solution } from "./sections/Solution";
import { Updates } from "./sections/Updates";
import { CTA } from "./sections/CTA";
import { Footer } from "./sections/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Chrome />
      <Hero />
      <Problem />
      <VideoTransition />
      <Solution />
      <Updates />
      <CTA />
      <Footer />
    </main>
  );
}
