import type { ReactNode } from 'react'
import { AboutFrame } from './frames/AboutFrame'
import { ProjectsFrame } from './frames/ProjectsFrame'
import { BlogFrame } from './frames/BlogFrame'
import { ResumeFrame } from './frames/ResumeFrame'

export interface Section {
  id: string
  label: string
  render: (navigate: (section: string, postId?: string) => void) => ReactNode
}

export const SECTIONS: Section[] = [
  { id: 'about', label: 'Обо мне', render: () => <AboutFrame /> },
  {
    id: 'projects',
    label: 'Проекты',
    render: (navigate) => <ProjectsFrame onOpenProject={(slug) => navigate('projects', slug)} />,
  },
  {
    id: 'blog',
    label: 'Блог',
    render: (navigate) => <BlogFrame onOpenPost={(id) => navigate('blog', id)} />,
  },
  { id: 'resume', label: 'Резюме', render: () => <ResumeFrame /> },
]
