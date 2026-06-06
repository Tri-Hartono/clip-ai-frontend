"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { UploadCloud, Play, RefreshCw, CheckCircle2, Video, Sparkles, AlertTriangle, ArrowRight, X } from "lucide-react"
import { uploadVideo } from "@/services/upload"
import { processYoutube } from "@/services/youtube"
import { api } from "@/services/api"

interface UploadZoneProps {
  onSuccess: (video: any) => void
}

export default function UploadZone({ onSuccess }: UploadZoneProps) {
  const [activeTab, setActiveTab] = useState<"file" | "youtube">("file")
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<"idle" | "download" | "audio" | "whisper" | "finished">("idle")
  const [ytUrl, setYtUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [error, setError] = useState("")

  const [isDragOver, setIsDragOver] = useState(false)
  
  // Real-time Credit Limit Interceptor
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const [creditsLimitModalOpen, setCreditsLimitModalOpen] = useState(false)
  const router = useRouter()

  // Fetch current user profile to read credits on mount
  const checkCredits = async () => {
    try {
      const resp = await api.get("/api/auth/me")
      if (resp.data && resp.data.user) {
        setCurrentCredits(resp.data.user.credits)
      }
    } catch (err) {
      console.error("Failed to fetch credits on UploadZone mount", err)
    }
  }

  useEffect(() => {
    checkCredits()
  }, [])

  // Helper validation to prevent triggering process when credits = 0
  const validateCredits = (): boolean => {
    if (currentCredits !== null && currentCredits <= 0) {
      setCreditsLimitModalOpen(true)
      return false
    }
    return true
  }

  useEffect(() => {
    if (activeTab === "youtube" && ytUrl) {
      let videoId: string | null = null
      
      try {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/|live\/)([^#\&\?]*).*/
        const match = ytUrl.match(regExp)
        if (match && match[2].length === 11) {
          videoId = match[2]
        }
      } catch (e) {
        // Suppress parsing errors on malformed links
      }

      if (videoId) {
        setThumbnailUrl(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
        setError("")
      } else {
        setThumbnailUrl(null)
      }
    } else {
      setThumbnailUrl(null)
    }
  }, [ytUrl, activeTab])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (!validateCredits()) return
    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFileUpload(files[0])
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!validateCredits()) return
    const files = e.target.files
    if (files && files.length > 0) {
      await processFileUpload(files[0])
    }
  }

  const processFileUpload = async (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please drop/select a valid video file.")
      return
    }
    
    setLoading(true)
    setError("")
    setProgress(0)
    setCurrentPhase("download")

    try {
      const data = await uploadVideo(file, (p) => {
        setProgress(p)
        if (p >= 100) {
          setCurrentPhase("audio")
          setProgress(50)
        }
      })
      
      setCurrentPhase("whisper")
      setProgress(85)
      
      setTimeout(() => {
        setCurrentPhase("finished")
        setProgress(100)
        onSuccess(data.video)
      }, 1500)

    } catch (err: any) {
      console.error(err)
      // If payment required credit limit caught
      if (err.response && err.response.status === 402) {
        setCreditsLimitModalOpen(true)
      } else {
        setError("Upload failed. Make sure Golang backend is running.")
      }
      setLoading(false)
    }
  }

  const handleYtSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!thumbnailUrl) {
      setError("Please enter a valid YouTube video URL.")
      return
    }

    if (!validateCredits()) return

    setLoading(true)
    setError("")
    setCurrentPhase("download")
    setProgress(15)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 45) {
          return prev + 5
        } else if (prev >= 45 && prev < 75) {
          setCurrentPhase("audio")
          return prev + 3
        } else if (prev >= 75 && prev < 98) {
          setCurrentPhase("whisper")
          return prev + 2
        }
        return prev
      })
    }, 1800)

    try {
      const data = await processYoutube(ytUrl)
      clearInterval(interval)
      setCurrentPhase("finished")
      setProgress(100)
      
      setTimeout(() => {
        onSuccess(data.video)
        setYtUrl("")
        setThumbnailUrl(null)
      }, 1000)
      
    } catch (err: any) {
      clearInterval(interval)
      console.error(err)
      if (err.response && err.response.status === 402) {
        setCreditsLimitModalOpen(true)
      } else {
        setError("YouTube processing failed. Ensure yt-dlp & python worker is active.")
      }
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md w-full max-w-2xl mx-auto font-sans">
        {/* Tabs */}
        {!loading && (
          <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl mb-6 border border-slate-100">
            <button
              onClick={() => { setActiveTab("file"); setError(""); setYtUrl(""); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                activeTab === "file" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/40" 
                  : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <UploadCloud className="w-5 h-5 text-brand" />
              <span>Upload File</span>
            </button>
            <button
              onClick={() => { setActiveTab("youtube"); setError(""); }}
              className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer ${
                activeTab === "youtube" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/40" 
                  : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <Play className="w-5 h-5 text-rose-500 fill-current" />
              <span>YouTube URL</span>
            </button>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold animate-fade-in">
            {error}
          </div>
        )}

        {/* Main Interaction Area */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-full space-y-6 max-w-md">
              <div className="text-center">
                <h3 className="text-xl font-extrabold text-slate-900 mb-1 animate-pulse-slow">AI Transcribing Pipeline</h3>
                <p className="text-xs text-slate-400 font-semibold">Your video is entering modern cloud deep-learning pipeline</p>
              </div>

              <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/45">
                <div 
                  className="h-full bg-gradient-to-r from-brand via-brand-accent to-emerald-400 transition-all duration-350 rounded-full" 
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-3.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-inner">
                {/* Stage 1 */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                      currentPhase === "download" ? "border-brand text-brand bg-brand/5 animate-pulse" :
                      currentPhase !== "idle" ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" : "border-slate-300 text-slate-400"
                    }`}>
                      {currentPhase !== "idle" && currentPhase !== "download" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : "1"}
                    </div>
                    <span className={currentPhase === "download" ? "text-brand font-bold" : "text-slate-550 font-semibold"}>
                      {activeTab === "file" ? "Uploading video file to server" : "Downloading YouTube high-quality stream"}
                    </span>
                  </div>
                  {currentPhase === "download" && <RefreshCw className="w-3.5 h-3.5 text-brand animate-spin" />}
                </div>

                {/* Stage 2 */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                      currentPhase === "audio" ? "border-brand text-brand bg-brand/5 animate-pulse" :
                      currentPhase === "whisper" || currentPhase === "finished" ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" : "border-slate-300 text-slate-400"
                    }`}>
                      {currentPhase === "whisper" || currentPhase === "finished" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : "2"}
                    </div>
                    <span className={currentPhase === "audio" ? "text-brand font-bold" : "text-slate-550 font-semibold"}>
                      Extracting audio layers via FFmpeg
                    </span>
                  </div>
                  {currentPhase === "audio" && <RefreshCw className="w-3.5 h-3.5 text-brand animate-spin" />}
                </div>

                {/* Stage 3 */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                      currentPhase === "whisper" ? "border-brand text-brand bg-brand/5 animate-pulse" :
                      currentPhase === "finished" ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" : "border-slate-300 text-slate-400"
                    }`}>
                      {currentPhase === "finished" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : "3"}
                    </div>
                    <span className={currentPhase === "whisper" ? "text-brand font-bold" : "text-slate-550 font-semibold"}>
                      AI transcribing & subtitle timeline generation
                    </span>
                  </div>
                  {currentPhase === "whisper" && <RefreshCw className="w-3.5 h-3.5 text-brand animate-spin" />}
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "file" ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleFileDrop}
            className={`border-2 border-dashed rounded-2xl py-12 px-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
              isDragOver 
                ? "border-brand bg-brand/5 shadow-inner" 
                : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
            }`}
            onClick={() => {
              if (validateCredits()) {
                document.getElementById("file-input")?.click()
              }
            }}
          >
            <input
              id="file-input"
              type="file"
              accept="video/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 text-slate-400 border border-slate-100 shadow-sm animate-float-slow">
              <UploadCloud className="w-8 h-8 text-brand" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 mb-1">Drag and drop your video file</h3>
            <p className="text-xs text-slate-400 font-semibold mb-4">Supports MP4, MOV, AVI up to 150MB</p>
            <button className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs transition-all shadow-sm active:scale-95 cursor-pointer">
              Browse files
            </button>
          </div>
        ) : (
          <form onSubmit={handleYtSubmit} className="space-y-4 py-2">
            {thumbnailUrl && (
              <div className="w-full aspect-video rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden relative group shadow-sm animate-fade-in mb-4">
                <img 
                  src={thumbnailUrl} 
                  alt="YouTube Video Preview" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform duration-250">
                    <Play className="w-6 h-6 fill-current ml-1" />
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Play className="w-5 h-5 text-rose-500 fill-current" />
              </div>
              <input
                type="text"
                placeholder="Paste YouTube Video URL (e.g. https://youtube.com/watch?v=...)"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all font-semibold text-sm"
              />
            </div>
            <button 
              type="submit"
              className="w-full py-4 rounded-xl bg-brand hover:bg-brand-dark text-white font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-md shadow-brand/20 active:scale-98 cursor-pointer"
            >
              <span>Process video with AI</span>
            </button>
          </form>
        )}
      </div>

      {/* Credit Limit Interceptor Alert Modal (Fresh Light Mode) */}
      {creditsLimitModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-55 flex items-center justify-center p-4 font-sans animate-fade-in text-slate-800">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-sm shadow-2xl relative text-center">
            
            {/* Close Button */}
            <button
              onClick={() => setCreditsLimitModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-50 border border-slate-200 text-slate-450 hover:text-slate-800 rounded-xl transition-all active:scale-90 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Header Icon */}
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mx-auto mb-4 animate-bounce-slow">
              <AlertTriangle className="w-7 h-7" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
              Kredit Transkripsi Habis!
            </h3>
            
            {/* Description */}
            <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-3.5 px-2">
              Maaf, saldo kredit pemrosesan video Anda telah habis (**0.00 Menit**). Silakan lakukan pengisian ulang kredit instan Anda di halaman Billing untuk melanjutkan pembuatan video Shorts Anda.
            </p>

            {/* Direct CTA Link to Billing page */}
            <button
              onClick={() => {
                setCreditsLimitModalOpen(false)
                router.push("/billing")
              }}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2.5 mt-6 shadow-md shadow-brand/10 text-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>Top-Up Kredit Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Dismiss link */}
            <button
              onClick={() => setCreditsLimitModalOpen(false)}
              className="text-xs text-slate-450 hover:text-slate-600 font-bold mt-4 transition-colors cursor-pointer block mx-auto"
            >
              Nanti Saja
            </button>

          </div>
        </div>
      )}
    </div>
  )
}
