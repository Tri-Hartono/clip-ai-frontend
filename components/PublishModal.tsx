"use client"

import React, { useState, useEffect } from "react"
import { X, CheckCircle2, AlertCircle, RefreshCw, Share2, ArrowRight } from "lucide-react"
import { api } from "@/services/api"
import Link from "next/link"

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  videoUrl: string
  defaultTitle?: string
}

export default function PublishModal({ isOpen, onClose, videoUrl, defaultTitle = "" }: PublishModalProps) {
  const [title, setTitle] = useState(defaultTitle || "My Awesome Short")
  const [description, setDescription] = useState("#shorts #ai")
  const [selectedPlatforms, setSelectedPlatforms] = useState<{ youtube: boolean; tiktok: boolean; facebook: boolean }>({
    youtube: true,
    tiktok: false,
    facebook: false,
  })
  
  const [status, setStatus] = useState({ youtube: false, tiktok: false, facebook: false })
  const [loadingStatus, setLoadingStatus] = useState(true)
  const [publishing, setPublishing] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchIntegrationStatus()
      setSuccess(false)
      setError(null)
    }
  }, [isOpen])

  const fetchIntegrationStatus = async () => {
    try {
      setLoadingStatus(true)
      const res = await api.get("/api/oauth/status")
      setStatus(res.data)
      // Automatically toggle off platforms that are not connected
      setSelectedPlatforms({
        youtube: res.data.youtube,
        tiktok: res.data.tiktok,
        facebook: res.data.facebook,
      })
    } catch (err: any) {
      console.error("Failed to load integrations status", err)
    } finally {
      setLoadingStatus(false)
    }
  }

  if (!isOpen) return null

  const handlePublish = async () => {
    const platforms = Object.entries(selectedPlatforms)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name)

    if (platforms.length === 0) {
      setError("Pilih minimal satu platform untuk mengunggah!")
      return
    }

    // Verify connection status
    const unconnected = platforms.filter(p => !status[p as keyof typeof status])
    if (unconnected.length > 0) {
      setError(`Sambungkan akun ${unconnected.join(" & ")} Anda terlebih dahulu!`)
      return
    }

    setPublishing(true)
    setError(null)

    try {
      await api.post("/api/publish", {
        videoUrl,
        platforms,
        title,
        description,
      })
      setSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.error || "Gagal mengunggah video. Silakan coba lagi.")
    } finally {
      setPublishing(false)
    }
  }

  const togglePlatform = (platform: "youtube" | "tiktok" | "facebook") => {
    if (!status[platform]) return // Cannot toggle if not connected
    setSelectedPlatforms(prev => ({
      ...prev,
      [platform]: !prev[platform]
    }))
  }

  return (
    <div className="fixed inset-0 z-55 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={publishing}
          className="absolute top-4 right-4 p-2 bg-slate-950/60 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-xl transition-all disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-brand/20 flex items-center justify-center text-brand border border-brand/30">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Publish to Social Media</h2>
            <p className="text-xs text-slate-400">Unggah video Anda langsung ke YouTube Shorts, TikTok & Facebook Reels</p>
          </div>
        </div>

        {success ? (
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Berhasil Dipublikasikan!</h3>
            <p className="text-xs text-slate-400 mt-2 px-4 leading-relaxed">
              Video Anda sedang dalam proses antrean upload di latar belakang. Anda bisa mengecek channel YouTube, profil TikTok, atau halaman Facebook Anda sebentar lagi.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-xl transition-all"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-450 text-xs font-semibold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Platform Selection */}
            <div>
              <label className="text-xs font-extrabold text-slate-450 uppercase tracking-wider block mb-2">Pilih Platform</label>
              
              {loadingStatus ? (
                <div className="h-16 bg-slate-850 animate-pulse rounded-2xl w-full"></div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {/* YouTube Option */}
                  <button
                    type="button"
                    onClick={() => togglePlatform("youtube")}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 ${
                      !status.youtube
                        ? "bg-slate-950/20 border-slate-900 opacity-50 cursor-not-allowed"
                        : selectedPlatforms.youtube
                        ? "bg-brand/10 border-brand/50 text-brand"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold">YouTube</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.youtube ? "bg-green-500 animate-pulse" : "bg-slate-600"}`}></span>
                    </div>
                    <span className="text-[9px] text-slate-500">
                      {status.youtube ? (selectedPlatforms.youtube ? "Terpilih" : "Aktif") : "Offline"}
                    </span>
                  </button>

                  {/* TikTok Option */}
                  <button
                    type="button"
                    onClick={() => togglePlatform("tiktok")}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 ${
                      !status.tiktok
                        ? "bg-slate-950/20 border-slate-900 opacity-50 cursor-not-allowed"
                        : selectedPlatforms.tiktok
                        ? "bg-brand/10 border-brand/50 text-brand"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold">TikTok</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.tiktok ? "bg-green-500 animate-pulse" : "bg-slate-600"}`}></span>
                    </div>
                    <span className="text-[9px] text-slate-500">
                      {status.tiktok ? (selectedPlatforms.tiktok ? "Terpilih" : "Aktif") : "Offline"}
                    </span>
                  </button>

                  {/* Facebook Option */}
                  <button
                    type="button"
                    onClick={() => togglePlatform("facebook")}
                    className={`p-2.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-20 ${
                      !status.facebook
                        ? "bg-slate-950/20 border-slate-900 opacity-50 cursor-not-allowed"
                        : selectedPlatforms.facebook
                        ? "bg-brand/10 border-brand/50 text-brand"
                        : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[10px] font-bold">Facebook</span>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.facebook ? "bg-green-500 animate-pulse" : "bg-slate-600"}`}></span>
                    </div>
                    <span className="text-[9px] text-slate-500">
                      {status.facebook ? (selectedPlatforms.facebook ? "Terpilih" : "Aktif") : "Offline"}
                    </span>
                  </button>
                </div>
              )}

              {/* Link to integrations if not connected */}
              {(!status.youtube || !status.tiktok || !status.facebook) && !loadingStatus && (
                <Link
                  href="/integrations"
                  onClick={onClose}
                  className="mt-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <span>Atur akun & integrasi di Pengaturan</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Title Input */}
            <div>
              <label htmlFor="publish-title" className="text-xs font-extrabold text-slate-450 uppercase tracking-wider block mb-1.5">Judul Video</label>
              <input
                id="publish-title"
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={publishing}
                placeholder="Masukkan judul menarik..."
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-850 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all"
              />
            </div>

            {/* Description Input */}
            <div>
              <label htmlFor="publish-desc" className="text-xs font-extrabold text-slate-450 uppercase tracking-wider block mb-1.5">Deskripsi / Caption</label>
              <textarea
                id="publish-desc"
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={publishing}
                rows={3}
                placeholder="Tulis deskripsi atau hashtag..."
                className="w-full px-4 py-3 bg-slate-950/40 border border-slate-850 rounded-2xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/40 transition-all resize-none"
              />
            </div>

            {/* Submit Action */}
            <button
              onClick={handlePublish}
              disabled={publishing || loadingStatus || (!selectedPlatforms.youtube && !selectedPlatforms.tiktok && !selectedPlatforms.facebook)}
              className="w-full py-4 bg-brand hover:bg-brand-dark disabled:bg-slate-800 disabled:opacity-55 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand/20 text-xs active:scale-98 mt-2"
            >
              {publishing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengunggah Video...</span>
                </>
              ) : (
                <span>Publish Sekarang</span>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
