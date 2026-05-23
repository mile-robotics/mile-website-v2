import { Navbar } from "./components/Navbar";
import { Hero } from "./sections/Hero";
import { Problem } from "./sections/Problem";
import { Solution } from "./sections/Solution";
import { Updates } from "./sections/Updates";
import { CTA } from "./sections/CTA";
import { Footer } from "./sections/Footer";

export default function Home() {
  return (
    <main className="relative">
      <Navbar />
      <Hero />
      <Problem />
      <Solution />
      <Updates />
      <CTA />
      <Footer />
    </main>
  );
}
