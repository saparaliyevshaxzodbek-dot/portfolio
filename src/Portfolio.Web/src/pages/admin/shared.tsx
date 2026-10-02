import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { adminApi } from '../../api/endpoints';
import type { Text } from '../../api/types';

/* ---------------- Toasts ---------------- */

type Tone = 'success' | 'error';
const ToastContext = createContext<(text: string, tone?: Tone) => void>(() => {});
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<{ id: number; text: string; tone: Tone }[]>([]);
  const show = useCallback((text: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((all) => [...all, { id, text, tone }]);
    setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), 3500);
  }, []);
  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[90] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`animate-pop-in rounded-xl px-4 py-3 text-sm font-medium text-white shadow-2xl ${t.tone === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ---------------- Form pieces ---------------- */

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-3xl font-bold text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** One field in both languages, side by side. */
export function LocalizedField({ label, value, onChange, multiline = false, rows = 4, maxLength, hint }: {
  label: string;
  value: Text;
  onChange: (value: Text) => void;
  multiline?: boolean;
  rows?: number;
  maxLength: number;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="label">{label}</legend>
      {hint && <p className="-mt-1 mb-2 text-xs text-zinc-500">{hint}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {(['en', 'uz'] as const).map((lang) => (
          <div key={lang} className="relative">
            <span className="absolute right-3 top-2.5 z-10 rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-zinc-300">{lang}</span>
            {multiline ? (
              <textarea className="input pr-12" rows={rows} maxLength={maxLength} value={value[lang]} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} aria-label={`${label} (${lang})`} />
            ) : (
              <input className="input pr-12" maxLength={maxLength} value={value[lang]} onChange={(e) => onChange({ ...value, [lang]: e.target.value })} aria-label={`${label} (${lang})`} />
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-zinc-500">{hint}</span>}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-zinc-200">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="relative h-6 w-11 rounded-full bg-white/15 transition peer-checked:bg-accent-500 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-5" />
      {label}
    </label>
  );
}

/** File picker that uploads straight away and reports the stored URL. */
export function UploadButton({ accept, label, onUploaded }: { accept: string; label: string; onUploaded: (url: string) => void }) {
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const { url } = await adminApi.upload(file);
      onUploaded(url);
      toast('Fayl yuklandi');
    } catch (e) {
      toast(e instanceof Error ? e.message : "Yuklab bo'lmadi", 'error');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      <button type="button" className="btn-ghost px-4 py-2" disabled={busy} onClick={() => input.current?.click()}>
        {busy ? 'Yuklanmoqda…' : label}
      </button>
      <input ref={input} type="file" accept={accept} className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
    </>
  );
}

export const emptyText = (): Text => ({ en: '', uz: '' });
