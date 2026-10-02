import { Link, Route, Routes } from 'react-router';
import { useLang } from './i18n';
import SiteLayout from './pages/site/SiteLayout';
import HomePage from './pages/site/HomePage';
import ProjectPage from './pages/site/ProjectPage';
import AdminLayout, { LoginPage, RequireAdmin } from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import ProfilePage from './pages/admin/ProfilePage';
import SkillsPage from './pages/admin/SkillsPage';
import TimelinePage from './pages/admin/TimelinePage';
import ProjectsPage from './pages/admin/ProjectsPage';
import MessagesPage from './pages/admin/MessagesPage';

function NotFound() {
  const { t } = useLang();
  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-gradient font-display text-8xl font-bold">404</p>
      <p className="mt-4 text-lg text-white">{t('notFound')}</p>
      <Link to="/" className="btn-primary mt-8">
        {t('goHome')}
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="projects/:slug" element={<ProjectPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="admin/login" element={<LoginPage />} />
      <Route
        path="admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="skills" element={<SkillsPage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="messages" element={<MessagesPage />} />
      </Route>
    </Routes>
  );
}
