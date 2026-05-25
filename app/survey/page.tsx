"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

type Screen = "entry" | "admin-auth" | "survey" | "complete";
type Respondent =
  | "Visitor"
  | "Paul Baniqued CEO"
  | "Danish Khan CSO"
  | "Sky Tse CTO";
type Q3Phase = "select" | "rank";

interface Answers {
  q1: string;
  q1Other: string;
  q2: string;
  q3Selected: string[];
  q3Other: string;
  q3Top3: string[];
  q4: number | null;
  q5: string;
  q6Likert: number | null;
  q6Open: string;
  q7: string;
  q8: string;
  q9: string[];
  q10: string;
  email: string;
  additionalMessage: string;
}

const EMPTY: Answers = {
  q1: "",
  q1Other: "",
  q2: "",
  q3Selected: [],
  q3Other: "",
  q3Top3: [],
  q4: null,
  q5: "",
  q6Likert: null,
  q6Open: "",
  q7: "",
  q8: "",
  q9: [],
  q10: "",
  email: "",
  additionalMessage: "",
};

// ── Constants ──────────────────────────────────────────────────────────────────

const ADMIN_PASSWORDS: Record<string, Respondent> = {
  "Paul Baniqued CEO": "Paul Baniqued CEO",
  "Danish Khan CSO": "Danish Khan CSO",
  "Sky Tse CTO": "Sky Tse CTO",
};

const Q1_OPTS = [
  "I lead or work on a robotics/automation team at an operating company",
  "I work at a robotics company or technology developer",
  "I'm in procurement, operations, or programme management (involved in deploying robots)",
  "I'm in research or academia",
  "Other",
];

const Q2_OPTS = [
  "Actively exploring",
  "Running pilots",
  "Scaling from pilots to deployment",
  "Fully operational",
  "We build and sell robot systems to other industries",
];

const Q3_OPTS = [
  "Robots behaving reliably in real, unstructured, unpredictable environments",
  "Convincing leadership or procurement that a robot is genuinely ready to deploy",
  "Collecting enough relevant training or validation data in our specific environment",
  "The cost and time of physical pilot testing",
  "Getting operators to trust and work alongside robots",
  "Safety compliance and regulatory approvals",
  "Finding or retaining skilled robotics / AI engineers",
  "Other",
];

const LIKERT = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

const Q8_OPTS = [
  "Low cost and quick (under 1 month, under £20K)",
  "Moderate (1–3 months, £20K–£100K)",
  "High (3–6 months, £100K–£500K)",
  "Very high or often not feasible (6+ months, or restricted by safety / site access)",
  "We don't typically run physical pilots",
];

const Q9_OPTS = [
  "The robotics or engineering team",
  "Operations or site management",
  "Procurement or programme management",
  "A safety or regulatory officer",
  "Senior executive or board",
  "Joint decision across several of these",
];

// 10 questions + 1 email step
const TOTAL = 11;

// ── Shared UI Components ───────────────────────────────────────────────────────

function SelectOption({
  label,
  selected,
  onClick,
  disabled,
  rank,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
  rank?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3",
        selected
          ? "border-electric-lime/50 bg-electric-lime/[0.06]"
          : "border-white/10 bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <span
        className={`text-sm leading-snug ${selected ? "text-white" : "text-white/65"}`}
      >
        {label}
      </span>

      {selected && rank == null && (
        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-electric-lime flex items-center justify-center">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4l2.5 2.5L9 1"
              stroke="black"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {rank != null && (
        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-electric-lime flex items-center justify-center text-black text-xs font-medium">
          {rank}
        </span>
      )}
    </button>
  );
}

function LikertScale({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {LIKERT.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            title={label}
            className={[
              "flex-1 flex flex-col items-center justify-center py-4 rounded-xl border transition-all duration-200",
              value === i + 1
                ? "border-electric-lime/50 bg-electric-lime/[0.06]"
                : "border-white/10 bg-white/[0.02] hover:border-white/25",
            ].join(" ")}
          >
            <span
              className={`text-lg font-medium ${value === i + 1 ? "text-electric-lime" : "text-white/50"}`}
            >
              {i + 1}
            </span>
          </button>
        ))}
      </div>
      <div className="flex justify-between text-xs text-white/30 px-0.5">
        <span>Strongly disagree</span>
        <span>Strongly agree</span>
      </div>
      {value != null && (
        <p className="text-sm text-electric-lime/70 text-center">
          {LIKERT[value - 1]}
        </p>
      )}
    </div>
  );
}

function LongTextArea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const committedRef = useRef(value);

  // Keep committedRef in sync when user edits manually (not while recording)
  useEffect(() => {
    if (!listening) committedRef.current = value;
  }, [value, listening]);

  const hasSpeechAPI =
    typeof window !== "undefined" &&
    !!(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    committedRef.current = value;
    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";

    recognition.onresult = (event: any) => {
      let interim = "";
      let committed = committedRef.current;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          committed = committed ? `${committed} ${t.trim()}` : t.trim();
          committedRef.current = committed;
        } else {
          interim += t;
        }
      }
      onChange(
        interim
          ? committed
            ? `${committed} ${interim}`
            : interim
          : committed
      );
    };

    const finish = () => {
      onChange(committedRef.current);
      setListening(false);
    };
    recognition.onend = finish;
    recognition.onerror = finish;

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "Type your answer here…"}
        rows={6}
        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 pr-14 text-sm text-white placeholder:text-white/25 outline-none focus:border-electric-lime/40 transition-colors resize-none leading-relaxed"
      />
      {hasSpeechAPI && (
        <button
          type="button"
          onClick={toggleMic}
          title={listening ? "Stop recording" : "Dictate answer"}
          className={[
            "absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            listening
              ? "bg-coral text-white scale-110"
              : "bg-white/[0.06] text-white/40 hover:bg-white/[0.14] hover:text-white/80",
          ].join(" ")}
          style={listening ? { animation: "pulse 1.2s ease-in-out infinite" } : {}}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <rect x="9" y="2" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M5 10c0 3.866 3.134 7 7 7s7-3.134 7-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <line x1="9" y1="21" x2="15" y2="21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      )}
      {listening && (
        <p className="mt-1.5 text-xs text-coral/80 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" style={{ animation: "pulse 1s ease-in-out infinite" }} />
          Listening… speak now. Click mic to stop.
        </p>
      )}
    </div>
  );
}

function QuestionShell({
  number,
  question,
  description,
  children,
}: {
  number: number | string;
  question: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-electric-lime text-sm font-medium tabular-nums">
            {typeof number === "number" ? `Q${number}` : number}
          </span>
          <span className="text-white/20 text-sm">→</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-medium leading-snug tracking-tight">
          {question}
        </h2>
        {description && (
          <p className="text-white/40 text-sm leading-relaxed">{description}</p>
        )}
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

// ── Survey Flow ────────────────────────────────────────────────────────────────

interface FlowProps {
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  q3Phase: Q3Phase;
  currentQ: number;
  respondent: Respondent;
  canAdvance: boolean;
  isSubmitting: boolean;
  onAdvance: () => void;
  onBack: () => void;
  toggleQ3: (opt: string) => void;
  toggleQ3Rank: (opt: string) => void;
  toggleQ9: (opt: string) => void;
}

function SurveyFlow({
  answers,
  setAnswers,
  q3Phase,
  currentQ,
  respondent,
  canAdvance,
  isSubmitting,
  onAdvance,
  onBack,
  toggleQ3,
  toggleQ3Rank,
  toggleQ9,
}: FlowProps) {
  const progress = Math.round(
    ((currentQ + (q3Phase === "rank" ? 0.5 : 0)) / TOTAL) * 100
  );

  // Enter-key shortcut (skip on textarea questions: Q5=4, Q7=6, Q10=9)
  useEffect(() => {
    const textareaQs = new Set([4, 6, 9]);
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "Enter" &&
        !e.shiftKey &&
        !textareaQs.has(currentQ) &&
        canAdvance
      ) {
        onAdvance();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentQ, canAdvance, onAdvance]);

  const renderQuestion = () => {
    switch (currentQ) {
      /* ── Q1 ── */
      case 0:
        return (
          <QuestionShell number={1} question="Which best describes your current role?">
            {Q1_OPTS.map((opt) => (
              <SelectOption
                key={opt}
                label={opt}
                selected={answers.q1 === opt}
                onClick={() => setAnswers((a) => ({ ...a, q1: opt }))}
              />
            ))}
            {answers.q1 === "Other" && (
              <input
                autoFocus
                type="text"
                value={answers.q1Other}
                onChange={(e) => setAnswers((a) => ({ ...a, q1Other: e.target.value }))}
                placeholder="Please describe your role…"
                className="w-full bg-white/[0.03] border border-electric-lime/30 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-electric-lime/50 transition-colors mt-1"
              />
            )}
          </QuestionShell>
        );

      /* ── Q2 ── */
      case 1:
        return (
          <QuestionShell
            number={2}
            question="Where is your organisation in its robotics journey?"
          >
            {Q2_OPTS.map((opt) => (
              <SelectOption
                key={opt}
                label={opt}
                selected={answers.q2 === opt}
                onClick={() => setAnswers((a) => ({ ...a, q2: opt }))}
              />
            ))}
          </QuestionShell>
        );

      /* ── Q3 ── */
      case 2:
        if (q3Phase === "select") {
          return (
            <QuestionShell
              number={3}
              question="Which of the following are significant challenges in your work with robots?"
              description="Select all that apply — you'll rank your top 3 next."
            >
              {Q3_OPTS.map((opt) => (
                <SelectOption
                  key={opt}
                  label={opt}
                  selected={answers.q3Selected.includes(opt)}
                  onClick={() => toggleQ3(opt)}
                />
              ))}
              {answers.q3Selected.includes("Other") && (
                <input
                  type="text"
                  value={answers.q3Other}
                  onChange={(e) => setAnswers((a) => ({ ...a, q3Other: e.target.value }))}
                  placeholder="Describe the other challenge…"
                  className="w-full bg-white/[0.03] border border-electric-lime/30 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-electric-lime/50 transition-colors mt-1"
                />
              )}
            </QuestionShell>
          );
        }
        return (
          <QuestionShell
            number={3}
            question="From your selections, what are your top 3 challenges?"
            description="Click in order of priority — 1 is most critical."
          >
            {answers.q3Selected.map((opt) => {
              const rank = answers.q3Top3.indexOf(opt);
              return (
                <SelectOption
                  key={opt}
                  label={opt}
                  selected={rank !== -1}
                  rank={rank !== -1 ? rank + 1 : undefined}
                  disabled={rank === -1 && answers.q3Top3.length >= 3}
                  onClick={() => toggleQ3Rank(opt)}
                />
              );
            })}
            <p className="text-xs text-white/30 pt-1 text-right">
              {answers.q3Top3.length} / 3 ranked
            </p>
          </QuestionShell>
        );

      /* ── Q4 ── */
      case 3:
        return (
          <QuestionShell
            number={4}
            question='"We have had robot pilots that showed promise but never made it to full deployment."'
            description="Rate how strongly you agree or disagree."
          >
            <LikertScale
              value={answers.q4}
              onChange={(v) => setAnswers((a) => ({ ...a, q4: v }))}
            />
          </QuestionShell>
        );

      /* ── Q5 ── */
      case 4:
        return (
          <QuestionShell
            number={5}
            question="Before deploying a robot to an active site or live operation, what does your team currently do to decide whether it's ready?"
            description="Walk us through your typical process. Shift + Enter for new line."
          >
            <LongTextArea
              value={answers.q5}
              onChange={(v) => setAnswers((a) => ({ ...a, q5: v }))}
              placeholder="Describe your current readiness process…"
            />
          </QuestionShell>
        );

      /* ── Q6 ── */
      case 5:
        return (
          <QuestionShell
            number={6}
            question='"It is difficult and expensive to collect enough real-world data or test scenarios to adequately train and validate a robot for our specific environment."'
            description="Rate how strongly you agree or disagree."
          >
            <LikertScale
              value={answers.q6Likert}
              onChange={(v) => setAnswers((a) => ({ ...a, q6Likert: v }))}
            />
            <div className="pt-5 space-y-2">
              <p className="text-sm text-white/35">
                Optional: what have you tried to address this?
              </p>
              <input
                type="text"
                value={answers.q6Open}
                onChange={(e) =>
                  setAnswers((a) => ({ ...a, q6Open: e.target.value }))
                }
                placeholder="Your approaches…"
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-electric-lime/40 transition-colors"
              />
            </div>
          </QuestionShell>
        );

      /* ── Q7 ── */
      case 6:
        return (
          <QuestionShell
            number={7}
            question="When something goes wrong with a robot in the field, where does the knowledge to understand and fix the problem typically come from?"
            description="Shift + Enter for new line."
          >
            <LongTextArea
              value={answers.q7}
              onChange={(v) => setAnswers((a) => ({ ...a, q7: v }))}
              placeholder="Describe where that expertise lives in your organisation…"
            />
          </QuestionShell>
        );

      /* ── Q8 ── */
      case 7:
        return (
          <QuestionShell
            number={8}
            question="How would you describe running a physical robot pilot or real-world test in your operating environment?"
          >
            {Q8_OPTS.map((opt) => (
              <SelectOption
                key={opt}
                label={opt}
                selected={answers.q8 === opt}
                onClick={() => setAnswers((a) => ({ ...a, q8: opt }))}
              />
            ))}
          </QuestionShell>
        );

      /* ── Q9 ── */
      case 8:
        return (
          <QuestionShell
            number={9}
            question="Who typically has the final say on whether a robot is approved for live deployment?"
            description="Select up to 2."
          >
            {Q9_OPTS.map((opt) => (
              <SelectOption
                key={opt}
                label={opt}
                selected={answers.q9.includes(opt)}
                disabled={
                  !answers.q9.includes(opt) && answers.q9.length >= 2
                }
                onClick={() => toggleQ9(opt)}
              />
            ))}
          </QuestionShell>
        );

      /* ── Q10 ── */
      case 9:
        return (
          <QuestionShell
            number={10}
            question="If you could change one thing about how your organisation evaluates, tests, or deploys robots — what would it be?"
            description="Shift + Enter for new line."
          >
            <LongTextArea
              value={answers.q10}
              onChange={(v) => setAnswers((a) => ({ ...a, q10: v }))}
              placeholder="Tell us what you'd change…"
            />
          </QuestionShell>
        );

      /* ── Email + additional message ── */
      case 10:
        return (
          <QuestionShell
            number="✓"
            question="Almost done. Would you like to be kept in the loop?"
            description="Both fields are optional — press Continue to skip."
          >
            <input
              type="email"
              autoFocus
              value={answers.email}
              onChange={(e) =>
                setAnswers((a) => ({ ...a, email: e.target.value }))
              }
              placeholder="your@email.com"
              className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-sm text-white placeholder:text-white/25 outline-none focus:border-electric-lime/40 transition-colors"
            />
            <div className="pt-3 space-y-2">
              <p className="text-sm text-white/35">
                Anything else you&apos;d like to add?
              </p>
              <LongTextArea
                value={answers.additionalMessage}
                onChange={(v) => setAnswers((a) => ({ ...a, additionalMessage: v }))}
                placeholder="Any additional thoughts, context, or questions for us…"
              />
            </div>
          </QuestionShell>
        );

      default:
        return null;
    }
  };

  const isLastStep = currentQ === TOTAL - 1;
  const isRankStep = currentQ === 2 && q3Phase === "select";
  const isTextareaQ = [4, 6, 9].includes(currentQ);
  const backDisabled = currentQ === 0 && q3Phase === "select";

  const continueLabel = isSubmitting
    ? "Submitting…"
    : isLastStep
      ? "Submit response"
      : isRankStep
        ? "Rank top 3 →"
        : "Continue →";

  return (
    <motion.div
      key="survey"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col"
    >
      {/* ── Progress bar ── */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-white/[0.08] z-50">
        <motion.div
          className="h-full bg-electric-lime"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* ── Top bar ── */}
      <div className="fixed top-2 left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-10 pt-5">
        <span className="eyebrow text-[0.65rem]">Mile Robotics</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-white/30 hidden sm:inline">
            Responding as
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full border border-electric-lime/25 bg-electric-lime/[0.07] text-electric-lime">
            {respondent}
          </span>
        </div>
      </div>

      {/* ── Question ── */}
      <div className="flex-1 flex items-center justify-center px-5 sm:px-10 lg:px-20 py-32">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${currentQ}-${q3Phase}`}
              initial={{ opacity: 0, y: 28 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
              }}
              exit={{
                opacity: 0,
                y: -16,
                transition: { duration: 0.22 },
              }}
            >
              {renderQuestion()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Footer nav ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.06] bg-black/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-5 sm:px-10 py-4">
          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13 8H3M7 4L3 8l4 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back
          </button>

          <div className="flex items-center gap-4">
            {!isTextareaQ && (
              <span className="text-[11px] text-white/20 hidden sm:block">
                Press Enter ↵
              </span>
            )}
            <button
              type="button"
              onClick={onAdvance}
              disabled={!canAdvance || isSubmitting}
              className="rounded-full px-6 py-2.5 text-sm font-medium bg-electric-lime text-black hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {continueLabel}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function SurveyPage() {
  const [screen, setScreen] = useState<Screen>("entry");
  const [respondent, setRespondent] = useState<Respondent>("Visitor");
  const [adminPwd, setAdminPwd] = useState("");
  const [adminError, setAdminError] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [q3Phase, setQ3Phase] = useState<Q3Phase>("select");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Derived state ──────────────────────────────────────────────────────────
  const canAdvance = (() => {
    switch (currentQ) {
      case 0:
        return answers.q1 !== "";
      case 1:
        return answers.q2 !== "";
      case 2:
        return q3Phase === "rank" ? true : answers.q3Selected.length > 0;
      case 3:
        return answers.q4 !== null;
      case 4:
        return answers.q5.trim().length >= 10;
      case 5:
        return answers.q6Likert !== null;
      case 6:
        return answers.q7.trim().length >= 10;
      case 7:
        return answers.q8 !== "";
      case 8:
        return answers.q9.length > 0;
      case 9:
        return answers.q10.trim().length >= 10;
      case 10:
        return true; // email is optional
      default:
        return false;
    }
  })();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const advance = async () => {
    // Q3 two-phase
    if (currentQ === 2 && q3Phase === "select") {
      setQ3Phase("rank");
      return;
    }
    if (currentQ < TOTAL - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      // Submit to Supabase
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/survey", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            respondent,
            q1: answers.q1,
            q1_other: answers.q1Other || null,
            q2: answers.q2,
            q3_selected: answers.q3Selected,
            q3_other: answers.q3Other || null,
            q3_top3: answers.q3Top3,
            q4: answers.q4,
            q5: answers.q5,
            q6_likert: answers.q6Likert,
            q6_open: answers.q6Open || null,
            q7: answers.q7,
            q8: answers.q8,
            q9: answers.q9,
            q10: answers.q10,
            email: answers.email || null,
            additional_message: answers.additionalMessage || null,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          console.error("Survey submit failed:", data);
          alert("Something went wrong submitting your response. Please try again.");
          return;
        }

        setScreen("complete");
      } catch (err) {
        console.error("Survey submit error:", err);
        alert("Network error — please check your connection and try again.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const goBack = () => {
    if (currentQ === 2 && q3Phase === "rank") {
      setQ3Phase("select");
      return;
    }
    if (currentQ > 0) {
      setCurrentQ((q) => q - 1);
    }
  };

  const submitAdmin = () => {
    const match = ADMIN_PASSWORDS[adminPwd.trim()];
    if (match) {
      setRespondent(match);
      setAdminError(false);
      setScreen("survey");
    } else {
      setAdminError(true);
    }
  };

  const toggleQ3 = (opt: string) => {
    setAnswers((a) => {
      const selected = a.q3Selected.includes(opt)
        ? a.q3Selected.filter((o) => o !== opt)
        : [...a.q3Selected, opt];
      return {
        ...a,
        q3Selected: selected,
        q3Top3: a.q3Top3.filter((o) => selected.includes(o)),
      };
    });
  };

  const toggleQ3Rank = (opt: string) => {
    setAnswers((a) => {
      if (a.q3Top3.includes(opt)) {
        return { ...a, q3Top3: a.q3Top3.filter((o) => o !== opt) };
      }
      if (a.q3Top3.length < 3) {
        return { ...a, q3Top3: [...a.q3Top3, opt] };
      }
      return a;
    });
  };

  const toggleQ9 = (opt: string) => {
    setAnswers((a) => {
      if (a.q9.includes(opt)) return { ...a, q9: a.q9.filter((o) => o !== opt) };
      if (a.q9.length >= 2) return a;
      return { ...a, q9: [...a.q9, opt] };
    });
  };

  // ── Slide animation preset ─────────────────────────────────────────────────
  const slide = {
    initial: { opacity: 0, y: 28 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: -16, transition: { duration: 0.25 } },
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-black text-white">
      <AnimatePresence mode="wait">

        {/* ── Entry screen ── */}
        {screen === "entry" && (
          <motion.div
            key="entry"
            {...slide}
            className="min-h-screen relative flex flex-col items-center justify-center px-5 sm:px-10 py-20 overflow-hidden"
          >
            {/* Aurora backdrop */}
            <div className="aurora" aria-hidden />
            <div className="grid-backdrop absolute inset-0 pointer-events-none" aria-hidden />

            {/* Header copy */}
            <div className="relative z-10 text-center mb-14">
              <p className="eyebrow mb-4">Mile Robotics</p>
              <h1 className="headline text-3xl sm:text-4xl mb-4">
                Industry Research Survey
              </h1>
              <p className="subhead text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                We&apos;re a small team in Manchester building tools for the robotics
                industry. Help us understand your world — takes about 5 minutes.
                Anonymous. No sales pitch, ever.
              </p>
            </div>

            {/* Cards */}
            <div className="relative z-10 w-full max-w-3xl flex flex-col sm:flex-row gap-4">

              {/* ── Visitor card (large) ── */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.015, y: -3 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  setRespondent("Visitor");
                  setScreen("survey");
                }}
                className="card-surface flex-[2] text-left p-8 sm:p-10 rounded-2xl group cursor-pointer hover:border-electric-lime/40 transition-colors duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-electric-lime/10 border border-electric-lime/20 flex items-center justify-center mb-8 group-hover:bg-electric-lime/20 transition-colors">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="8" r="4" stroke="#A9F000" strokeWidth="1.5" />
                    <path
                      d="M3.5 19c0-4.142 3.358-7.5 7.5-7.5s7.5 3.358 7.5 7.5"
                      stroke="#A9F000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p className="eyebrow text-[0.65rem] mb-3">Survey</p>
                <h2 className="headline text-2xl sm:text-3xl mb-3">
                  Take the Survey
                </h2>
                <p className="subhead text-sm leading-relaxed mb-9">
                  Share your experience with robotics deployment. Your insights shape
                  what we build for the industry.
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium text-electric-lime group-hover:gap-3 transition-all">
                  Get started
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8h10M9 4l4 4-4 4"
                      stroke="#A9F000"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </motion.button>

              {/* ── Admin card (small) ── */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.015, y: -3 }}
                whileTap={{ scale: 0.985 }}
                onClick={() => setScreen("admin-auth")}
                className="flex-1 text-left p-6 sm:p-8 rounded-2xl cursor-pointer group transition-colors duration-300"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center mb-6 group-hover:bg-white/[0.1] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="3"
                      y="7"
                      width="10"
                      height="8"
                      rx="1.5"
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7"
                      stroke="rgba(255,255,255,0.45)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <p
                  className="text-[0.65rem] tracking-widest uppercase text-white/25 mb-2"
                  style={{ fontWeight: 500 }}
                >
                  Co-founder
                </p>
                <h2 className="text-lg sm:text-xl font-medium text-white/70 mb-2">
                  Restricted Access
                </h2>
                <p className="text-xs text-white/30 leading-relaxed">
                  Interview mode. Password required.
                </p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── Admin auth screen ── */}
        {screen === "admin-auth" && (
          <motion.div
            key="admin-auth"
            {...slide}
            className="min-h-screen flex flex-col items-center justify-center px-5"
          >
            <div
              className="w-full max-w-sm p-8 rounded-2xl"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setScreen("entry");
                  setAdminPwd("");
                  setAdminError(false);
                }}
                className="flex items-center gap-2 text-sm text-white/35 hover:text-white transition-colors mb-7"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M13 8H3M7 4L3 8l4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </button>

              <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center mb-6">
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                  <rect
                    x="3"
                    y="7"
                    width="10"
                    height="8"
                    rx="1.5"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M5.5 7V5.5a2.5 2.5 0 0 1 5 0V7"
                    stroke="rgba(255,255,255,0.5)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h2 className="text-lg font-medium mb-6">Restricted Access</h2>

              <p className="text-xs text-white/35 mb-1.5 uppercase tracking-widest" style={{ fontWeight: 500 }}>Password</p>
              <input
                type="password"
                autoFocus
                placeholder=""
                value={adminPwd}
                onChange={(e) => {
                  setAdminPwd(e.target.value);
                  setAdminError(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && submitAdmin()}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-electric-lime/40 transition-colors"
              />

              {adminError && (
                <p className="text-coral text-xs mt-2">
                  Access denied. Password not recognised.
                </p>
              )}

              <button
                type="button"
                onClick={submitAdmin}
                className="w-full mt-4 bg-white/[0.08] hover:bg-white/[0.15] rounded-xl py-3 text-sm font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        )}

        {/* ── Survey screen ── */}
        {screen === "survey" && (
          <SurveyFlow
            key="survey"
            answers={answers}
            setAnswers={setAnswers}
            q3Phase={q3Phase}
            currentQ={currentQ}
            respondent={respondent}
            canAdvance={canAdvance}
            isSubmitting={isSubmitting}
            onAdvance={advance}
            onBack={goBack}
            toggleQ3={toggleQ3}
            toggleQ3Rank={toggleQ3Rank}
            toggleQ9={toggleQ9}
          />
        )}

        {/* ── Complete screen ── */}
        {screen === "complete" && (
          <motion.div
            key="complete"
            {...slide}
            className="min-h-screen relative flex flex-col items-center justify-center px-5 py-20 text-center overflow-hidden"
          >
            <div className="aurora" aria-hidden />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-electric-lime/10 border border-electric-lime/30 flex items-center justify-center mx-auto mb-8">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 6L9 17l-5-5"
                    stroke="#A9F000"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <p className="eyebrow mb-4">Thank you</p>
              <h1 className="headline text-3xl sm:text-4xl mb-5">
                Response submitted
              </h1>
              <p className="subhead text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                We appreciate you taking the time. Your insights are helping us
                understand the real challenges in robotics deployment — and shape
                what we build next.
              </p>

              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="mt-10 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium bg-electric-lime text-black hover:bg-white transition-colors"
              >
                Back to Mile Robotics
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}
