import { useEffect, useMemo, useState, type FormEvent, type ReactElement, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router';
import { useMutation } from '@tanstack/react-query';
import { siteApi } from '../../api/endpoints';
import type { Experience, ExperienceType, Profile, ProjectCard, Site, Skill, SkillCategory } from '../../api/types';
import { useLang, type StringKey } from '../../i18n';
import {
  ErrorBox,
  Paragraphs,
  Reveal,
  SectionHeading,
  Spinner,
  TechChip,
  externalUrl,
  initials,
  telegramUrl,
  trackSpotlight,
} from '../../components/ui';
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBook,
  IconBriefcase,
  IconCap,
  IconCheck,
  IconDatabase,
  IconDownload,
  IconGitHub,
  IconGlobe,
  IconLayout,
  IconLinkedIn,
  IconMail,
  IconPhone,
  IconPin,
  IconServer,
  IconSparkle,
  IconTelegram,
  IconWrench,
} from '../../components/icons';
import { useGoToSection, useSite } from './SiteLayout';

const CODING_SINCE = 2023;

export default function HomePage() {
  const { data: site, isLoading, error } = useSite();
  const location = useLocation();

  // Arriving from another page with #section: scroll there once the content exists.
  useEffect(() => {
    if (!site || !location.hash) return;
    const timer = setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 80);
    return () => clearTimeout(timer);
  }, [site, location.hash]);

  if (isLoading) return <Spinner className="min-h-dvh items-center" />;
  if (error || !site) {
    return (
      <div className="mx-auto max-w-md px-5 pt-40">
        <ErrorBox error={error ?? new Error('No data')} />
      </div>
    );
  }

  return (
    <>
      <Hero site={site} />
      <TechMarquee skills={site.skills} />
      <About site={site} />
      <Skills skills={site.skills} />
      <Timeline items={site.experiences} />
      <Projects projects={site.projects} />
      <Contact profile={site.profile} />
    </>
  );
}

/* ---------------------------------------------------------------- Hero */

function useTypewriter(words: string[], speed = 55, pause = 1800) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (words.length === 0) return;
    const word = words[index % words.length]!;
    const done = !deleting && text === word;
    const cleared = deleting && text === '';
    const timer = setTimeout(
      () => {
        if (done) setDeleting(true);
        else if (cleared) {
          setDeleting(false);
          setIndex((i) => i + 1);
        } else setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      },
      done ? pause : deleting ? speed / 2 : speed,
    );
    return () => clearTimeout(timer);
  }, [text, deleting, index, words, speed, pause]);

  return text;
}

function Hero({ site }: { site: Site }) {
  const { t, tx, lang } = useLang();
  const goTo = useGoToSection();
  const p = site.profile;
  const roles = useMemo(
    () => [tx(p.headline), 'ASP.NET Core · EF Core · SignalR', 'React · TypeScript · Tailwind', lang === 'uz' ? 'Toza arxitektura va testlar' : 'Clean architecture & tests'],
    [p.headline, tx, lang],
  );
  const typed = useTypewriter(roles);
  const years = Math.max(1, new Date().getFullYear() - CODING_SINCE);

  return (
    <section id="top" className="relative isolate overflow-hidden pb-20 pt-32 sm:pt-40 lg:pb-28">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="absolute -top-48 left-1/2 -z-10 h-[42rem] w-[70rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-600/30 via-fuchsia-500/20 to-cyan-400/20 blur-3xl" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 lg:grid-cols-[1.25fr_1fr]">
        <div className="min-w-0">
          {p.openToWork && (
            <Reveal>
              <span className="inline-flex items-center gap-2.5 rounded-full bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/25">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                {t('openToWork')}
              </span>
            </Reveal>
          )}
          <Reveal delay={80}>
            <p className="mt-7 font-mono text-sm text-zinc-400">{t('hello')}</p>
            <h1 className="mt-2 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-7xl">
              {p.fullName.split(' ').map((part, i, all) => (
                <span key={i} className={i === all.length - 1 ? 'text-gradient block' : 'block'}>
                  {part}
                </span>
              ))}
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <p className="mt-6 min-h-[3.4rem] font-mono text-base leading-relaxed text-accent-300 sm:min-h-8 sm:text-xl">
              <span className="mr-2 text-zinc-600">&gt;</span>
              {typed}
              <span className="caret ml-0.5 inline-block h-5 w-[2px] translate-y-1 bg-accent-300 sm:h-6" />
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-zinc-400">{tx(p.summary)}</p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap gap-3">
              <button onClick={() => goTo('projects')} className="btn-primary px-7 py-3.5">
                {t('viewProjects')} <IconArrowRight size={18} />
              </button>
              {p.cvUrl ? (
                <a href={p.cvUrl} target="_blank" rel="noreferrer" className="btn-ghost px-7 py-3.5">
                  <IconDownload size={18} /> {t('downloadCv')}
                </a>
              ) : (
                <button onClick={() => goTo('contact')} className="btn-ghost px-7 py-3.5">
                  <IconMail size={18} /> {t('contactMe')}
                </button>
              )}
            </div>
            <SocialRow profile={p} className="mt-8" />
          </Reveal>
          <Reveal delay={320}>
            <dl className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-2xl bg-white/[0.03] py-4 ring-1 ring-white/10">
              {[
                { value: site.projects.length, label: t('statProjects') },
                { value: site.skills.length, label: t('statTech') },
                { value: `${years}+`, label: t('statYears') },
              ].map((s) => (
                <div key={s.label} className="px-4 text-center">
                  <dd className="font-display text-3xl font-bold text-white">{s.value}</dd>
                  <dt className="mt-1 text-xs font-medium text-zinc-500">{s.label}</dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative mx-auto w-full max-w-md">
          <Portrait profile={p} />
        </Reveal>
      </div>
    </section>
  );
}

function SocialRow({ profile: p, className = '' }: { profile: Profile; className?: string }) {
  const items = [
    p.gitHub && { href: externalUrl(p.gitHub), label: 'GitHub', icon: <IconGitHub size={18} /> },
    p.linkedIn && { href: externalUrl(p.linkedIn), label: 'LinkedIn', icon: <IconLinkedIn size={18} /> },
    p.telegram && { href: telegramUrl(p.telegram), label: 'Telegram', icon: <IconTelegram size={18} /> },
    { href: `mailto:${p.email}`, label: p.email, icon: <IconMail size={18} /> },
  ].filter((x): x is { href: string; label: string; icon: ReactElement } => !!x);

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {items.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target={item.href.startsWith('mailto:') ? undefined : '_blank'}
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-zinc-400 ring-1 ring-white/10 transition hover:text-white hover:ring-white/30"
          aria-label={item.label}
        >
          {item.icon}
          {item.href.startsWith('mailto:') && <span className="hidden sm:inline">{item.label}</span>}
        </a>
      ))}
    </div>
  );
}

/** The owner's photo, or a monogram with a rotating gradient ring until a photo is uploaded. */
function Portrait({ profile: p }: { profile: Profile }) {
  return (
    <div className="relative aspect-square">
      <div className="absolute inset-6 rounded-full bg-gradient-to-br from-accent-500/40 via-fuchsia-500/30 to-cyan-400/30 blur-3xl" />
      <div className="animate-spin-slow absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,#8b5cf6,#d946ef,#22d3ee,#8b5cf6)] p-[2px] [mask:radial-gradient(farthest-side,transparent_calc(100%-2px),#000_calc(100%-2px))]" />
      <div className="absolute inset-4 overflow-hidden rounded-full bg-ink-900 ring-1 ring-white/10">
        {p.photoUrl ? (
          <img src={p.photoUrl} alt={p.fullName} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.35),transparent_60%),radial-gradient(circle_at_80%_90%,rgba(34,211,238,0.25),transparent_55%)]">
            <span className="text-gradient font-display text-8xl font-bold sm:text-9xl">{initials(p.fullName)}</span>
          </div>
        )}
      </div>

      <CodeCard className="animate-float absolute -bottom-6 -left-4 w-64 sm:-left-10 sm:w-72" />
      <FloatingBadge className="right-0 top-6 [animation-delay:-2s]" icon={<IconServer size={16} />} text="ASP.NET Core" />
      <FloatingBadge className="-right-2 bottom-24 [animation-delay:-4s] sm:-right-6" icon={<IconLayout size={16} />} text="React + TS" />
    </div>
  );
}

function FloatingBadge({ icon, text, className }: { icon: ReactNode; text: string; className: string }) {
  return (
    <div className={`animate-float glass absolute flex items-center gap-2 rounded-2xl px-3.5 py-2 text-xs font-semibold text-white shadow-2xl ${className}`}>
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-brand text-white">{icon}</span>
      {text}
    </div>
  );
}

function CodeCard({ className }: { className: string }) {
  return (
    <div className={`rounded-2xl bg-ink-900/95 text-left shadow-2xl ring-1 ring-white/10 backdrop-blur-xl ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-2 font-mono text-[11px] text-zinc-500">Developer.cs</span>
      </div>
      <pre className="overflow-hidden px-4 py-3 font-mono text-[11px] leading-relaxed sm:text-xs">
        <span className="text-fuchsia-400">public record</span> <span className="text-cyan-300">Developer</span>
        {'(\n  '}
        <span className="text-accent-300">string</span> Stack = <span className="text-emerald-300">".NET + React"</span>
        {',\n  '}
        <span className="text-accent-300">bool</span> LovesCleanCode = <span className="text-fuchsia-400">true</span>
        {',\n  '}
        <span className="text-accent-300">bool</span> OpenToWork = <span className="text-fuchsia-400">true</span>
        {');'}
      </pre>
    </div>
  );
}

function TechMarquee({ skills }: { skills: Skill[] }) {
  const names = skills.map((s) => s.name);
  if (names.length === 0) return null;
  const row = [...names, ...names];
  return (
    <div className="relative border-y border-white/10 bg-white/[0.015] py-5 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" aria-hidden>
      <div className="animate-marquee flex w-max gap-10 hover:[animation-play-state:paused]">
        {row.map((name, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-lg font-semibold text-zinc-500">
            {name}
            <IconSparkle size={14} className="text-accent-400/60" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- About */

function About({ site }: { site: Site }) {
  const { t, tx } = useLang();
  const p = site.profile;
  const current = site.experiences.find((e) => e.type === 'Work' && !e.endDate && e.organization.includes('EPAM'))
    ?? site.experiences.find((e) => !e.endDate);

  const facts = [
    { icon: <IconPin size={18} />, label: t('location'), value: tx(p.location) },
    current && { icon: <IconBriefcase size={18} />, label: t('currently'), value: `${tx(current.title)} · ${current.organization}` },
    { icon: <IconGlobe size={18} />, label: t('languages'), value: t('languagesValue') },
    { icon: <IconMail size={18} />, label: t('email'), value: p.email, href: `mailto:${p.email}` },
    p.phone && { icon: <IconPhone size={18} />, label: t('phone'), value: p.phone, href: `tel:${p.phone.replace(/\s/g, '')}` },
  ].filter((f): f is { icon: ReactElement; label: string; value: string; href?: string } => !!f);

  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:py-32">
      <SectionHeading eyebrow={t('aboutEyebrow')} title={t('aboutTitle')} />
      <div className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="space-y-5 text-lg leading-relaxed text-zinc-400">
          <Paragraphs text={tx(p.about)} />
        </Reveal>
        <Reveal delay={120} className="min-w-0 space-y-3">
          {facts.map((f) => {
            const body = (
              <>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-500/10 text-accent-300 ring-1 ring-accent-400/20">{f.icon}</span>
                <span className="min-w-0">
                  <span className="block text-xs font-medium uppercase tracking-wider text-zinc-500">{f.label}</span>
                  <span className="block break-words font-medium text-white">{f.value}</span>
                </span>
              </>
            );
            return f.href ? (
              <a key={f.label} href={f.href} onMouseMove={trackSpotlight} className="spotlight card flex items-center gap-4 p-4 transition hover:ring-white/20">
                {body}
              </a>
            ) : (
              <div key={f.label} onMouseMove={trackSpotlight} className="spotlight card flex items-center gap-4 p-4">
                {body}
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Skills */

const CATEGORY_META: Record<SkillCategory, { key: StringKey; icon: ReactNode; tint: string }> = {
  Backend: { key: 'catBackend', icon: <IconServer />, tint: 'from-accent-500/20 to-accent-500/0 text-accent-300' },
  Frontend: { key: 'catFrontend', icon: <IconLayout />, tint: 'from-cyan-400/20 to-cyan-400/0 text-cyan-300' },
  Database: { key: 'catDatabase', icon: <IconDatabase />, tint: 'from-emerald-400/20 to-emerald-400/0 text-emerald-300' },
  Tools: { key: 'catTools', icon: <IconWrench />, tint: 'from-fuchsia-400/20 to-fuchsia-400/0 text-fuchsia-300' },
};

function Skills({ skills }: { skills: Skill[] }) {
  const { t } = useLang();
  const groups = (Object.keys(CATEGORY_META) as SkillCategory[])
    .map((category) => ({ category, items: skills.filter((s) => s.category === category).sort((a, b) => a.sortOrder - b.sortOrder) }))
    .filter((g) => g.items.length > 0);

  return (
    <section id="skills" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="absolute inset-x-0 top-1/3 -z-10 h-96 bg-gradient-to-r from-accent-600/10 via-transparent to-cyan-500/10 blur-3xl" />
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow={t('skillsEyebrow')} title={t('skillsTitle')} />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {groups.map((g, i) => {
            const meta = CATEGORY_META[g.category];
            return (
              <Reveal key={g.category} delay={i * 90}>
                <div onMouseMove={trackSpotlight} className="spotlight card h-full p-7 transition hover:ring-white/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ring-1 ring-white/10 ${meta.tint}`}>{meta.icon}</span>
                      <h3 className="font-display text-xl font-bold text-white">{t(meta.key)}</h3>
                    </div>
                    <span className="font-mono text-xs text-zinc-500">{String(g.items.length).padStart(2, '0')}</span>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {g.items.map((s) => (
                      <TechChip key={s.id} name={s.name} />
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Timeline */

const TYPE_META: Record<ExperienceType, { key: StringKey; icon: ReactNode; style: string }> = {
  Work: { key: 'typeWork', icon: <IconBriefcase size={16} />, style: 'bg-accent-500/15 text-accent-300 ring-accent-400/30' },
  Education: { key: 'typeEducation', icon: <IconCap size={16} />, style: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/30' },
  Course: { key: 'typeCourse', icon: <IconBook size={16} />, style: 'bg-fuchsia-400/10 text-fuchsia-300 ring-fuchsia-400/30' },
};

function Timeline({ items }: { items: Experience[] }) {
  const { t, tx, monthYear } = useLang();
  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-24 sm:py-32">
      <SectionHeading eyebrow={t('experienceEyebrow')} title={t('experienceTitle')} />
      <ol className="relative mt-14 space-y-8 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-gradient-to-b before:from-accent-400/60 before:via-fuchsia-400/30 before:to-transparent md:before:left-1/2">
        {items.map((e, i) => {
          const meta = TYPE_META[e.type];
          const left = i % 2 === 0;
          return (
            <Reveal as="li" key={e.id} delay={i * 80} className="relative md:grid md:grid-cols-2 md:gap-12">
              <span className="absolute left-[11px] top-7 z-10 grid h-[18px] w-[18px] place-items-center rounded-full bg-ink-950 ring-2 ring-accent-400 md:left-1/2 md:-translate-x-1/2">
                {!e.endDate && <span className="h-2 w-2 animate-pulse rounded-full bg-accent-300" />}
              </span>
              <div className={`pl-12 md:pl-0 ${left ? 'md:col-start-1 md:text-right' : 'md:col-start-2'}`}>
                <div onMouseMove={trackSpotlight} className="spotlight card p-6 text-left transition hover:ring-white/20">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.style}`}>
                      {meta.icon}
                      {t(meta.key)}
                    </span>
                    <span className="font-mono text-xs text-zinc-500">
                      {monthYear(e.startDate)} — {e.endDate ? monthYear(e.endDate) : <span className="text-emerald-300">{t('present')}</span>}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-white">{tx(e.title)}</h3>
                  {e.url ? (
                    <a href={e.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-medium text-accent-300 hover:text-accent-400">
                      {e.organization} <IconArrowUpRight size={14} />
                    </a>
                  ) : (
                    <p className="mt-1 font-medium text-accent-300">{e.organization}</p>
                  )}
                  {tx(e.description) && <p className="mt-3 text-sm leading-relaxed text-zinc-400">{tx(e.description)}</p>}
                </div>
              </div>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------------------------------------------------------------- Projects */

// The mock address bar shows the real site or repo; an invented domain could belong to someone else.
export function frameAddress(p: Pick<ProjectCard, 'slug' | 'liveUrl' | 'repoUrl'>) {
  const link = p.liveUrl ?? p.repoUrl;
  return link ? link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : `localhost/${p.slug}`;
}

export function BrowserFrame({ src, alt, url, className = '' }: { src: string | null; alt: string; url: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl bg-ink-850 shadow-2xl ring-1 ring-white/10 ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-white/10 bg-ink-900 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 truncate rounded-md bg-white/5 px-3 py-0.5 font-mono text-[11px] text-zinc-500">{url}</span>
      </div>
      {src ? <img src={src} alt={alt} loading="lazy" className="aspect-[16/10] w-full bg-ink-800 object-cover object-top" /> : <div className="aspect-[16/10] bg-gradient-to-br from-accent-600/30 to-cyan-500/20" />}
    </div>
  );
}

function Projects({ projects }: { projects: ProjectCard[] }) {
  const { t, tx } = useLang();
  const featured = projects.find((p) => p.isFeatured) ?? projects[0];
  const rest = projects.filter((p) => p !== featured);
  if (!featured) return null;

  return (
    <section id="projects" className="relative scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading eyebrow={t('projectsEyebrow')} title={t('projectsTitle')} />

        <Reveal className="mt-12">
          <Link to={`/projects/${featured.slug}`} onMouseMove={trackSpotlight} className="spotlight card group grid items-center gap-10 overflow-hidden p-6 transition hover:ring-white/20 sm:p-10 lg:grid-cols-[1fr_1.25fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-brand px-3 py-1 text-xs font-bold text-white">
                <IconSparkle size={14} /> {t('featured')}
              </span>
              <h3 className="mt-5 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">{tx(featured.title)}</h3>
              <p className="mt-4 text-lg leading-relaxed text-zinc-400">{tx(featured.summary)}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {featured.tech.map((tech) => (
                  <TechChip key={tech} name={tech} size="sm" />
                ))}
              </div>
              <span className="mt-8 inline-flex items-center gap-2 font-semibold text-white">
                {t('viewCase')}
                <IconArrowRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-accent-500/25 via-fuchsia-500/15 to-cyan-400/20 blur-2xl transition group-hover:opacity-100 lg:opacity-70" />
              <BrowserFrame src={featured.coverImageUrl} alt={tx(featured.title)} url={frameAddress(featured)} className="relative transition duration-500 group-hover:-translate-y-1 group-hover:rotate-[-0.5deg]" />
            </div>
          </Link>
        </Reveal>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <Link to={`/projects/${p.slug}`} onMouseMove={trackSpotlight} className="spotlight card group flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:ring-white/20">
                <div className="overflow-hidden border-b border-white/10">
                  {p.coverImageUrl ? (
                    <img src={p.coverImageUrl} alt={tx(p.title)} loading="lazy" className="aspect-[16/10] w-full bg-ink-800 object-cover transition duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="aspect-[16/10] bg-gradient-to-br from-accent-600/30 to-cyan-500/20" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-xl font-bold leading-snug text-white">{tx(p.title)}</h3>
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-white/15 transition group-hover:bg-white group-hover:text-ink-950">
                      <IconArrowUpRight size={16} />
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-400">{tx(p.summary)}</p>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-5">
                    {p.tech.slice(0, 4).map((tech) => (
                      <TechChip key={tech} name={tech} size="sm" />
                    ))}
                    {p.tech.length > 4 && <TechChip name={`+${p.tech.length - 4}`} size="sm" />}
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Contact */

function Contact({ profile: p }: { profile: Profile }) {
  const { t, tx } = useLang();
  const [form, setForm] = useState({ name: '', email: '', message: '', website: '' });
  const [touched, setTouched] = useState(false);
  const send = useMutation({ mutationFn: () => siteApi.contact(form) });

  const errors = {
    name: form.name.trim().length < 2 ? t('errName') : null,
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ? null : t('errEmail'),
    message: form.message.trim().length < 10 ? t('errMessage') : null,
  };
  const valid = !errors.name && !errors.email && !errors.message;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (valid) send.mutate();
  };

  const reset = () => {
    setForm({ name: '', email: '', message: '', website: '' });
    setTouched(false);
    send.reset();
  };

  const channels = [
    { icon: <IconMail size={20} />, label: 'Email', value: p.email, href: `mailto:${p.email}` },
    p.telegram && { icon: <IconTelegram size={20} />, label: 'Telegram', value: p.telegram, href: telegramUrl(p.telegram) },
    p.phone && { icon: <IconPhone size={20} />, label: t('phone'), value: p.phone, href: `tel:${p.phone.replace(/\s/g, '')}` },
    { icon: <IconPin size={20} />, label: t('location'), value: tx(p.location) },
  ].filter((c): c is { icon: ReactElement; label: string; value: string; href?: string } => !!c);

  const fieldError = (message: string | null) => (touched && message ? <p className="mt-1.5 text-xs text-red-300">{message}</p> : null);

  return (
    <section id="contact" className="relative scroll-mt-24 overflow-hidden py-24 sm:py-32">
      <div className="absolute bottom-0 left-1/2 -z-10 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-600/20 via-fuchsia-500/15 to-cyan-400/15 blur-3xl" />
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <SectionHeading eyebrow={t('contactEyebrow')} title={t('contactTitle')} />
          <Reveal delay={100}>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-400">{t('contactText')}</p>
            <div className="mt-8 space-y-3">
              {channels.map((c) => {
                const body = (
                  <>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/5 text-white ring-1 ring-white/10">{c.icon}</span>
                    <span className="min-w-0">
                      <span className="block text-xs uppercase tracking-wider text-zinc-500">{c.label}</span>
                      <span className="block truncate font-medium text-white">{c.value}</span>
                    </span>
                  </>
                );
                return c.href ? (
                  <a key={c.label} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-4 rounded-2xl p-2 transition hover:bg-white/[0.03]">
                    {body}
                  </a>
                ) : (
                  <div key={c.label} className="flex items-center gap-4 p-2">
                    {body}
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>

        <Reveal delay={150}>
          <div className="card relative p-6 sm:p-8">
            {send.isSuccess ? (
              <div className="flex min-h-80 flex-col items-center justify-center text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-400/15 text-emerald-300 ring-1 ring-emerald-400/30">
                  <IconCheck size={30} />
                </span>
                <p className="mt-5 max-w-sm text-lg text-white">{t('formSent')}</p>
                <button onClick={reset} className="btn-ghost mt-6">
                  {t('formSendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="c-name">{t('formName')}</label>
                    <input id="c-name" className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} autoComplete="name" />
                    {fieldError(errors.name)}
                  </div>
                  <div>
                    <label className="label" htmlFor="c-email">{t('formEmail')}</label>
                    <input id="c-email" type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={150} autoComplete="email" />
                    {fieldError(errors.email)}
                  </div>
                </div>
                {/* Honeypot: invisible to people, tempting to bots. */}
                <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} name="website" />
                <div>
                  <label className="label" htmlFor="c-message">{t('formMessage')}</label>
                  <textarea id="c-message" rows={6} className="input resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} maxLength={3000} />
                  {fieldError(errors.message)}
                </div>
                {send.error && <ErrorBox error={send.error} />}
                <button className="btn-primary w-full py-4 text-base" disabled={send.isPending}>
                  {send.isPending ? t('formSending') : t('formSend')} <IconArrowRight size={18} />
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
