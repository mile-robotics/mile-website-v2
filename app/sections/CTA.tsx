"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Category = "Sign Up" | "Partner" | "Invest" | "General Message";

const categories: Category[] = [
  "Sign Up",
  "Partner",
  "Invest",
  "General Message",
];

type Status = "idle" | "submitting" | "success" | "error";

export function CTA() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState<Category>("Sign Up");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    try {
      // Wired in Walkthrough.md — POST to /api/contact (e.g. Formspree, Resend, Notion).
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, category, message }),
      });

      if (!res.ok) throw new Error("Bad response");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setCategory("Sign Up");
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        "Couldn’t send right now — please email hello@milelabs.co directly."
      );
    }
  }

  return (
    <section
      id="contact"
      className="relative py-20 sm:py-28 md:py-36 border-t border-white/5"
    >
      <div className="mx-auto max-w-container px-5 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="eyebrow"
          >
            Get in touch
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="headline mt-6 text-[clamp(2rem,4.5vw,3.75rem)] max-w-[18ch]"
          >
            Sign up. Partner. Invest. Or just say hello.
          </motion.h2>
          <p className="subhead mt-6 max-w-[48ch]">
            Tell us a little about you and we’ll come back with the right
            conversation. We read every message.
          </p>
          <div className="mt-10 text-sm text-white/60 space-y-2">
            <div>
              <span className="text-white/40">Email — </span>
              <a
                className="hover:text-electric-lime"
                href="mailto:hello@milelabs.co"
              >
                hello@milelabs.co
              </a>
            </div>
            <div>
              <span className="text-white/40">Web — </span>
              <a
                className="hover:text-electric-lime"
                href="https://milelabs.co"
              >
                milelabs.co
              </a>
            </div>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          onSubmit={onSubmit}
          className="rounded-2xl sm:rounded-3xl border border-white/10 bg-surface-raised p-6 sm:p-8 md:p-10"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <Field label="Name">
              <input
                required
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Your name"
              />
            </Field>
            <Field label="Email">
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="you@company.com"
              />
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="input appearance-none pr-10 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22 fill=%22%23ffffff80%22><path d=%22M4 6l4 4 4-4%22 stroke=%22%23ffffff80%22 stroke-width=%221.6%22 fill=%22none%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22/></svg>')] bg-no-repeat bg-[length:14px_14px] bg-[position:calc(100%-14px)_50%]"
              >
                {categories.map((c) => (
                  <option key={c} value={c} className="bg-surface-raised">
                    {c}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-5">
            <Field label="Message">
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input resize-none"
                placeholder="Tell us what you’re working on or what brought you here."
              />
            </Field>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-xs text-white/40 max-w-[40ch]">
              We’ll only use this to reply. No marketing lists.
            </p>
            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-electric-lime text-black hover:bg-white transition-colors disabled:opacity-50"
            >
              {status === "submitting" ? "Sending…" : "Send message"}
              {status !== "submitting" && (
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
              )}
            </button>
          </div>

          {status === "success" && (
            <p className="mt-5 text-sm text-electric-lime">
              Thank you — we’ll be in touch.
            </p>
          )}
          {status === "error" && errorMessage && (
            <p className="mt-5 text-sm text-coral">{errorMessage}</p>
          )}
        </motion.form>
      </div>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #ffffff;
          border-radius: 14px;
          padding: 14px 16px;
          font-size: 15px;
          font-weight: 300;
          font-family: var(--font-firs-neue);
          transition: border 0.2s ease, background 0.2s ease;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #a9f000;
          background: rgba(169, 240, 0, 0.06);
        }
        :global(.input::placeholder) {
          color: rgba(255, 255, 255, 0.35);
          font-weight: 300;
        }
      `}</style>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-[0.18em] text-white/50 mb-2">
        {label}
      </span>
      {children}
    </label>
  );
}
