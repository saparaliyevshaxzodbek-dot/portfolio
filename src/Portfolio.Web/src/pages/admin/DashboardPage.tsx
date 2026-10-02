import { Link } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { ErrorBox, Spinner } from '../../components/ui';
import { PageHeader } from './shared';

const DAYS = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];

export default function DashboardPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.dashboard });
  const messages = useQuery({ queryKey: ['admin', 'messages'], queryFn: adminApi.messages });

  if (isLoading) return <Spinner />;
  if (error || !data) return <ErrorBox error={error} />;

  const max = Math.max(1, ...data.last14Days.map((d) => d.count));
  const kpis = [
    { label: 'Bugungi tashriflar', value: data.visitsToday, tone: 'text-accent-300' },
    { label: '30 kunlik tashriflar', value: data.visitsLast30Days, tone: 'text-cyan-300' },
    { label: "O'qilmagan xabarlar", value: data.unreadMessages, tone: 'text-fuchsia-300' },
    { label: 'Loyihalar / texnologiyalar', value: `${data.projects} / ${data.skills}`, tone: 'text-emerald-300' },
  ];

  return (
    <>
      <PageHeader title="Boshqaruv" subtitle="Sayt statistikasi va so'nggi xabarlar" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{k.label}</p>
            <p className={`mt-2 font-display text-3xl font-bold ${k.tone}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section className="card p-6">
          <h2 className="font-display text-lg font-bold text-white">Tashriflar, oxirgi 14 kun</h2>
          <div className="mt-6 flex h-52 items-end gap-2">
            {data.last14Days.map((d, i) => {
              const today = i === data.last14Days.length - 1;
              return (
                <div key={d.date} className="group flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${d.date}: ${d.count}`}>
                  <span className="text-[10px] font-semibold text-zinc-400 opacity-0 transition group-hover:opacity-100">{d.count}</span>
                  <div className={`w-full rounded-t-md transition ${today ? 'bg-gradient-to-t from-accent-600 to-fuchsia-400' : 'bg-white/15 group-hover:bg-white/25'}`} style={{ height: `${Math.max((d.count / max) * 100, 3)}%` }} />
                  <span className={`text-[10px] ${today ? 'font-bold text-white' : 'text-zinc-500'}`}>{DAYS[new Date(`${d.date}T12:00:00`).getDay()]}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">So'nggi xabarlar</h2>
            <Link to="/admin/messages" className="text-sm font-semibold text-accent-300 hover:text-accent-400">
              Hammasi →
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {messages.data?.slice(0, 4).map((m) => (
              <li key={m.id} className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/10">
                <p className="flex items-center gap-2 text-sm font-semibold text-white">
                  {!m.isRead && <span className="h-2 w-2 rounded-full bg-accent-400" />}
                  {m.name} <span className="font-normal text-zinc-500">· {m.email}</span>
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{m.message}</p>
              </li>
            ))}
            {messages.data?.length === 0 && <p className="text-sm text-zinc-500">Hozircha xabar yo'q.</p>}
          </ul>
        </section>
      </div>
    </>
  );
}
