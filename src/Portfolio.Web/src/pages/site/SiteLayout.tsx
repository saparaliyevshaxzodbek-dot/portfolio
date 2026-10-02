import { useEffect, useState, type ReactElement } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { siteApi } from '../../api/endpoints';
import { useLang, type StringKey } from '../../i18n';
import { IconArrowUp, IconClose, IconGitHub, IconLinkedIn, IconMail, IconMenu, IconTelegram } from '../../components/icons';
import { externalUrl, initials, telegramUrl } from '../../components/ui';

const SECTIONS: { id: string; key: StringKey }[] = [
  { id: 'about', key: 'navAbout' },
  { id: 'skills', key: 'navSkills' },
  { id: 'experience', key: 'navExperience' },
  { id: 'projects', key: 'navProjects' },
  { id: 'contact', key: 'navContact' },
];

export const useSite = () => useQuery({ queryKey: ['site'], queryFn: siteApi.get, staleTime: 60_000 });

/** Scrolls to a home-page section, navigating home first when needed. */
export function useGoToSection() {
  const navigate = useNavigate();
  const location = useLocation();
  return (id: string) => {
    if (location.pathname === '/') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      history.replaceState(null, '', `#${id}`);
    } else {
      navigate(`/#${id}`);
    }
  };
}

export default function SiteLayout() {
  const { data: site } = useSite();
  const location = useLocation();

  // One anonymous page view per browser session for the dashboard counter.
  useEffect(() => {
    try {
      if (sessionStorage.getItem('portfolio.visited')) return;
      sessionStorage.setItem('portfolio.visited', '1');
    } catch {
      // Storage blocked: still count the visit.
    }
    siteApi.visit().catch(() => {});
  }, []);

  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0 });
  }, [location.pathname, location.hash]);

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <Navbar name={site?.profile.fullName ?? ''} />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function Navbar({ name }: { name: string }) {
  const { t, lang, setLang } = useLang();
  const goTo = useGoToSection();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlights the menu item of the section on screen.
  useEffect(() => {
    if (location.pathname !== '/') {
      setActive(null);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    const timer = setTimeout(() => SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }), 300);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  const go = (id: string) => {
    setOpen(false);
    goTo(id);
  };

  const langToggle = (
    <div className="flex rounded-full bg-white/5 p-1 ring-1 ring-white/10" role="group" aria-label="Language">
      {(['en', 'uz'] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase transition ${lang === l ? 'bg-white text-ink-950' : 'text-zinc-400 hover:text-white'}`}
        >
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition duration-300 ${scrolled || open ? 'bg-ink-950/75 shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl' : ''}`}>
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-4 px-5">
        <Link to="/" className="group flex items-center gap-3" aria-label="Home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand p-[1.5px]">
            <span className="grid h-full w-full place-items-center rounded-[10px] bg-ink-950 font-display text-sm font-bold text-white">{initials(name || 'S S')}</span>
          </span>
          <span className="hidden font-display text-sm font-semibold text-white sm:block">{name}</span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => go(s.id)}
              className={`rounded-full px-3.5 py-2 text-sm font-medium transition ${active === s.id ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'}`}
            >
              {t(s.key)}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          {langToggle}
          <button onClick={() => go('contact')} className="btn-primary hidden px-5 py-2.5 lg:inline-flex">
            {t('hireMe')}
          </button>
          <button onClick={() => setOpen((o) => !o)} className="grid h-10 w-10 place-items-center rounded-full text-white ring-1 ring-white/15 md:hidden" aria-label="Menu" aria-expanded={open}>
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="animate-pop-in border-t border-white/10 px-5 pb-6 pt-2 md:hidden">
          {SECTIONS.map((s) => (
            <button key={s.id} onClick={() => go(s.id)} className="block w-full rounded-xl px-3 py-3 text-left text-base font-medium text-zinc-200 hover:bg-white/5">
              {t(s.key)}
            </button>
          ))}
          <button onClick={() => go('contact')} className="btn-primary mt-3 w-full">
            {t('hireMe')}
          </button>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  const { t } = useLang();
  const { data: site } = useSite();
  const p = site?.profile;
  const links = p
    ? [
        p.gitHub && { href: externalUrl(p.gitHub), label: 'GitHub', icon: <IconGitHub size={18} /> },
        p.linkedIn && { href: externalUrl(p.linkedIn), label: 'LinkedIn', icon: <IconLinkedIn size={18} /> },
        p.telegram && { href: telegramUrl(p.telegram), label: 'Telegram', icon: <IconTelegram size={18} /> },
        { href: `mailto:${p.email}`, label: 'Email', icon: <IconMail size={18} /> },
      ].filter((l): l is { href: string; label: string; icon: ReactElement } => !!l)
    : [];

  return (
    <footer className="relative border-t border-white/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 py-10 sm:flex-row">
        <div className="text-center sm:text-left">
          <p className="font-display font-semibold text-white">{p?.fullName}</p>
          <p className="mt-1 text-sm text-zinc-500">
            © {new Date().getFullYear()} · {t('footerBuilt')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {links.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noreferrer" aria-label={l.label} className="grid h-10 w-10 place-items-center rounded-full text-zinc-400 ring-1 ring-white/10 transition hover:text-white hover:ring-white/30">
              {l.icon}
            </a>
          ))}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t('backToTop')} className="ml-2 grid h-10 w-10 place-items-center rounded-full bg-white text-ink-950 transition hover:-translate-y-0.5">
            <IconArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
}
