import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import type { Experience, ExperienceRequest, ExperienceType } from '../../api/types';
import { ErrorBox, Modal, Spinner } from '../../components/ui';
import { Field, LocalizedField, PageHeader, Toggle, emptyText, useToast } from './shared';

const TYPES: { value: ExperienceType; label: string }[] = [
  { value: 'Work', label: 'Ish / stajirovka' },
  { value: 'Education', label: "Ta'lim" },
  { value: 'Course', label: 'Kurs' },
];

const month = (iso: string) => iso.slice(0, 7);

export default function TimelinePage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'experiences'], queryFn: adminApi.experiences });
  const [editing, setEditing] = useState<Experience | 'new' | null>(null);

  return (
    <>
      <PageHeader
        title="Tajriba va ta'lim"
        subtitle="Saytdagi vaqt chizig'i: ish, ta'lim va kurslar"
        actions={
          <button className="btn-primary" onClick={() => setEditing('new')}>
            + Qo'shish
          </button>
        }
      />
      {isLoading && <Spinner />}
      {error && <ErrorBox error={error} />}
      <div className="space-y-3">
        {data?.map((e) => (
          <button key={e.id} onClick={() => setEditing(e)} className="card flex w-full flex-wrap items-center gap-4 p-5 text-left transition hover:ring-white/20">
            <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold text-zinc-300 ring-1 ring-white/10">{TYPES.find((t) => t.value === e.type)?.label}</span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold text-white">{e.title.en}</span>
              <span className="block text-sm text-zinc-400">{e.organization}</span>
            </span>
            <span className="font-mono text-xs text-zinc-500">
              {month(e.startDate)} — {e.endDate ? month(e.endDate) : 'hozirgacha'}
            </span>
          </button>
        ))}
      </div>
      {editing && <ExperienceForm item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function ExperienceForm({ item, onClose }: { item: Experience | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState<ExperienceRequest>({
    type: item?.type ?? 'Work',
    title: item?.title ?? emptyText(),
    organization: item?.organization ?? '',
    description: item?.description ?? emptyText(),
    startDate: item?.startDate ?? new Date().toISOString().slice(0, 10),
    endDate: item?.endDate ?? null,
    url: item?.url ?? null,
    sortOrder: item?.sortOrder ?? 100,
  });
  const ongoing = form.endDate === null;

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['site'] });
  };
  const save = useMutation({
    mutationFn: () => adminApi.saveExperience(item?.id ?? null, form),
    onSuccess: () => {
      refresh();
      toast('Saqlandi');
      onClose();
    },
  });
  const remove = useMutation({
    mutationFn: () => adminApi.deleteExperience(item!.id),
    onSuccess: () => {
      refresh();
      toast("O'chirildi");
      onClose();
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    save.mutate();
  };

  // <input type="month"> works with "YYYY-MM"; the API stores the first day of that month.
  const toDate = (value: string) => (value ? `${value}-01` : '');

  return (
    <Modal title={item ? 'Tahrirlash' : 'Yangi yozuv'} onClose={onClose} wide>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Turi">
            <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ExperienceType })}>
              {TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-ink-900">
                  {t.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tashkilot">
            <input className="input" value={form.organization} maxLength={150} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
          </Field>
        </div>
        <LocalizedField label="Lavozim / yo'nalish" value={form.title} onChange={(v) => setForm({ ...form, title: v })} maxLength={150} />
        <LocalizedField label="Tavsif" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline rows={4} maxLength={2000} />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Boshlangan">
            <input className="input" type="month" value={month(form.startDate)} onChange={(e) => setForm({ ...form, startDate: toDate(e.target.value) })} />
          </Field>
          <Field label="Tugagan">
            <input className="input" type="month" disabled={ongoing} value={form.endDate ? month(form.endDate) : ''} onChange={(e) => setForm({ ...form, endDate: toDate(e.target.value) || null })} />
          </Field>
          <div className="flex items-end pb-3">
            <Toggle checked={ongoing} onChange={(v) => setForm({ ...form, endDate: v ? null : form.startDate })} label="Hozirgacha davom etmoqda" />
          </div>
        </div>
        <Field label="Havola (ixtiyoriy)">
          <input className="input" value={form.url ?? ''} maxLength={300} placeholder="https://" onChange={(e) => setForm({ ...form, url: e.target.value || null })} />
        </Field>
        {(save.error || remove.error) && <ErrorBox error={save.error ?? remove.error} />}
        <div className="flex items-center gap-2 pt-2">
          {item && (
            <button type="button" className="btn-danger px-4 py-2" disabled={remove.isPending} onClick={() => window.confirm("O'chirasizmi?") && remove.mutate()}>
              O'chirish
            </button>
          )}
          <button type="button" className="btn-ghost ml-auto px-4 py-2" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn-primary px-5 py-2" disabled={save.isPending || !form.title.en.trim() || !form.organization.trim() || !form.startDate}>
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
}
