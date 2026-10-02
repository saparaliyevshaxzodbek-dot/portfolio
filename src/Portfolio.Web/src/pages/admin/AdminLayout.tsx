import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { loadSession, onUnauthorized, saveSession } from '../../api/client';
import { adminApi, authApi } from '../../api/endpoints';
import { ErrorBox } from '../../components/ui';
import { ToastProvider } from './shared';

export function RequireAdmin({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!loadSession()) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

const NAV = [
  { to: '/admin', label: 'Boshqaruv', icon: '📊', end: true },
  { to: '/admin/profile', label: 'Profil', icon: '👤' },
  { to: '/admin/skills', label: "Ko'nikmalar", icon: '🧩' },
  { to: '/admin/timeline', label: "Tajriba va ta'lim", icon: '🎓' },
  { to: '/admin/projects', label: 'Loyihalar', icon: '🚀' },
  { to: '/admin/messages', label: 'Xabarlar', icon: '✉️' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const { data: dashboard } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminApi.dashboard, refetchInterval: 60_000 });

  useEffect(() => {
    onUnauthorized(() => {
      saveSession(null);
      navigate('/admin/login', { replace: true });
    });
    return () => onUnauthorized(null);
  }, [navigate]);

  const logout = () => {
    saveSession(null);
    navigate('/admin/login', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`;

  return (
    <ToastProvider>
      <div className="min-h-dvh lg:flex">
        <aside className="border-b border-white/10 bg-ink-900 p-4 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between lg:block">
            <Link to="/" className="font-display text-lg font-bold text-white">
              <span className="text-gradient">Portfolio</span> admin
            </Link>
            <button onClick={logout} className="text-sm text-zinc-400 hover:text-white lg:hidden">
              Chiqish
            </button>
          </div>
          <nav className="no-scrollbar mt-4 flex gap-1 overflow-x-auto lg:mt-8 lg:flex-1 lg:flex-col lg:overflow-visible">
            {NAV.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} className={(p) => `${linkClass(p)} shrink-0`}>
                <span>{item.icon}</span>
                {item.label}
                {item.to === '/admin/messages' && !!dashboard?.unreadMessages && (
                  <span className="ml-auto rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-white">{dashboard.unreadMessages}</span>
                )}
              </NavLink>
            ))}
            <a href="/" target="_blank" rel="noreferrer" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white">
              <span>🌐</span> Saytni ochish
            </a>
          </nav>
          <div className="mt-4 hidden rounded-xl bg-white/5 p-3 lg:block">
            <p className="text-sm font-semibold text-white">{loadSession()?.username}</p>
            <button onClick={logout} className="mt-1 text-xs font-semibold text-accent-300 hover:text-accent-400">
              Chiqish →
            </button>
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-5 sm:p-8 lg:p-10">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? '/admin';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  if (loadSession()) return <Navigate to="/admin" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      saveSession(await authApi.login(username, password));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-5">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="absolute left-1/2 top-1/3 -z-10 h-96 w-[40rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-accent-600/30 via-fuchsia-500/20 to-cyan-400/20 blur-3xl" />
      <form onSubmit={submit} className="card w-full max-w-sm space-y-5 p-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Admin panel</h1>
          <p className="mt-1 text-sm text-zinc-400">Saytdagi ma'lumotlarni tahrirlash uchun kiring</p>
        </div>
        <label className="block">
          <span className="label">Login</span>
          <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus />
        </label>
        <label className="block">
          <span className="label">Parol</span>
          <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </label>
        {error != null && <ErrorBox error={error} />}
        <button className="btn-primary w-full" disabled={busy || !username || !password}>
          {busy ? 'Kirilmoqda…' : 'Kirish'}
        </button>
        <Link to="/" className="block text-center text-sm text-zinc-500 hover:text-white">
          ← Saytga qaytish
        </Link>
      </form>
    </div>
  );
}
