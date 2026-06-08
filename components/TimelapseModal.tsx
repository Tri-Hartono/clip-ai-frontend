"use client"

import { useState, useRef } from "react"
import { X, Image as ImageIcon, Wand2, Loader2 } from "lucide-react"

interface TimelapseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (video: any) => void
  api: any
}

export default function TimelapseModal({ isOpen, onClose, onSuccess, api }: TimelapseModalProps) {
  const [img1, setImg1] = useState<File | null>(null)
  const [img2, setImg2] = useState<File | null>(null)
  const [format, setFormat] = useState<"portrait" | "landscape">("portrait")
  const [loading, setLoading] = useState(false)
  
  const img1Ref = useRef<HTMLInputElement>(null)
  const img2Ref = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    if (!img1 || !img2) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("image1", img1)
      formData.append("image2", img2)
      formData.append("format", format)

      const resp = await api.post("/api/videos/timelapse", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      if (resp.data.video) {
        onSuccess(resp.data.video)
        onClose()
      }
    } catch (err) {
      console.error("Timelapse generation failed", err)
      alert("Failed to generate timelapse. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-brand" />
              AI Timelapse Generator
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Buat transisi sinematik Before & After dari 2 buah foto.
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 bg-slate-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Before Image */}
            <div 
              onClick={() => img1Ref.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[4/3] relative overflow-hidden ${
                img1 ? "border-brand/30 bg-brand/5" : "border-slate-300 hover:border-brand/50 bg-white"
              }`}
            >
              <input type="file" ref={img1Ref} className="hidden" accept="image/*" onChange={(e) => {
                if (e.target.files?.[0]) setImg1(e.target.files[0])
              }} />
              {img1 ? (
                <img src={URL.createObjectURL(img1)} alt="Before" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Foto "Before"</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Upload foto lama / kotor</p>
                </>
              )}
            </div>

            {/* After Image */}
            <div 
              onClick={() => img2Ref.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all aspect-[4/3] relative overflow-hidden ${
                img2 ? "border-emerald-500/30 bg-emerald-500/5" : "border-slate-300 hover:border-emerald-500/50 bg-white"
              }`}
            >
              <input type="file" ref={img2Ref} className="hidden" accept="image/*" onChange={(e) => {
                if (e.target.files?.[0]) setImg2(e.target.files[0])
              }} />
              {img2 ? (
                <img src={URL.createObjectURL(img2)} alt="After" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">Foto "After"</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Upload foto baru / bagus</p>
                </>
              )}
            </div>

          </div>

          <div className="mt-6">
            <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2 block">Format Video</label>
            <div className="flex gap-3">
              <button 
                onClick={() => setFormat("portrait")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-2 ${
                  format === "portrait" ? "bg-brand border-brand text-white" : "bg-white border-slate-200 text-slate-600 hover:border-brand/30"
                }`}
              >
                📱 Portrait (9:16)
              </button>
              <button 
                onClick={() => setFormat("landscape")}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all border flex items-center gap-2 ${
                  format === "landscape" ? "bg-brand border-brand text-white" : "bg-white border-slate-200 text-slate-600 hover:border-brand/30"
                }`}
              >
                💻 Landscape (16:9)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex justify-end">
          <button
            onClick={handleGenerate}
            disabled={!img1 || !img2 || loading}
            className={`px-6 py-3 rounded-xl text-white text-sm font-extrabold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
              !img1 || !img2 || loading ? "bg-slate-300 shadow-none cursor-not-allowed" : "bg-brand hover:bg-brand-dark shadow-brand/20"
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Merender Video AI...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>Generate Timelapse</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
