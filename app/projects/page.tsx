"use client"

import { useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import VideoCard from "@/components/VideoCard"
import { Video, RefreshCw } from "lucide-react"
import { useProjectStore } from "@/store/projectStore"
import { api } from "@/services/api"

export default function ProjectsPage() {
  const { projects, setProjects, loading, setLoading } = useProjectStore()

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      try {
        const response = await api.get("/api/videos")
        // Mapping elements into GORM entities
        const mapped = response.data.map((item: any) => ({
          id: item.id,
          uuid: item.uuid,
          title: item.title,
          status: item.status,
          originalPath: item.originalPath,
          outputPath: item.outputPath || "",
          duration: item.duration || 0,
          createdAt: item.createdAt || new Date().toISOString(),
          thumbnailUrl: item.thumbnailUrl || ""
        }))
        setProjects(mapped)
      } catch (error) {
        console.error("Failed to load backend videos list. Generating mocks.", error)
        
        // Mock fallback list for seamless designer previews when offline
        if (projects.length === 0) {
          setProjects([
            {
              id: 1,
              title: "Product Launch Walkthrough.mp4",
              status: "completed",
              originalPath: "/storage/uploads/mock_launch.mp4",
              outputPath: "/storage/subtitles/sub_1.srt",
              duration: 184,
              createdAt: new Date().toISOString()
            },
            {
              id: 2,
              title: "GDVideo SaaS Presentation Explainer.mp4",
              status: "processing",
              originalPath: "/storage/uploads/mock_presentation.mp4",
              outputPath: "",
              duration: 320,
              createdAt: new Date().toISOString()
            }
          ])
        }
      } finally {
        setLoading(false)
      }
    }
    
    fetchProjects()
  }, [])

  useEffect(() => {
    const hasActiveProjects = projects.some(p => p.status === "downloading" || p.status === "processing" || p.status === "pending")
    if (!hasActiveProjects) return

    const interval = setInterval(async () => {
      try {
        const response = await api.get("/api/videos")
        const mapped = response.data.map((item: any) => ({
          id: item.id,
          uuid: item.uuid,
          title: item.title,
          status: item.status,
          originalPath: item.originalPath,
          outputPath: item.outputPath || "",
          duration: item.duration || 0,
          createdAt: item.createdAt || new Date().toISOString(),
          thumbnailUrl: item.thumbnailUrl || ""
        }))
        setProjects(mapped)
      } catch (error) {
        console.error("Failed to poll video updates:", error)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [projects, setProjects])

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-h-screen">
        {/* Top welcome banner with green-mesh gradient background */}
        <div className="relative bg-gradient-to-r from-[#025a50] to-[#01423a] text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden mb-8 border border-emerald-900/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
            Klip Video Saya
          </h1>
          <p className="text-xs text-slate-300 font-medium mt-1.5 max-w-xl">
            Kelola dan potong video YouTube/lokal Anda dengan subtitle otomatis.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 rounded-[32px] bg-white max-w-xl mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 text-slate-400">
              <Video className="w-6 h-6 text-brand" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Belum ada proyek</h3>
            <p className="text-xs text-slate-450 font-semibold text-center max-w-sm mb-6 leading-relaxed">
              Anda belum mengunggah atau memproses video apa pun. Silakan kembali ke dashboard untuk memulai.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <VideoCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
