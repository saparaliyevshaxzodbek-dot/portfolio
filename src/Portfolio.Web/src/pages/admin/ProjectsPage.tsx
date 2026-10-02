import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import type { Project, ProjectRequest } from '../../api/types';
import { ErrorBox, Modal, Spinner } from '../../components/ui';
import { Field, LocalizedField, PageHeader, Toggle, UploadButton, emptyText, useToast } from './shared';

export default function ProjectsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'projects'], queryFn: adminApi.projects });
  const [editing, setEditing] = useState<Project | 'new' | null>(null);

  return (
    <>
      <PageHeader
        title="Loyihalar"
        subtitle="Portfoliodagi ishlar, rasmlar va havolalar"
        actions={
          <button className="btn-primary" onClick={() => setEditing('new')}>
            + Loyiha qo'shish
          </button>
        }
      />
      {isLoading && <Spinner />}
      {error && <ErrorBox error={error} />}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {data?.map((p) => (
          <button key={p.id} onClick={() => setEditing(p)} className={`card overflow-hidden text-left transition hover:ring-white/20 ${p.isPublished ? '' : 'opacity-60'}`}>
            {p.coverImageUrl ? <img src={p.coverImageUrl} alt="" className="aspect-[16/10] w-full object-cover object-top" /> : <div className="aspect-[16/10] bg-white/5" />}
            <div className="p-5">
              <div className="flex flex-wrap gap-2">
                {p.isFeatured && <span className="rounded-full bg-accent-500/20 px-2 py-0.5 text-[11px] font-bold text-accent-300">Asosiy</span>}
                {!p.isPublished && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300">Yashirin</span>}
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-bold text-zinc-300">{p.images.length} rasm</span>
              </div>
              <p className="mt-3 font-semibold text-white">{p.title.en}</p>
              <p className="mt-1 font-mono text-xs text-zinc-500">/projects/{p.slug}</p>
            </div>
          </button>
        ))}
      </div>
      {editing && <ProjectForm project={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function ProjectForm({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [current, setCurrent] = useState<Project | null>(project);
  const [form, setForm] = useState<ProjectRequest>({
    slug: project?.slug ?? '',
    title: project?.title ?? emptyText(),
    summary: project?.summary ?? emptyText(),
    description: project?.description ?? emptyText(),
    highlights: project?.highlights ?? emptyText(),
    techStack: project?.tech.join(', ') ?? '',
    coverImageUrl: project?.coverImageUrl ?? null,
    repoUrl: project?.repoUrl ?? null,
    liveUrl: project?.liveUrl ?? null,
    year: project?.year ?? new Date().getFullYear(),
    isFeatured: project?.isFeatured ?? false,
    isPublished: project?.isPublished ?? true,
    sortOrder: project?.sortOrder ?? 100,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['site'] });
    void queryClient.invalidateQueries({ queryKey: ['project'] });
  };
  const save = useMutation({
    mutationFn: () => adminApi.saveProject(current?.id ?? null, form),
    onSuccess: (saved) => {
      refresh();
      setCurrent(saved);
      toast('Loyiha saqlandi');
    },
  });
  const remove = useMutation({
    mutationFn: () => adminApi.deleteProject(current!.id),
    onSuccess: () => {
      refresh();
      toast("Loyiha o'chirildi");
      onClose();
    },
  });
  const addImage = useMutation({
    mutationFn: (url: string) => adminApi.addImage(current!.id, { url, caption: null, sortOrder: (current?.images.length ?? 0) * 10 + 10 }),
    onSuccess: (image) => {
      setCurrent((p) => (p ? { ...p, images: [...p.images, image] } : p));
      refresh();
    },
    onError: (e) => toast(e.message, 'error'),
  });
  const removeImage = useMutation({
    mutationFn: (imageId: number) => adminApi.deleteImage(current!.id, imageId),
    onSuccess: (_, imageId) => {
      setCurrent((p) => (p ? { ...p, images: p.images.filter((i) => i.id !== imageId) } : p));
      refresh();
    },
    onError: (e) => toast(e.message, 'error'),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  return (
    <Modal title={current ? 'Loyihani tahrirlash' : 'Yangi loyiha'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <LocalizedField label="Nomi" value={form.title} onChange={(v) => setForm({ ...form, title: v })} maxLength={150} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Manzil (slug)" hint="masalan: dasturxon">
            <input className="input font-mono" value={form.slug} maxLength={80} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} />
          </Field>
          <Field label="Yil">
            <input className="input" type="number" min={2000} max={2100} value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          </Field>
          <Field label="Tartib">
            <input className="input" type="number" min={0} max={1000} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
        </div>
        <LocalizedField label="Qisqa tavsif (karta uchun)" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} multiline rows={2} maxLength={400} />
        <LocalizedField label="To'liq tavsif" hint="Bo'sh qator bilan xatboshilarga ajrating" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline rows={7} maxLength={6000} />
        <LocalizedField label="Asosiy natijalar" hint="Har biri alohida qatorda" value={form.highlights} onChange={(v) => setForm({ ...form, highlights: v })} multiline rows={5} maxLength={6000} />
        <Field label="Texnologiyalar" hint="Vergul bilan ajrating">
          <input className="input" value={form.techStack} maxLength={500} onChange={(e) => setForm({ ...form, techStack: e.target.value })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Manba kodi (GitHub)">
            <input className="input" value={form.repoUrl ?? ''} maxLength={300} placeholder="https://github.com/..." onChange={(e) => setForm({ ...form, repoUrl: e.target.value || null })} />
          </Field>
          <Field label="Jonli demo">
            <input className="input" value={form.liveUrl ?? ''} maxLength={300} placeholder="https://" onChange={(e) => setForm({ ...form, liveUrl: e.target.value || null })} />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-white/10">
          {form.coverImageUrl && <img src={form.coverImageUrl} alt="" className="h-16 w-24 rounded-lg object-cover object-top" />}
          <UploadButton accept="image/jpeg,image/png,image/webp" label="Muqova rasmi" onUploaded={(url) => setForm({ ...form, coverImageUrl: url })} />
          <div className="ml-auto flex flex-wrap gap-5">
            <Toggle checked={form.isFeatured} onChange={(v) => setForm({ ...form, isFeatured: v })} label="Asosiy loyiha" />
            <Toggle checked={form.isPublished} onChange={(v) => setForm({ ...form, isPublished: v })} label="Saytda ko'rinsin" />
          </div>
        </div>

        {current && (
          <div>
            <p className="label">Galereya</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {current.images.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-xl ring-1 ring-white/10">
                  <img src={image.url} alt="" className="aspect-[16/10] w-full object-cover object-top" />
                  <button type="button" onClick={() => removeImage.mutate(image.id)} className="absolute right-1.5 top-1.5 rounded-full bg-black/70 px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100" aria-label="Rasmni o'chirish">
                    ✕
                  </button>
                </div>
              ))}
              <div className="grid aspect-[16/10] place-items-center rounded-xl border border-dashed border-white/15">
                <UploadButton accept="image/jpeg,image/png,image/webp" label="+ Rasm" onUploaded={(url) => addImage.mutate(url)} />
              </div>
            </div>
          </div>
        )}
        {!current && <p className="text-xs text-zinc-500">Galereyaga rasm qo'shish loyiha saqlangandan keyin ochiladi.</p>}

        {(save.error || remove.error) && <ErrorBox error={save.error ?? remove.error} />}
        <div className="flex items-center gap-2 pt-2">
          {current && (
            <button type="button" className="btn-danger px-4 py-2" disabled={remove.isPending} onClick={() => window.confirm("Loyihani o'chirasizmi?") && remove.mutate()}>
              O'chirish
            </button>
          )}
          <button type="button" className="btn-ghost ml-auto px-4 py-2" onClick={onClose}>
            Yopish
          </button>
          <button className="btn-primary px-5 py-2" disabled={save.isPending || !form.title.en.trim() || !form.slug || !form.summary.en.trim()}>
            {save.isPending ? 'Saqlanmoqda…' : 'Saqlash'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
