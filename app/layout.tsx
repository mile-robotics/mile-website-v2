import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SmoothScroll } from "./components/SmoothScroll";

export const metadata: Metadata = {
  metadataBase: new URL("https://milelabs.co"),
  title: "Mile Robotics — A Human Data Layer for Robotics and Physical AI",
  description:
    "Mile Robotics turns immersive, game-like simulations into a human data layer for robots. Every action, hesitation, and correction becomes training data for physical AI.",
  openGraph: {
    title: "Mile Robotics",
    description:
      "A Human Data Layer for Robotics and Physical AI.",
    url: "https://milelabs.co",
    siteName: "Mile Robotics",
    type: "website",
  },
  icons: {
    icon: "/logo/mile-svg-icon-dark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
