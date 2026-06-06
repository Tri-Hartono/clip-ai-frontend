import { create } from "zustand"

export interface VideoProject {
  id: number
  title: string
  status: string
  originalPath: string
  outputPath: string
  duration: number
  createdAt: string
  thumbnailUrl?: string
}

interface ProjectState {
  projects: VideoProject[]
  currentProject: VideoProject | null
  loading: boolean
  setProjects: (projects: VideoProject[]) => void
  setCurrentProject: (project: VideoProject | null) => void
  setLoading: (loading: boolean) => void
  addProject: (project: VideoProject) => void
  updateProjectStatus: (id: number, status: string, outputPath?: string) => void
  deleteProject: (id: number) => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  currentProject: null,
  loading: false,
  setProjects: (projects) => set({ projects }),
  setCurrentProject: (currentProject) => set({ currentProject }),
  setLoading: (loading) => set({ loading }),
  addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
  updateProjectStatus: (id, status, outputPath) => set((state) => {
    const updated = state.projects.map((p) => {
      if (p.id === id) {
        return { ...p, status, outputPath: outputPath || p.outputPath }
      }
      return p
    })
    
    // Also update active session if it's the open file
    const active = state.currentProject && state.currentProject.id === id
      ? { ...state.currentProject, status, outputPath: outputPath || state.currentProject.outputPath }
      : state.currentProject
      
    return { projects: updated, currentProject: active }
  }),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id),
    currentProject: state.currentProject && state.currentProject.id === id ? null : state.currentProject
  })),
}))
