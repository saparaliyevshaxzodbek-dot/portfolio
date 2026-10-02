import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import type { Profile } from '../../api/types';
import { ErrorBox, Spinner, initials } from '../../components/ui';
import { Field, LocalizedField, PageHeader, Toggle, UploadButton, useToast } from './shared';

export default function ProfilePage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'profile'], queryFn: adminApi.profile });
  if (isLoading) return <Spinner />;
  if (error || !data) return <ErrorBox error={error} />;
  return <ProfileForm initial={data} />;
}

function ProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState<Profile>(initial);
  const queryClient = useQueryClient();
  const toast = useToast();
  useEffect(() => setForm(initial), [initial]);

  const save = useMutation({
    mutationFn: () => adminApi.saveProfile(form),
    onSuccess: (saved) => {
      queryClient.setQueryData(['admin', 'profile'], saved);
      void queryClient.invalidateQueries({ queryKey: ['site'] });
      toast('Profil saqlandi');
    },
    onError: (e) => toast(e.message, 'error'),
  });

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => setForm((f) => ({ ...f, [key]: value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <form onSubmit={submit}>
      <PageHeader
        title="Profil"
        subtitle="Saytdagi ism, sarlavha, matnlar va aloqa ma'lumotlari"
        actions={
          <button className="btn-primary" disabled={save.isPending}>
            {save.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="card space-y-6 p-6">
          <Field label="To'liq ism">
            <input className="input" value={form.fullName} maxLength={100} onChange={(e) => set('fullName', e.target.value)} />
          </Field>
          <LocalizedField label="Sarlavha (kasb)" value={form.headline} onChange={(v) => set('headline', v)} maxLength={150} />
          <LocalizedField label="Qisqa tanishtiruv (hero)" value={form.summary} onChange={(v) => set('summary', v)} multiline rows={3} maxLength={400} />
          <LocalizedField label="Men haqimda" hint="Bo'sh qator bilan xatboshilarga ajrating" value={form.about} onChange={(v) => set('about', v)} multiline rows={9} maxLength={6000} />
          <LocalizedField label="Manzil" value={form.location} onChange={(v) => set('location', v)} maxLength={150} />
        </div>

        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <p className="label">Rasm</p>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
                {form.photoUrl ? (
                  <img src={form.photoUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-gradient grid h-full w-full place-items-center font-display text-2xl font-bold">{initials(form.fullName)}</span>
                )}
              </div>
              <div className="space-y-2">
                <UploadButton accept="image/jpeg,image/png,image/webp" label="Rasm yuklash" onUploaded={(url) => set('photoUrl', url)} />
                {form.photoUrl && (
                  <button type="button" className="block text-xs text-zinc-500 hover:text-red-300" onClick={() => set('photoUrl', null)}>
                    Olib tashlash
                  </button>
                )}
              </div>
            </div>
            <p className="label pt-2">CV (PDF)</p>
            <div className="flex flex-wrap items-center gap-3">
              <UploadButton accept="application/pdf" label="PDF yuklash" onUploaded={(url) => set('cvUrl', url)} />
              {form.cvUrl && (
                <>
                  <a href={form.cvUrl} target="_blank" rel="noreferrer" className="text-sm text-accent-300 hover:underline">
                    Ko'rish
                  </a>
                  <button type="button" className="text-xs text-zinc-500 hover:text-red-300" onClick={() => set('cvUrl', null)}>
                    Olib tashlash
                  </button>
                </>
              )}
            </div>
            <div className="pt-2">
              <Toggle checked={form.openToWork} onChange={(v) => set('openToWork', v)} label="Ish takliflariga ochiqman" />
            </div>
          </div>

          <div className="card space-y-4 p-6">
            <Field label="Email">
              <input className="input" type="email" value={form.email} maxLength={150} onChange={(e) => set('email', e.target.value)} />
            </Field>
            <Field label="Telefon">
              <input className="input" value={form.phone ?? ''} maxLength={30} placeholder="+998 90 123 45 67" onChange={(e) => set('phone', e.target.value || null)} />
            </Field>
            <Field label="Telegram" hint="username yoki to'liq havola">
              <input className="input" value={form.telegram ?? ''} maxLength={200} placeholder="@username" onChange={(e) => set('telegram', e.target.value || null)} />
            </Field>
            <Field label="GitHub">
              <input className="input" value={form.gitHub ?? ''} maxLength={200} placeholder="https://github.com/..." onChange={(e) => set('gitHub', e.target.value || null)} />
            </Field>
            <Field label="LinkedIn">
              <input className="input" value={form.linkedIn ?? ''} maxLength={200} placeholder="https://linkedin.com/in/..." onChange={(e) => set('linkedIn', e.target.value || null)} />
            </Field>
          </div>
        </div>
      </div>
    </form>
  );
}
