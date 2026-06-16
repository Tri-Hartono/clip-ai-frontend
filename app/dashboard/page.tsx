"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import UploadZone from "@/components/UploadZone"
import VideoCard from "@/components/VideoCard"
import { useAuth } from "@/providers/AuthProvider"
import { useProjectStore } from "@/store/projectStore"
import { 
  Sparkles, 
  Video as VideoIcon, 
  Clock, 
  Layout, 
  RefreshCw, 
  Zap, 
  HelpCircle, 
  BookOpen, 
  ArrowRight,
  TrendingUp,
  CreditCard
} from "lucide-react"
import { api } from "@/services/api"
import Link from "next/link"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { projects, setProjects, addProject } = useProjectStore()
  const [profile, setProfile] = useState<any>(null)
  const [fetchingProjects, setFetchingProjects] = useState(false)

  const fetchProfileAndProjects = async () => {
    try {
      const resp = await api.get("/api/auth/me")
      setProfile(resp.data)
    } catch (err) {
      console.error("Failed to load backend profile details", err)
    }

    setFetchingProjects(true)
    try {
      const response = await api.get("/api/videos")
      const mapped = response.data.map((item: any) => ({
        id: item.id,
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
      console.error("Failed to load backend videos list on dashboard mount", error)
    } finally {
      setFetchingProjects(false)
    }
  }

  useEffect(() => {
    fetchProfileAndProjects()
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
      uuid: video.uuid,
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
      router.push(`/editor/${newProj.uuid || newProj.id}`)
    } else {
      router.push("/projects")
    }
  }

  // Get active and total counts
  const recentProjects = projects
    .slice()
    .sort((a, b) => b.id - a.id)
    .slice(0, 3)

  const creditPercentage = profile?.user?.credits !== undefined
    ? Math.min(100, Math.max(0, (profile.user.credits / 60) * 100))
    : 25; // default percentage representation

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-h-screen">
        {/* Top welcome banner with green-mesh gradient background */}
        <div className="relative bg-gradient-to-br from-[#025a50] via-[#01423a] to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden mb-8 border border-emerald-900/50">
          {/* Glowing background shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-brand/15 rounded-full blur-2xl -mb-10 pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-white/10 text-brand-accent border border-white/5 tracking-wider mb-3 animate-pulse">
                <Sparkles className="w-3 h-3 text-amber-400 fill-current" />
                AI-Powered Creator Dashboard
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                Selamat datang kembali, {user?.displayName?.split(" ")[0] || "Kreator"}!
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-medium mt-2 max-w-xl leading-relaxed">
                Ubah rekaman video mentah, zoom meeting, atau video YouTube Anda menjadi potongan klip viral Shorts secara instan menggunakan kecerdasan buatan Clippers AI.
              </p>
            </div>
            
            <div className="shrink-0 flex flex-wrap gap-2">
              <Link 
                href="/timelapse"
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/15 flex items-center gap-2 hover:shadow-xl hover:scale-[1.02] active:scale-98 transition-all"
              >
                <Zap className="w-4 h-4 text-white fill-current" />
                <span>Buat AI Timelapse</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Dashboard Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main workspace section */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Upload interaction zone */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Mulai Proyek Baru</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Pilih file video lokal atau masukkan link YouTube</p>
                </div>
              </div>
              <UploadZone onSuccess={handleUploadSuccess} />
            </div>

            {/* Recent Proyeks List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Proyek Video Terbaru</h3>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Lanjutkan mengedit klip video otomatis Anda</p>
                </div>
                {projects.length > 0 && (
                  <Link 
                    href="/projects" 
                    className="text-xs font-bold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors group"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                )}
              </div>

              {fetchingProjects ? (
                <div className="flex items-center justify-center py-12 border border-slate-100 rounded-3xl bg-white/40">
                  <RefreshCw className="w-6 h-6 text-brand animate-spin" />
                </div>
              ) : projects.length === 0 ? (
                /* Suggestion Starter Kit when empty */
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-brand hover:shadow-md transition-all duration-300">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center text-white mb-3 border border-brand/20">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">Podcast Highlight</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-semibold">
                        Ubah video obrolan Anda menjadi potongan Shorts / Reels viral.
                      </p>
                    </div>
                    <span className="text-[9px] font-extrabold text-brand uppercase tracking-wider mt-4">Paling Populer</span>
                  </div>

                  <div className="p-4 bg-white border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-emerald-200 hover:shadow-md transition-all duration-300">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3 border border-emerald-100/50">
                        <VideoIcon className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">Video Explainer</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-semibold">
                        Tambah subtitle dinamis dan sorot poin penting secara otomatis.
                      </p>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-600 uppercase tracking-wider mt-4">Mudah Dipakai</span>
                  </div>

                  <div className="p-4 bg-white border border-slate-200/50 rounded-2xl flex flex-col justify-between hover:border-rose-200 hover:shadow-md transition-all duration-300">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 mb-3 border border-rose-100/50">
                        <TrendingUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">Gaming Clip</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed mt-1 font-semibold">
                        Potong momen terbaik streaming game Anda dalam hitungan menit.
                      </p>
                    </div>
                    <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider mt-4">Performa Tinggi</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="md:scale-[0.98] hover:scale-100 transition-transform duration-350">
                      <VideoCard project={project} />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right sidebar metrics column */}
          <div className="space-y-8">
            
            {/* Credit quota status card with progress circle/bar */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Kredit Kuota</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kuota tersisa untuk pemrosesan video</p>
                </div>
                <span className="p-1.5 bg-brand/5 border border-brand/10 text-brand rounded-lg">
                  <Zap className="w-4 h-4 fill-current" />
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {profile?.user?.credits !== undefined ? `${profile.user.credits.toFixed(1)}` : "15.0"}{" "}
                    <span className="text-xs font-extrabold text-slate-400">Menit</span>
                  </span>
                  <span className="text-[10px] font-extrabold text-slate-400">/ 60 Menit</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                  <div 
                    className="h-full bg-gradient-to-r from-brand to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${creditPercentage}%` }}
                  />
                </div>
              </div>

              <Link 
                href="/billing"
                className="w-full py-2.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-bold text-center transition-colors shadow-sm cursor-pointer"
              >
                Top-Up / Beli Kredit
              </Link>
            </div>

            {/* Other SaaS Highlights */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-teal-500/5 border border-teal-100 text-teal-600 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Transkripsi</p>
                <h4 className="text-sm font-extrabold text-slate-805 mt-1">~ 15x Realtime</h4>
              </div>

              <div className="p-4 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow transition-shadow">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/5 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <Layout className="w-5 h-5" />
                </div>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Klip Terbuat</p>
                <h4 className="text-sm font-extrabold text-slate-805 mt-1">
                  {projects.filter(p => p.status === "completed").length} Video
                </h4>
              </div>
            </div>

            {/* Help / AI Tips Section */}
            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4 h-4 text-brand" />
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Panduan Pembuat Konten</h3>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 text-xs leading-relaxed text-slate-650 font-medium">
                  <span className="font-extrabold text-brand">01</span>
                  <p>Pilih segmen video yang menarik di <strong>3 detik pertama</strong> untuk menahan perhatian penonton.</p>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed text-slate-650 font-medium">
                  <span className="font-extrabold text-brand">02</span>
                  <p>Gunakan subtitle otomatis dengan <strong>kata-kata berwarna</strong> agar teks lebih hidup dan menarik.</p>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed text-slate-650 font-medium">
                  <span className="font-extrabold text-brand">03</span>
                  <p>Simpan klip viral Anda dengan kualitas terbaik dan langsung unggah ke TikTok atau Reels.</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Butuh bantuan teknis?
                </span>
                <Link 
                  href="/contact" 
                  className="text-[10px] font-extrabold text-brand hover:underline"
                >
                  Kontak Admin
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  )
}
