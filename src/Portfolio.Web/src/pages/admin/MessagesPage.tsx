import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/endpoints';
import { ErrorBox, Spinner } from '../../components/ui';
import { PageHeader, useToast } from './shared';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'messages'], queryFn: adminApi.messages });

  const refresh = () => void queryClient.invalidateQueries({ queryKey: ['admin'] });
  const setRead = useMutation({
    mutationFn: ({ id, isRead }: { id: number; isRead: boolean }) => adminApi.setRead(id, isRead),
    onSuccess: refresh,
    onError: (e) => toast(e.message, 'error'),
  });
  const remove = useMutation({
    mutationFn: (id: number) => adminApi.deleteMessage(id),
    onSuccess: () => {
      refresh();
      toast("Xabar o'chirildi");
    },
    onError: (e) => toast(e.message, 'error'),
  });

  return (
    <>
      <PageHeader title="Xabarlar" subtitle="Saytdagi aloqa formasidan kelgan xabarlar" />
      {isLoading && <Spinner />}
      {error && <ErrorBox error={error} />}
      {data?.length === 0 && <p className="card p-10 text-center text-zinc-400">Hozircha xabar yo'q.</p>}
      <div className="space-y-3">
        {data?.map((m) => (
          <article key={m.id} className={`card p-5 ${m.isRead ? 'opacity-70' : 'ring-accent-400/40'}`}>
            <header className="flex flex-wrap items-center gap-2">
              {!m.isRead && <span className="h-2 w-2 rounded-full bg-accent-400" />}
              <p className="font-semibold text-white">{m.name}</p>
              <a href={`mailto:${m.email}`} className="text-sm text-accent-300 hover:underline">
                {m.email}
              </a>
              <span className="ml-auto font-mono text-xs text-zinc-500">{formatDate(m.createdAt)}</span>
            </header>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-300">{m.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: portfolio')}`} className="btn-accent px-4 py-2 text-xs">
                Javob yozish
              </a>
              <button className="btn-ghost px-4 py-2 text-xs" onClick={() => setRead.mutate({ id: m.id, isRead: !m.isRead })}>
                {m.isRead ? "O'qilmagan qilish" : "O'qildi"}
              </button>
              <button className="btn-danger px-4 py-2 text-xs" onClick={() => window.confirm("Xabarni o'chirasizmi?") && remove.mutate(m.id)}>
                O'chirish
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
