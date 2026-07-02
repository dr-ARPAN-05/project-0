export default function Footer() {
  return (
    <footer className="border-t border-line/70 px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <div>
          <p className="font-display text-lg font-bold text-white">
            arpan<span className="text-amber">sarkar</span>
            <span className="text-white/30">.org</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-white/45">
            Built by a medical student who remembers exactly what NEET prep felt like without
            help. Reach out — I answer these myself.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-white/35">Network</p>
            <ul className="space-y-1.5 text-white/60">
              <li>Mentorship</li>
              <li>Resources</li>
              <li>Cutoffs</li>
              <li>Counselling</li>
            </ul>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-white/35">Get in touch</p>
            <ul className="space-y-1.5 text-white/60">
              <li>
                <a href="mailto:hello@arpansarkar.org" className="hover:text-lavender">
                  hello@arpansarkar.org
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl border-t border-line/70 pt-6 text-xs text-white/30">
        © {new Date().getFullYear()} Arpan Sarkar. All apps on this domain share one account.
      </p>
    </footer>
  );
}
