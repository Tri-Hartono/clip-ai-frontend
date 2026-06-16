"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import { useAuth } from "@/providers/AuthProvider"
import { Image as ImageIcon, Wand2, Loader2, RefreshCw } from "lucide-react"
import { api } from "@/services/api"
import { useProjectStore } from "@/store/projectStore"

export default function TimelapsePage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { addProject } = useProjectStore()

  const [img1, setImg1] = useState<File | null>(null)
  const [img2, setImg2] = useState<File | null>(null)
  const [format, setFormat] = useState<"portrait" | "landscape">("portrait")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const img1Ref = useRef<HTMLInputElement>(null)
  const img2Ref = useRef<HTMLInputElement>(null)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  const handleGenerate = async () => {
    if (!img1 || !img2) return

    setLoading(true)
    setErrorMsg(null)
    try {
      const formData = new FormData()
      formData.append("image1", img1)
      formData.append("image2", img2)
      formData.append("format", format)

      const resp = await api.post("/api/videos/timelapse", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (resp.data.video) {
        const newProj = {
          id: resp.data.video.id,
          uuid: resp.data.video.uuid,
          title: resp.data.video.title,
          status: resp.data.video.status,
          originalPath: resp.data.video.originalPath,
          outputPath: resp.data.video.outputPath || "",
          duration: resp.data.video.duration || 0,
          createdAt: resp.data.video.createdAt || new Date().toISOString(),
          thumbnailUrl: resp.data.video.thumbnailUrl || ""
        }
        addProject(newProj)
        router.push(`/editor/${newProj.uuid || newProj.id}`)
      }
    } catch (err: any) {
      console.error("Timelapse generation failed", err)
      const message = err.response?.data?.error || "Gagal menghubungi server AI. Silakan coba lagi."
      
      // Simplify common replicate errors for better UX
      if (message.includes("Insufficient credit") || message.includes("402")) {
        setErrorMsg("⚠️ Saldo/Kredit API Replicate Anda tidak mencukupi untuk menjalankan model ini. Silakan top-up di replicate.com/account/billing")
      } else {
        setErrorMsg(`⚠️ Error AI: ${message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
              <Wand2 className="w-6 h-6 text-brand" />
              <span>AI Timelapse Generator</span>
            </h1>
            <p className="text-sm text-slate-500 font-semibold mt-0.5">Buat transisi sinematik Before & After otomatis dari 2 buah foto.</p>
          </div>
        </div>

        <div className="max-w-4xl bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Before Image */}
              <div 
                onClick={() => img1Ref.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[4/3] relative overflow-hidden group ${
                  img1 ? "border-brand/30 bg-brand/5 shadow-inner" : "border-slate-300 hover:border-brand hover:bg-slate-50 bg-white"
                }`}
              >
                <input type="file" ref={img1Ref} className="hidden" accept="image/*" onChange={(e) => {
                  if (e.target.files?.[0]) setImg1(e.target.files[0])
                }} />
                {img1 ? (
                  <>
                    <img src={URL.createObjectURL(img1)} alt="Before" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm">Ganti Foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 group-hover:text-brand group-hover:bg-brand/10 transition-all">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-700">Foto "Before"</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-2 max-w-[200px]">Upload foto kondisi lama, kotor, atau sebelum perbaikan.</p>
                  </>
                )}
              </div>

              {/* After Image */}
              <div 
                onClick={() => img2Ref.current?.click()}
                className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[4/3] relative overflow-hidden group ${
                  img2 ? "border-emerald-500/30 bg-emerald-500/5 shadow-inner" : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50 bg-white"
                }`}
              >
                <input type="file" ref={img2Ref} className="hidden" accept="image/*" onChange={(e) => {
                  if (e.target.files?.[0]) setImg2(e.target.files[0])
                }} />
                {img2 ? (
                  <>
                    <img src={URL.createObjectURL(img2)} alt="After" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl text-white font-bold text-sm">Ganti Foto</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4 group-hover:scale-110 group-hover:text-emerald-500 group-hover:bg-emerald-500/10 transition-all">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <h4 className="text-base font-bold text-slate-700">Foto "After"</h4>
                    <p className="text-xs font-semibold text-slate-400 mt-2 max-w-[200px]">Upload foto kondisi baru, bagus, atau setelah perbaikan.</p>
                  </>
                )}
              </div>

            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-3 block">Pilih Format Video</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setFormat("portrait")}
                    className={`px-5 py-3 text-sm font-bold rounded-2xl transition-all border flex items-center gap-2 ${
                      format === "portrait" ? "bg-brand border-brand text-white shadow-md shadow-brand/20" : "bg-white border-slate-200 text-slate-600 hover:border-brand/30 hover:bg-slate-50"
                    }`}
                  >
                    📱 Portrait (9:16)
                  </button>
                  <button 
                    onClick={() => setFormat("landscape")}
                    className={`px-5 py-3 text-sm font-bold rounded-2xl transition-all border flex items-center gap-2 ${
                      format === "landscape" ? "bg-brand border-brand text-white shadow-md shadow-brand/20" : "bg-white border-slate-200 text-slate-600 hover:border-brand/30 hover:bg-slate-50"
                    }`}
                  >
                    💻 Landscape (16:9)
                  </button>
                </div>
              </div>

              <div className="w-full md:w-auto flex flex-col items-end">
                <button
                  onClick={handleGenerate}
                  disabled={!img1 || !img2 || loading}
                  className={`px-8 py-4 rounded-2xl text-white text-base font-extrabold flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 w-full ${
                    !img1 || !img2 || loading ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-2xl hover:scale-105 shadow-emerald-500/20"
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Merender AI Replicate (30-60 detik)...</span>
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-6 h-6" />
                      <span>Generate AI Video</span>
                    </>
                  )}
                </button>
                
                {errorMsg && (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl max-w-sm text-left animate-in fade-in slide-in-from-top-2">
                    {errorMsg}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
