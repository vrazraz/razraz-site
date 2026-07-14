import type { ReactNode } from 'react'
import { AboutFrame } from './frames/AboutFrame'
import { ProjectsFrame } from './frames/ProjectsFrame'
import { BlogFrame } from './frames/BlogFrame'
import { ResumeFrame } from './frames/ResumeFrame'
import { SkillsFrame } from './frames/SkillsFrame'

export interface Section {
  id: string
  render: (navigate: (section: string, postId?: string) => void) => ReactNode
}

/* Подписи разделов живут в i18n (STR[lang].sections) */
export const SECTIONS: Section[] = [
  { id: 'about', render: () => <AboutFrame /> },
  {
    id: 'projects',
    render: (navigate) => <ProjectsFrame onOpenProject={(slug) => navigate('projects', slug)} />,
  },
  {
    id: 'blog',
    render: (navigate) => <BlogFrame onOpenPost={(id) => navigate('blog', id)} />,
  },
  { id: 'resume', render: () => <ResumeFrame /> },
  { id: 'skills', render: () => <SkillsFrame /> },
]
