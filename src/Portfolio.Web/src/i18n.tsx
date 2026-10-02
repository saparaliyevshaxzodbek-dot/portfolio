import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Text } from './api/types';

export type Lang = 'en' | 'uz';

const STRINGS = {
  en: {
    navAbout: 'About',
    navSkills: 'Skills',
    navExperience: 'Experience',
    navProjects: 'Projects',
    navContact: 'Contact',
    hireMe: "Let's talk",
    openToWork: 'Open to new opportunities',
    hello: "Hi, I'm",
    viewProjects: 'View projects',
    downloadCv: 'Download CV',
    contactMe: 'Contact me',
    statProjects: 'Projects',
    statTech: 'Technologies',
    statYears: 'Years coding',
    aboutEyebrow: 'About me',
    aboutTitle: 'Engineering software that feels effortless',
    location: 'Location',
    email: 'Email',
    currently: 'Currently',
    skillsEyebrow: 'Skills',
    skillsTitle: 'The toolkit I build with',
    catBackend: 'Back end',
    catFrontend: 'Front end',
    catDatabase: 'Databases',
    catTools: 'Tools & quality',
    experienceEyebrow: 'Journey',
    experienceTitle: 'Experience & education',
    present: 'Present',
    typeWork: 'Work',
    typeEducation: 'Education',
    typeCourse: 'Course',
    projectsEyebrow: 'Selected work',
    projectsTitle: 'Projects I am proud of',
    featured: 'Featured project',
    viewCase: 'View case study',
    sourceCode: 'Source code',
    liveDemo: 'Live demo',
    contactEyebrow: 'Contact',
    contactTitle: "Let's build something great together",
    contactText: 'Have a role, a project or just a question? Write to me — I usually reply within a day.',
    formName: 'Your name',
    formEmail: 'Email',
    formMessage: 'Message',
    formSend: 'Send message',
    formSending: 'Sending…',
    formSent: 'Thank you! Your message has been sent. I will get back to you soon.',
    formSendAnother: 'Send another message',
    errName: 'Please enter your name',
    errEmail: 'Please enter a valid email',
    errMessage: 'The message should be at least 10 characters',
    backToProjects: 'All projects',
    highlights: 'Highlights',
    overview: 'Overview',
    gallery: 'Gallery',
    techUsed: 'Tech stack',
    year: 'Year',
    notFound: 'Page not found',
    goHome: 'Back to home',
    footerBuilt: 'Built with ASP.NET Core & React',
    backToTop: 'Back to top',
    loading: 'Loading…',
  },
  uz: {
    navAbout: 'Men haqimda',
    navSkills: "Ko'nikmalar",
    navExperience: 'Tajriba',
    navProjects: 'Loyihalar',
    navContact: 'Aloqa',
    hireMe: "Bog'lanish",
    openToWork: 'Yangi takliflarga ochiqman',
    hello: 'Salom, men',
    viewProjects: "Loyihalarni ko'rish",
    downloadCv: 'CV yuklab olish',
    contactMe: "Bog'lanish",
    statProjects: 'Loyiha',
    statTech: 'Texnologiya',
    statYears: 'Yil dasturlash',
    aboutEyebrow: 'Men haqimda',
    aboutTitle: "Ishlatish oson bo'lgan dasturlar yarataman",
    location: 'Manzil',
    email: 'Email',
    currently: 'Hozir',
    skillsEyebrow: "Ko'nikmalar",
    skillsTitle: 'Ishlaydigan texnologiyalarim',
    catBackend: 'Backend',
    catFrontend: 'Frontend',
    catDatabase: "Ma'lumotlar bazasi",
    catTools: 'Vositalar va sifat',
    experienceEyebrow: "Yo'lim",
    experienceTitle: "Tajriba va ta'lim",
    present: 'Hozirgacha',
    typeWork: 'Ish',
    typeEducation: "Ta'lim",
    typeCourse: 'Kurs',
    projectsEyebrow: 'Ishlarim',
    projectsTitle: 'Faxrlanadigan loyihalarim',
    featured: 'Asosiy loyiha',
    viewCase: 'Batafsil',
    sourceCode: 'Manba kodi',
    liveDemo: 'Jonli demo',
    contactEyebrow: 'Aloqa',
    contactTitle: "Keling, birga zo'r narsa yaratamiz",
    contactText: "Ish taklifi, loyiha yoki shunchaki savol bormi? Yozing — odatda bir kun ichida javob beraman.",
    formName: 'Ismingiz',
    formEmail: 'Email',
    formMessage: 'Xabar',
    formSend: 'Yuborish',
    formSending: 'Yuborilmoqda…',
    formSent: 'Rahmat! Xabaringiz yuborildi. Tez orada javob beraman.',
    formSendAnother: 'Yana yozish',
    errName: 'Ismingizni kiriting',
    errEmail: "To'g'ri email kiriting",
    errMessage: "Xabar kamida 10 belgidan iborat bo'lsin",
    backToProjects: 'Barcha loyihalar',
    highlights: 'Asosiy natijalar',
    overview: "Umumiy ma'lumot",
    gallery: 'Galereya',
    techUsed: 'Texnologiyalar',
    year: 'Yil',
    notFound: 'Sahifa topilmadi',
    goHome: 'Bosh sahifaga',
    footerBuilt: "ASP.NET Core va React'da yaratilgan",
    backToTop: 'Yuqoriga',
    loading: 'Yuklanmoqda…',
  },
} as const;

export type StringKey = keyof (typeof STRINGS)['en'];

const MONTHS: Record<Lang, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  uz: ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'],
};

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: StringKey) => string;
  /** Picks the current language from a two-language text, falling back to English. */
  tx: (text: Text | null | undefined) => string;
  monthYear: (isoDate: string) => string;
}

const LangContext = createContext<LangContextValue | null>(null);
const LANG_KEY = 'portfolio.lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === 'en' || saved === 'uz') return saved;
  } catch {
    // Storage blocked: fall back to the browser language.
  }
  return navigator.language.toLowerCase().startsWith('uz') ? 'uz' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // Not persisted; the choice still applies for this visit.
    }
  }, []);

  const value = useMemo<LangContextValue>(
    () => ({
      lang,
      setLang,
      t: (key) => STRINGS[lang][key],
      tx: (text) => (text ? (lang === 'uz' && text.uz.trim() ? text.uz : text.en) : ''),
      monthYear: (isoDate) => {
        const [y, m] = isoDate.split('-').map(Number);
        return `${MONTHS[lang][(m ?? 1) - 1]} ${y}`;
      },
    }),
    [lang, setLang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const context = useContext(LangContext);
  if (!context) throw new Error('useLang must be used inside LangProvider');
  return context;
}
