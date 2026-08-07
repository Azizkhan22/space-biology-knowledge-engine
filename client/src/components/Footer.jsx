import { ExternalLink, Github, Rocket, Trophy } from 'lucide-react';

const LINKS = [
  {
    label: 'About the challenge',
    href: 'https://www.spaceappschallenge.org/2025/challenges/build-a-space-biology-knowledge-engine/',
    external: true,
  },
  { label: 'NASA Space Apps', href: 'https://www.spaceappschallenge.org', external: true },
  {
    label: 'GitHub',
    href: 'https://github.com/Azizkhan22/space-biology-knowledge-engine',
    external: true,
    icon: Github,
  },
];

const Footer = () => {
  return (
    <footer className="border-t border-white/8 bg-base-900/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-space-500 to-cosmic-500">
              <Rocket className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">NASA Space Biology Knowledge Engine</p>
              <p className="text-xs text-slate-400">Exploring 608 NASA bioscience publications</p>
            </div>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {LINKS.map(({ label, href, external, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {label}
                {external && !Icon && <ExternalLink className="h-3 w-3 opacity-60" />}
              </a>
            ))}
          </nav>
        </div>

        <div className="my-6 h-px bg-white/8" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-slate-500 sm:flex-row sm:items-center">
          <p>© 2025 NASA Space Biology Knowledge Engine · Team DEIBYTE</p>
          <p className="inline-flex items-center gap-1.5 text-slate-400">
            <Trophy className="h-3.5 w-3.5 text-cosmic-300" />
            1st place — NASA Space Apps Challenge Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
