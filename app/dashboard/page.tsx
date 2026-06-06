"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import UploadZone from "@/components/UploadZone"
import { useAuth } from "@/providers/AuthProvider"
import { Sparkles, Video, Clock, Layout, RefreshCw } from "lucide-react"
import { useProjectStore } from "@/store/projectStore"
import { api } from "@/services/api"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { projects, addProject } = useProjectStore()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function fetchProfile() {
      try {
        const resp = await api.get("/api/auth/me")
        setProfile(resp.data)
      } catch (err) {
        console.error("Failed to load backend profile details", err)
      }
    }
    fetchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  const handleUploadSuccess = (video: any) => {
    const newProj = {
      id: video.id,
      title: video.title,
      status: video.status,
      originalPath: video.originalPath,
      outputPath: video.outputPath || "",
      duration: video.duration || 0,
      createdAt: video.createdAt || new Date().toISOString(),
      thumbnailUrl: video.thumbnailUrl || ""
    }
    addProject(newProj)
    
    if (newProj.status === "completed") {
      router.push(`/editor/${newProj.id}`)
    } else {
      router.push("/projects")
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-h-screen">
        {/* Top welcome banner */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              <span>Selamat datang, {user?.displayName?.split(" ")[0] || "Kreator"}</span>
              <Sparkles className="w-5 h-5 text-brand animate-pulse" />
            </h1>
            <p className="text-sm text-slate-500 font-semibold mt-0.5">Ubah video Anda secara instan menggunakan kecerdasan buatan Clippers AI.</p>
          </div>
        </div>

        {/* Upload Interaction Zone */}
        <div className="mb-10">
          <UploadZone onSuccess={handleUploadSuccess} />
        </div>

        {/* Info Highlights / SaaS metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Sisa Kredit Kuota</p>
              <h3 className="text-base font-extrabold text-slate-900">
                {profile?.user?.credits !== undefined ? `${profile.user.credits.toFixed(2)} Menit` : "15.00 Menit"}
              </h3>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Kecepatan Transkrip</p>
              <h3 className="text-base font-extrabold text-slate-900">~ 15x Realtime</h3>
            </div>
          </div>

          <div className="p-5 bg-white border border-slate-200/80 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Layout className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Klip Terbuat</p>
              <h3 className="text-base font-extrabold text-slate-900">{projects.filter(p => p.status === "completed").length} Video</h3>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
