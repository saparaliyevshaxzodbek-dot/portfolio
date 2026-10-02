import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import type { Skill, SkillCategory } from '../../api/types';
import { ErrorBox, Modal, Spinner } from '../../components/ui';
import { Field, PageHeader, useToast } from './shared';

const CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'Backend', label: 'Backend' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Database', label: "Ma'lumotlar bazasi" },
  { value: 'Tools', label: 'Vositalar va sifat' },
];

export default function SkillsPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'skills'], queryFn: adminApi.skills });
  const [editing, setEditing] = useState<Skill | 'new' | null>(null);

  return (
    <>
      <PageHeader
        title="Ko'nikmalar"
        subtitle="Saytdagi texnologiyalar ro'yxati, toifalarga ajratilgan"
        actions={
          <button className="btn-primary" onClick={() => setEditing('new')}>
            + Qo'shish
          </button>
        }
      />
      {isLoading && <Spinner />}
      {error && <ErrorBox error={error} />}
      <div className="grid gap-5 md:grid-cols-2">
        {CATEGORIES.map((c) => (
          <section key={c.value} className="card p-6">
            <h2 className="font-display text-lg font-bold text-white">{c.label}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {data
                ?.filter((s) => s.category === c.value)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((s) => (
                  <button key={s.id} onClick={() => setEditing(s)} className="rounded-full bg-white/5 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-accent-400/50">
                    {s.name}
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
      {editing && <SkillForm skill={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </>
  );
}

function SkillForm({ skill, onClose }: { skill: Skill | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [form, setForm] = useState({ name: skill?.name ?? '', category: skill?.category ?? ('Backend' as SkillCategory), sortOrder: skill?.sortOrder ?? 100 });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['admin'] });
    void queryClient.invalidateQueries({ queryKey: ['site'] });
  };
  const save = useMutation({
    mutationFn: () => adminApi.saveSkill(skill?.id ?? null, form),
    onSuccess: () => {
      refresh();
      toast('Saqlandi');
      onClose();
    },
  });
  const remove = useMutation({
    mutationFn: () => adminApi.deleteSkill(skill!.id),
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

  return (
    <Modal title={skill ? "Ko'nikmani tahrirlash" : "Yangi ko'nikma"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nomi">
          <input className="input" value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Toifa">
            <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as SkillCategory })}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value} className="bg-ink-900">
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tartib">
            <input className="input" type="number" min={0} max={1000} value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </Field>
        </div>
        {(save.error || remove.error) && <ErrorBox error={save.error ?? remove.error} />}
        <div className="flex items-center gap-2 pt-2">
          {skill && (
            <button type="button" className="btn-danger px-4 py-2" disabled={remove.isPending} onClick={() => window.confirm("O'chirasizmi?") && remove.mutate()}>
              O'chirish
            </button>
          )}
          <button type="button" className="btn-ghost ml-auto px-4 py-2" onClick={onClose}>
            Bekor qilish
          </button>
          <button className="btn-primary px-5 py-2" disabled={save.isPending || !form.name.trim()}>
            Saqlash
          </button>
        </div>
      </form>
    </Modal>
  );
}
