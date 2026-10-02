import { useEffect, useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { IconClose } from './icons';

/** Fades its content in the first time it scrolls into view. */
export function Reveal({ children, delay = 0, className = '', as: Tag = 'div' }: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <Tag ref={ref as never} className={`reveal ${className}`} style={{ '--delay': `${delay}ms` } as CSSProperties}>
      {children}
    </Tag>
  );
}

/** Mouse handler that lets `.spotlight` cards glow under the cursor. */
export function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
}

export function SectionHeading({ eyebrow, title, align = 'left' }: { eyebrow: string; title: string; align?: 'left' | 'center' }) {
  return (
    <Reveal className={align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.25em] text-accent-300">
        <span className="text-zinc-600">// </span>
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">{title}</h2>
    </Reveal>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`flex justify-center py-16 ${className}`} role="status" aria-label="Loading">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-accent-400" />
    </div>
  );
}

export function ErrorBox({ error }: { error: unknown }) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-300 ring-1 ring-red-500/30">{message}</div>;
}

export function TechChip({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/[0.05] font-medium text-zinc-200 ring-1 ring-white/10 ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      {name}
    </span>
  );
}

export function useLockBodyScroll() {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  useLockBodyScroll();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`animate-pop-in max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl bg-ink-900 ring-1 ring-white/10 sm:rounded-3xl ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-ink-900/95 px-6 py-4 backdrop-blur">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white" aria-label="Close">
            <IconClose />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

/** Splits text on blank lines into paragraphs. */
export function Paragraphs({ text, className = '' }: { text: string; className?: string }) {
  return (
    <>
      {text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className={className}>
            {p}
          </p>
        ))}
    </>
  );
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

/** Accepts "user", "@user" or a full URL and returns a link. */
export function telegramUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://t.me/${value.replace(/^@/, '')}`;
}

export function externalUrl(value: string): string {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
