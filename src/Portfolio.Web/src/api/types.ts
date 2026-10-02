export interface Text {
  en: string;
  uz: string;
}

export type SkillCategory = 'Backend' | 'Frontend' | 'Database' | 'Tools';
export type ExperienceType = 'Work' | 'Education' | 'Course';

export interface Profile {
  fullName: string;
  headline: Text;
  summary: Text;
  about: Text;
  location: Text;
  email: string;
  phone: string | null;
  telegram: string | null;
  gitHub: string | null;
  linkedIn: string | null;
  photoUrl: string | null;
  cvUrl: string | null;
  openToWork: boolean;
}

export interface Skill {
  id: number;
  name: string;
  category: SkillCategory;
  sortOrder: number;
}

export interface Experience {
  id: number;
  type: ExperienceType;
  title: Text;
  organization: string;
  description: Text;
  startDate: string;
  endDate: string | null;
  url: string | null;
  sortOrder: number;
}

export interface ProjectCard {
  id: number;
  slug: string;
  title: Text;
  summary: Text;
  tech: string[];
  coverImageUrl: string | null;
  year: number;
  isFeatured: boolean;
  repoUrl: string | null;
  liveUrl: string | null;
}

export interface ProjectImage {
  id: number;
  url: string;
  caption: Text;
  sortOrder: number;
}

export interface Project extends ProjectCard {
  description: Text;
  highlights: Text;
  isPublished: boolean;
  sortOrder: number;
  images: ProjectImage[];
}

export interface Site {
  profile: Profile;
  skills: Skill[];
  experiences: Experience[];
  projects: ProjectCard[];
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Dashboard {
  visitsToday: number;
  visitsLast30Days: number;
  last14Days: { date: string; count: number }[];
  unreadMessages: number;
  totalMessages: number;
  projects: number;
  skills: number;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  username: string;
}

export type ProfileRequest = Omit<Profile, never>;

export interface SkillRequest {
  name: string;
  category: SkillCategory;
  sortOrder: number;
}

export interface ExperienceRequest {
  type: ExperienceType;
  title: Text;
  organization: string;
  description: Text;
  startDate: string;
  endDate: string | null;
  url: string | null;
  sortOrder: number;
}

export interface ProjectRequest {
  slug: string;
  title: Text;
  summary: Text;
  description: Text;
  highlights: Text;
  techStack: string;
  coverImageUrl: string | null;
  repoUrl: string | null;
  liveUrl: string | null;
  year: number;
  isFeatured: boolean;
  isPublished: boolean;
  sortOrder: number;
}
