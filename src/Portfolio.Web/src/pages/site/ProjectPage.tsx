import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { siteApi } from '../../api/endpoints';
import type { ProjectImage } from '../../api/types';
import { useLang } from '../../i18n';
import { Paragraphs, Reveal, Spinner, TechChip, useLockBodyScroll } from '../../components/ui';
import { IconArrowLeft, IconArrowUpRight, IconCheck, IconChevronLeft, IconChevronRight, IconClose, IconGitHub } from '../../components/icons';
import { BrowserFrame } from './HomePage';

export default function ProjectPage() {
  const { slug = '' } = useParams();
  const { t, tx } = useLang();
  const { data: project, isLoading, error } = useQuery({ queryKey: ['project', slug], queryFn: () => siteApi.project(slug), retry: false });
  const [lightbox, setLightbox] = useState<number | null>(null);

  useEffect(() => {
    if (!project) return;
    const previous = document.title;
    document.title = `${tx(project.title)} — Portfolio`;
    return () => {
      document.title = previous;
    };
  }, [project, tx]);

  if (isLoading) return <Spinner className="min-h-dvh items-center" />;
  if (error || !project) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="font-display text-7xl font-bold text-gradient">404</p>
        <p className="mt-4 text-lg text-white">{t('notFound')}</p>
        <Link to="/" className="btn-primary mt-8">
          {t('goHome')}
        </Link>
      </div>
    );
  }

  const highlights = tx(project.highlights).split('\n').map((h) => h.trim()).filter(Boolean);

  return (
    <article className="relative isolate overflow-hidden pb-24 pt-28 sm:pt-36">
      <div className="bg-grid absolute inset-x-0 top-0 -z-10 h-[40rem]" />
      <div className="absolute -top-40 left-1/2 -z-10 h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-600/25 via-fuchsia-500/15 to-cyan-400/15 blur-3xl" />

      <div className="mx-auto max-w-6xl px-5">
        <Reveal>
          <Link to="/#projects" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-400 transition hover:text-white">
            <IconArrowLeft size={16} /> {t('backToProjects')}
          </Link>
          <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">{tx(project.title)}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-zinc-400 sm:text-xl">{tx(project.summary)}</p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer" className="btn-primary">
                {t('liveDemo')} <IconArrowUpRight size={16} />
              </a>
            )}
            {project.repoUrl && (
              <a href={project.repoUrl} target="_blank" rel="noreferrer" className="btn-ghost">
                <IconGitHub size={18} /> {t('sourceCode')}
              </a>
            )}
          </div>
        </Reveal>

        <Reveal delay={120} className="relative mt-14">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-gradient-to-br from-accent-500/20 via-fuchsia-500/10 to-cyan-400/15 blur-3xl" />
          <BrowserFrame src={project.coverImageUrl} alt={tx(project.title)} url={`${project.slug}.uz`} />
        </Reveal>

        <div className="mt-20 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <Reveal>
            <h2 className="font-display text-2xl font-bold text-white">{t('overview')}</h2>
            <div className="mt-5 space-y-5 text-lg leading-relaxed text-zinc-400">
              <Paragraphs text={tx(project.description)} />
            </div>
          </Reveal>
          <Reveal delay={100} className="space-y-6">
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-white">{t('highlights')}</h2>
              <ul className="mt-4 space-y-3">
                {highlights.map((h) => (
                  <li key={h} className="flex gap-3 text-sm leading-relaxed text-zinc-300">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <IconCheck size={12} />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">{t('techUsed')}</h2>
                <span className="font-mono text-xs text-zinc-500">
                  {t('year')} · {project.year}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.tech.map((tech) => (
                  <TechChip key={tech} name={tech} />
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        {project.images.length > 0 && (
          <section className="mt-24">
            <Reveal>
              <h2 className="font-display text-3xl font-bold text-white">{t('gallery')}</h2>
            </Reveal>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {project.images.map((image, i) => (
                <Reveal key={image.id} delay={(i % 2) * 90}>
                  <button onClick={() => setLightbox(i)} className="group block w-full text-left">
                    <div className="overflow-hidden rounded-2xl ring-1 ring-white/10 transition group-hover:ring-white/30">
                      <img src={image.url} alt={tx(image.caption)} loading="lazy" className="aspect-[16/10] w-full bg-ink-800 object-cover object-top transition duration-700 group-hover:scale-[1.03]" />
                    </div>
                    {tx(image.caption) && <p className="mt-3 text-sm text-zinc-400">{tx(image.caption)}</p>}
                  </button>
                </Reveal>
              ))}
            </div>
          </section>
        )}
      </div>

      {lightbox !== null && <Lightbox images={project.images} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} />}
    </article>
  );
}

function Lightbox({ images, index, onIndex, onClose }: {
  images: ProjectImage[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
}) {
  const { tx } = useLang();
  useLockBodyScroll();
  const step = useCallback((delta: number) => onIndex((index + delta + images.length) % images.length), [index, images.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, step]);

  const image = images[index]!;
  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-black/90 backdrop-blur-md" onClick={onClose} role="dialog" aria-modal="true">
      <div className="flex items-center justify-between px-5 py-4 text-sm text-zinc-400">
        <span className="font-mono">
          {index + 1} / {images.length}
        </span>
        <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full text-white ring-1 ring-white/20 hover:bg-white/10" aria-label="Close">
          <IconClose />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20" onClick={(e) => e.stopPropagation()}>
        <img src={image.url} alt={tx(image.caption)} className="animate-pop-in max-h-full max-w-full rounded-xl object-contain shadow-2xl" key={image.id} />
        {images.length > 1 && (
          <>
            <button onClick={() => step(-1)} className="absolute left-2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:left-6" aria-label="Previous">
              <IconChevronLeft />
            </button>
            <button onClick={() => step(1)} className="absolute right-2 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:right-6" aria-label="Next">
              <IconChevronRight />
            </button>
          </>
        )}
      </div>
      <p className="px-5 py-5 text-center text-sm text-zinc-300" onClick={(e) => e.stopPropagation()}>
        {tx(image.caption)}
      </p>
    </div>
  );
}
