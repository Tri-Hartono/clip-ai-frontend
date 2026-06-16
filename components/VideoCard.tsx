"use client"

import Link from "next/link"
import { useState } from "react"
import { Video, Clock, ArrowRight, CheckCircle2, RefreshCw, XCircle, Trash2, AlertTriangle, X, Sparkles } from "lucide-react"
import { VideoProject, useProjectStore } from "@/store/projectStore"
import { api } from "@/services/api"

interface VideoCardProps {
  project: VideoProject
}

export default function VideoCard({ project }: VideoCardProps) {
  const { deleteProject } = useProjectStore()
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [clipsOpen, setClipsOpen] = useState(false)
  const [aiClips, setAiClips] = useState<any[]>([])
  const [loadingClips, setLoadingClips] = useState(false)

  const fetchClips = async () => {
    if (aiClips.length > 0) return
    setLoadingClips(true)
    try {
      const resp = await api.get(`/api/videos/${project.id}/clips`)
      setAiClips(resp.data || [])
    } catch (err) {
      console.error("Failed to fetch AI clips:", err)
    } finally {
      setLoadingClips(false)
    }
  }

  const handleToggleClips = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const nextVal = !clipsOpen
    setClipsOpen(nextVal)
    if (nextVal) {
      fetchClips()
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-emerald-50 border-emerald-100 text-emerald-600",
          icon: CheckCircle2,
          text: "Selesai"
        }
      case "processing":
      case "downloading":
        return {
          bg: "bg-amber-50 border-amber-100 text-amber-600",
          icon: RefreshCw,
          text: status === "downloading" ? "Downloading..." : "AI Transcribing..."
        }
      case "failed":
        return {
          bg: "bg-rose-50 border-rose-100 text-rose-600",
          icon: XCircle,
          text: "Gagal"
        }
      default:
        return {
          bg: "bg-slate-50 border-slate-200 text-slate-500",
          icon: Clock,
          text: "Mengantri"
        }
    }
  }

  const statusStyle = getStatusStyle(project.status)
  const StatusIcon = statusStyle.icon

  const formatDuration = (sec: number) => {
    if (!sec) return "0:00"
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s < 10 ? "0" : ""}${s}`
  }

  const getThumbnailUrl = (title: string) => {
    if (project.thumbnailUrl) return project.thumbnailUrl
    if (!title) return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600"
    
    const lowerTitle = title.toLowerCase()
    
    if (lowerTitle.includes("run") || lowerTitle.includes("trail") || lowerTitle.includes("malabar") || lowerTitle.includes("running") || lowerTitle.includes("marathon")) {
      return "https://images.unsplash.com/photo-1502680390469-be75c86b636f?q=80&w=600" // Trail running photo
    }
    if (lowerTitle.includes("podcast") || lowerTitle.includes("ceramah") || lowerTitle.includes("talk") || lowerTitle.includes("obrolan") || lowerTitle.includes("interview") || lowerTitle.includes("bicara")) {
      return "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600" // Podcast studio photo
    }
    if (lowerTitle.includes("coding") || lowerTitle.includes("programming") || lowerTitle.includes("developer") || lowerTitle.includes("website") || lowerTitle.includes("tutorial")) {
      return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600" // Developer workstation
    }
    if (lowerTitle.includes("produk") || lowerTitle.includes("review") || lowerTitle.includes("jualan") || lowerTitle.includes("unboxing") || lowerTitle.includes("ecommerce")) {
      return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600" // Product unboxing
    }
    if (lowerTitle.includes("wisata") || lowerTitle.includes("candi") || lowerTitle.includes("travel") || lowerTitle.includes("liburan") || lowerTitle.includes("jalan")) {
      return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=600" // Travel
    }
    
    return "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600" // Elegant abstract cover
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    try {
      await api.delete(`/api/videos/${project.id}`)
      deleteProject(project.id)
      setDeleteModalOpen(false)
    } catch (error) {
      console.error("Failed to delete video project", error)
      alert("Gagal menghapus proyek video. Silakan coba kembali.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-5 hover:border-brand/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group shadow-sm">
      <div>
        {/* Card Header & Thumbnail Image */}
        <div className="w-full aspect-video rounded-2xl bg-slate-100 border border-slate-200/60 flex items-center justify-center mb-4 text-slate-400 relative overflow-hidden group shadow-inner">
          <img 
            src={getThumbnailUrl(project.title)} 
            alt={project.title} 
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
          {project.duration > 0 && (
            <span className="absolute bottom-2.5 right-2.5 text-[10px] bg-slate-900/80 backdrop-blur-sm text-white px-2.5 py-0.5 rounded-lg font-mono border border-white/10 z-10 font-bold">
              {formatDuration(project.duration)}
            </span>
          )}
          
          {/* Dynamic Progress Overlay Bar */}
          {(project.status === "downloading" || project.status === "processing" || project.status === "pending") && (
            <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 backdrop-blur-sm px-3.5 py-2.5 flex flex-col justify-end border-t border-white/10 z-20">
              <div className="flex justify-between items-center text-[9px] font-black text-white uppercase tracking-wider mb-1">
                <span>{project.status === "downloading" ? "Downloading Video..." : project.status === "processing" ? "AI Transcribing..." : "Mengantri..."}</span>
                <span>{project.status === "downloading" ? "35%" : project.status === "processing" ? "75%" : "10%"}</span>
              </div>
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden border border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${project.status === "downloading" ? "bg-amber-400" : project.status === "processing" ? "bg-brand" : "bg-slate-400"}`}
                  style={{ width: project.status === "downloading" ? "35%" : project.status === "processing" ? "75%" : "10%" }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Project Title */}
        <h3 className="text-sm font-extrabold text-slate-800 mb-2.5 line-clamp-1 group-hover:text-brand transition-colors">
          {project.title}
        </h3>

        {/* Info Rows */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4 font-sans font-semibold">
          <span>{new Date(project.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className={`px-2 py-0.5 rounded-full border text-[10px] font-extrabold tracking-wide uppercase flex items-center gap-1.5 ${statusStyle.bg}`}>
            <StatusIcon className={`w-3.5 h-3.5 ${project.status === "processing" || project.status === "downloading" ? "animate-spin" : ""}`} />
            <span>{statusStyle.text}</span>
          </span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex items-center gap-2 mt-2.5">
        <Link
          href={project.status === "completed" ? `/editor/${project.uuid || project.id}` : "#"}
          className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 text-xs active:scale-95 ${
            project.status === "completed"
              ? "bg-slate-50 hover:bg-brand text-slate-800 hover:text-white border border-slate-200/60 hover:border-transparent hover:shadow-md hover:shadow-brand/10"
              : "bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-100"
          }`}
        >
          <span>Buka Editor</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <button
          onClick={handleDeleteClick}
          className="p-2.5 bg-slate-50 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 text-slate-450 hover:text-rose-600 rounded-xl transition-all duration-300 active:scale-90 cursor-pointer shadow-sm"
          title="Hapus Proyek secara Permanen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {project.status === "completed" && (
        <div className="mt-4 border-t border-slate-100 pt-3 flex flex-col w-full text-slate-800">
          <button
            onClick={handleToggleClips}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-650 hover:text-brand transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand animate-pulse" />
              Lihat Klip Viral AI ({loadingClips ? "..." : aiClips.length})
            </span>
            <span className="transition-transform duration-300" style={{ transform: clipsOpen ? "rotate(180deg)" : "rotate(0)" }}>
              ▼
            </span>
          </button>

          {clipsOpen && (
            <div className="mt-2.5 space-y-2 max-h-[250px] overflow-y-auto pr-1">
              {loadingClips ? (
                <div className="flex items-center justify-center py-4 text-xs font-bold text-slate-400 gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
                  Memuat klip AI...
                </div>
              ) : aiClips.length === 0 ? (
                <div className="text-[10px] text-slate-400 font-semibold py-2 text-center">
                  AI sedang memproses klip atau tidak menemukan potongan viral.
                </div>
              ) : (
                aiClips.map((clip) => {
                  const minutes = Math.floor(clip.duration / 60)
                  const seconds = clip.duration % 60
                  const durationStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

                  return (
                    <div key={clip.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-xs font-extrabold text-slate-800 line-clamp-1">{clip.title || "Klip AI"}</span>
                          <span className="text-[10px] text-slate-400 font-semibold mt-0.5">Durasi: {durationStr} | Skor Viral: {clip.score}%</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic line-clamp-2">
                        "{clip.rationale}"
                      </p>
                      <div className="flex gap-2 mt-1">
                        <a
                          href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}${clip.path}`}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-1.5 bg-brand text-white text-[10px] font-black rounded-lg text-center flex items-center justify-center gap-1 hover:shadow-md hover:bg-brand-dark active:scale-95 transition-all"
                        >
                          Download MP4
                        </a>
                        <Link
                          href={`/editor/${project.uuid || project.id}?start=${clip.startTime}&end=${clip.endTime}`}
                          className="flex-1 py-1.5 bg-white border border-slate-200 text-slate-700 text-[10px] font-black rounded-lg text-center flex items-center justify-center gap-1 hover:bg-slate-50 hover:border-slate-350 active:scale-95 transition-all"
                        >
                          Edit di Studio
                        </Link>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}
        </div>
      )}

      {/* Premium Custom Deletion Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-55 flex items-center justify-center p-4 font-sans animate-fade-in text-slate-800">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative text-center">
            
            {/* Close Button */}
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-50 border border-slate-200 text-slate-450 hover:text-slate-800 rounded-xl transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-4 animate-bounce-slow">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Title */}
            <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
              Hapus Proyek Secara Permanen?
            </h3>
            
            {/* Description */}
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-3 px-2 text-center">
              Apakah Anda yakin ingin menghapus proyek <strong className="text-slate-800">"{project.title}"</strong>? Seluruh file video asli, subtitle, dan klip video hasil potong Anda di server akan dihapus selamanya.
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl font-bold transition-all text-xs active:scale-95 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 bg-rose-650 hover:bg-rose-700 text-white rounded-2xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/10 text-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Menghapus...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Ya, Hapus</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
