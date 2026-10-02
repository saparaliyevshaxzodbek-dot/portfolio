import { api } from './client';
import type {
  ContactMessage,
  Dashboard,
  Experience,
  ExperienceRequest,
  LoginResponse,
  Profile,
  ProfileRequest,
  Project,
  ProjectImage,
  ProjectRequest,
  Site,
  Skill,
  SkillRequest,
  Text,
} from './types';

export const siteApi = {
  get: () => api<Site>('/site'),
  project: (slug: string) => api<Project>(`/projects/${encodeURIComponent(slug)}`),
  visit: () => api<void>('/visits', { method: 'POST' }),
  contact: (request: { name: string; email: string; message: string; website?: string }) =>
    api<void>('/contact', { method: 'POST', body: request }),
};

export const authApi = {
  login: (username: string, password: string) => api<LoginResponse>('/auth/login', { method: 'POST', body: { username, password } }),
};

export const adminApi = {
  dashboard: () => api<Dashboard>('/admin/dashboard'),
  profile: () => api<Profile>('/admin/profile'),
  saveProfile: (request: ProfileRequest) => api<Profile>('/admin/profile', { method: 'PUT', body: request }),

  skills: () => api<Skill[]>('/admin/skills'),
  saveSkill: (id: number | null, request: SkillRequest) =>
    api<Skill>(id ? `/admin/skills/${id}` : '/admin/skills', { method: id ? 'PUT' : 'POST', body: request }),
  deleteSkill: (id: number) => api<void>(`/admin/skills/${id}`, { method: 'DELETE' }),

  experiences: () => api<Experience[]>('/admin/experiences'),
  saveExperience: (id: number | null, request: ExperienceRequest) =>
    api<Experience>(id ? `/admin/experiences/${id}` : '/admin/experiences', { method: id ? 'PUT' : 'POST', body: request }),
  deleteExperience: (id: number) => api<void>(`/admin/experiences/${id}`, { method: 'DELETE' }),

  projects: () => api<Project[]>('/admin/projects'),
  saveProject: (id: number | null, request: ProjectRequest) =>
    api<Project>(id ? `/admin/projects/${id}` : '/admin/projects', { method: id ? 'PUT' : 'POST', body: request }),
  deleteProject: (id: number) => api<void>(`/admin/projects/${id}`, { method: 'DELETE' }),
  addImage: (projectId: number, request: { url: string; caption: Text | null; sortOrder: number }) =>
    api<ProjectImage>(`/admin/projects/${projectId}/images`, { method: 'POST', body: request }),
  deleteImage: (projectId: number, imageId: number) => api<void>(`/admin/projects/${projectId}/images/${imageId}`, { method: 'DELETE' }),

  messages: () => api<ContactMessage[]>('/admin/messages'),
  setRead: (id: number, isRead: boolean) => api<void>(`/admin/messages/${id}`, { method: 'PATCH', body: { isRead } }),
  deleteMessage: (id: number) => api<void>(`/admin/messages/${id}`, { method: 'DELETE' }),

  upload: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api<{ url: string }>('/admin/uploads', { method: 'POST', form });
  },
};
