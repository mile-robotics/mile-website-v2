import Image from "next/image";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative border-t border-white/5 py-16">
      <div className="mx-auto max-w-container px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-1">
            <a
              href="#hero"
              aria-label="Mile Robotics — go to top"
              className="inline-flex items-center"
            >
              <Image
                src="/logo/mile-png-horizontal-dark-long.png"
                alt="Mile Robotics"
                width={520}
                height={64}
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-6 text-sm text-white/55 max-w-[40ch] leading-relaxed">
              A human data layer for robotics and physical AI. Built quietly in
              Manchester, UK.
            </p>
          </div>

          <div className="text-sm text-white/55 leading-relaxed">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">
              Company
            </div>
            <p className="mt-4 max-w-[44ch]">
              MILE ROBOTICS LTD is a private limited company registered in
              England and Wales. Incorporated and registered with Companies
              House under company registration number{" "}
              <span className="text-white">17195589</span>.
            </p>
          </div>

          <div className="text-sm text-white/55">
            <div className="text-xs uppercase tracking-[0.2em] text-white/40">
              Connect
            </div>
            <ul className="mt-4 space-y-2">
              <li>
                <a
                  className="inline-flex items-center gap-2 hover:text-electric-lime transition-colors"
                  href="https://www.linkedin.com/company/mile-robotics/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                  <svg
                    viewBox="0 0 16 16"
                    width="12"
                    height="12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M5 11l6-6M6 5h5v5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </a>
              </li>
              <li>
                <a
                  className="hover:text-electric-lime transition-colors"
                  href="mailto:hello@milelabs.co"
                >
                  hello@milelabs.co
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row gap-3 md:items-center md:justify-between text-xs text-white/40">
          <div>© All Rights Reserved. {year}.</div>
          <div className="tracking-[0.18em] uppercase">milelabs.co</div>
        </div>
      </div>
    </footer>
  );
}
