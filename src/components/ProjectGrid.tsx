import { useState } from 'react'
import ProjectCard from './ProjectCard'
import AddProjectModal from './AddProjectModal'

interface Project {
  id: string
  name: string
  description: string
  destinationAddress: string
  targetAmount: number
  category: string
  isCustom: boolean
}

interface ProjectGridProps {
  projects: Project[]
  onDonate: (projectId: string, amount: string, destination: string) => void
  onAddProject: (project: Omit<Project, 'id' | 'isCustom'>) => void
  isWalletConnected: boolean
}

export default function ProjectGrid({ projects, onDonate, onAddProject, isWalletConnected }: ProjectGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-8 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-white">Fonlanan Projeler</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-cyan-950 border border-cyan-800 hover:bg-cyan-900/60 text-cyan-400 text-sm font-semibold px-4 py-2 transition shadow-md active:scale-95 cursor-pointer"
        >
          + Yeni Proje Ekle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 lg:px-8">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDonate={onDonate}
            isWalletConnected={isWalletConnected}
          />
        ))}
      </div>

      <AddProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={onAddProject}
      />
    </div>
  )
}
