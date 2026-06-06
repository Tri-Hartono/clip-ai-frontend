"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import { Sparkles, UploadCloud, RefreshCw, Download, Image as ImageIcon, Sliders, Layers, User, Globe, Camera, Trash2, Eye } from "lucide-react"
import { api } from "@/services/api"

interface MockupItem {
  id: number
  title: string
  templateName: string
  imagePath: string
  createdAt: string
  gender?: string
  ethnicity?: string
  setting?: string
}

export default function MockupPage() {
  const [productFile, setProductFile] = useState<File | null>(null)
  const [productPreview, setProductPreview] = useState<string | null>(null)
  
  // Customizer Preferences
  const [productType, setProductType] = useState<"tshirt" | "mukena">("tshirt")
  const [cropLeft, setCropLeft] = useState(false)
  const [fittingMode, setFittingMode] = useState<"overlay" | "blend">("blend")
  const [gender, setGender] = useState<"female" | "male">("female")
  const [ethnicity, setEthnicity] = useState<"indonesian" | "korean" | "western" | "middle_eastern">("indonesian")
  const [setting, setSetting] = useState<"studio_front" | "studio_side" | "outdoor" | "closeup">("studio_front")
  
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [mockups, setMockups] = useState<MockupItem[]>([])
  const [error, setError] = useState("")
  const [lastGeneratedMockup, setLastGeneratedMockup] = useState<MockupItem | null>(null)
  const [compareMode, setCompareMode] = useState(false)

  // Loading Ticker Steps
  const [loadingStep, setLoadingStep] = useState(0)
  const loadingMessages = [
    "Mengunggah gambar pakaian ke server...",
    "Gemini AI sedang memindai warna, motif, dan detail pakaian...",
    "Membuat deskripsi fashion berkualitas tinggi...",
    "Imagen 3 AI sedang me-render model fashion yang menawan...",
    "Menyelaraskan pencahayaan studio & tekstur kulit...",
    "Menyelesaikan detail akhir mockup..."
  ]

  useEffect(() => {
    let interval: any
    if (generating) {
      setLoadingStep(0)
      interval = setInterval(() => {
        setLoadingStep(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev))
      }, 4000)
    }
    return () => clearInterval(interval)
  }, [generating])

  useEffect(() => {
    fetchMockups()
  }, [])

  const fetchMockups = async () => {
    setLoading(true)
    try {
      const resp = await api.get("/api/mockups")
      setMockups(resp.data)
    } catch (err) {
      console.error("Failed to load mockups list", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setProductFile(file)
      setProductPreview(URL.createObjectURL(file))
      setLastGeneratedMockup(null)
      setError("")
      
      // Auto-enable cropLeft if the filename suggests a jersey/collage or catalog
      const lowerName = file.name.toLowerCase()
      if (lowerName.includes("catalog") || lowerName.includes("collage") || lowerName.includes("jersey") || lowerName.includes("kit")) {
        setCropLeft(true)
      }
    }
  }

  const clearFile = () => {
    setProductFile(null)
    setProductPreview(null)
    setLastGeneratedMockup(null)
    setCropLeft(false)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus mockup ini?")) return
    try {
      await api.delete(`/api/mockups/${id}`)
      setMockups(prev => prev.filter(item => item.id !== id))
      if (lastGeneratedMockup?.id === id) {
        setLastGeneratedMockup(null)
      }
    } catch (err) {
      console.error("Failed to delete mockup", err)
      setError("Gagal menghapus mockup.")
    }
  }

  const handleGenerate = async () => {
    if (!productFile) {
      setError("Silakan unggah gambar produk/logo Anda terlebih dahulu.")
      return
    }

    setGenerating(true)
    setError("")
    setLastGeneratedMockup(null)
    setCompareMode(false)

    const formData = new FormData()
    formData.append("image", productFile)
    formData.append("templateName", productType)
    formData.append("gender", gender)
    formData.append("ethnicity", ethnicity)
    formData.append("setting", setting)
    formData.append("cropLeft", cropLeft.toString())
    formData.append("fittingMode", fittingMode)
    formData.append("scale", "1.0")
    formData.append("offsetV", "0")

    try {
      const resp = await api.post("/api/mockups/generate", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      if (resp.data) {
        setMockups(prev => [resp.data, ...prev])
        setLastGeneratedMockup(resp.data)
      }
    } catch (err) {
      console.error("Mockup generation failed", err)
      setError("Gagal membuat mockup AI. Pastikan backend & AI-Worker aktif dan GOOGLE_API_KEY valid.")
    } finally {
      setGenerating(false)
    }
  }

  const getFullImagePath = (path: string) => {
    if (path.startsWith("http")) return path
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
    return `${apiBase}${path}`
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col max-h-screen overflow-y-auto pb-16 md:pb-0">
        {/* Navbar header */}
        <div className="h-16 border-b border-slate-200/60 px-6 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-brand/10 text-brand font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wide">AI Lab</span>
            <span className="font-extrabold text-slate-800 text-sm tracking-tight">AI Product Try-On Generator</span>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[600px]">
          {/* Left panel */}
          <div className="lg:col-span-5 p-6 bg-white border-r border-slate-200/60 overflow-y-auto space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">Try-On Customizer</h2>
                <p className="text-[10px] text-slate-400 font-semibold">Tentukan karakteristik model foto AI Anda</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-xs font-bold animate-fade-in">
                {error}
              </div>
            )}

            {/* Product Type Selector */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">1. Jenis Produk Pakaian</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setProductType("tshirt")}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition-all flex flex-col gap-1 ${
                    productType === "tshirt" ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-lg">👕</span>
                  <span>Kaos / T-Shirt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProductType("mukena")}
                  className={`p-3.5 rounded-2xl border text-xs font-extrabold text-left transition-all flex flex-col gap-1 ${
                    productType === "mukena" ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span className="text-lg">🧕</span>
                  <span>Mukena / Prayer Robe</span>
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">2. Unggah Gambar Pakaian Anda</span>
              
              {!productPreview ? (
                <div
                  onClick={() => document.getElementById("mockup-file-input")?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-brand/40 bg-slate-50/50 hover:bg-brand/5 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-inner"
                >
                  <input
                    id="mockup-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <UploadCloud className="w-8 h-8 text-brand mb-2" />
                  <span className="text-xs font-bold text-slate-800">Pilih atau Seret Foto Pakaian</span>
                  <span className="text-[9px] text-slate-400 mt-1">Gunakan foto pakaian lipat, rebah, atau transparan (PNG/JPG)</span>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img src={productPreview} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-white" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{productFile?.name}</p>
                      <p className="text-[9px] text-slate-400 font-semibold">{((productFile?.size || 0) / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Hapus gambar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Catalog/Collage mode switch */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">3. Tata Letak Gambar</span>
              <label className="flex items-start gap-3 cursor-pointer p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all border border-slate-200 select-none">
                <input
                  type="checkbox"
                  checked={cropLeft}
                  onChange={(e) => setCropLeft(e.target.checked)}
                  className="rounded text-brand focus:ring-brand w-4.5 h-4.5 mt-0.5 cursor-pointer accent-brand"
                />
                <div className="text-left min-w-0">
                  <p className="text-xs font-bold text-slate-800">Katalog / Kolase Jersey</p>
                  <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-0.5">
                    Aktifkan jika foto pakaian Anda menampilkan tampak depan & belakang sekaligus (AI akan memotong sisi kiri saja untuk dipakai model).
                  </p>
                </div>
              </label>
            </div>

            {/* Fitting Mode Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">3.5 Mode Fitting Pakaian</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFittingMode("blend")}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex flex-col gap-1 text-left transition-all duration-200 cursor-pointer ${
                    fittingMode === "blend" ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                  }`}
                >
                  <span className="flex items-center gap-1">✨ Bahan & Tekstur</span>
                  <span className="text-[8px] text-slate-400 font-normal leading-normal">Tekstur menyatu dengan lipatan & bayangan model (Sangat Realistis)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFittingMode("overlay")}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex flex-col gap-1 text-left transition-all duration-200 cursor-pointer ${
                    fittingMode === "overlay" ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                  }`}
                >
                  <span className="flex items-center gap-1">🖼️ Tempel Tengah</span>
                  <span className="text-[8px] text-slate-400 font-normal leading-normal">Menempelkan gambar produk utuh di tengah pakaian model</span>
                </button>
              </div>
            </div>

            {/* Model Gender Selector */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand" />
                  4. Gender Model
                </span>
                {productType === "mukena" && (
                  <span className="text-[9px] text-brand font-bold bg-brand/5 px-2 py-0.5 rounded-md">Wajib Wanita untuk Mukena</span>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGender("female")}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    gender === "female" || productType === "mukena" ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10 font-black" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                  }`}
                  disabled={productType === "mukena"}
                >
                  👩 Wanita (Cantik)
                </button>
                <button
                  type="button"
                  onClick={() => setGender("male")}
                  className={`p-3 rounded-2xl border text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
                    gender === "male" && productType !== "mukena" ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10 font-black" : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-350"
                  } ${productType === "mukena" ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={productType === "mukena"}
                >
                  👨 Pria (Ganteng)
                </button>
              </div>
            </div>

            {/* Model Ethnicity Selector */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-brand" />
                5. Asal Etnis Model
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "indonesian", label: "🇮🇩 Indonesia", desc: "Wajah Lokal" },
                  { id: "korean", label: "🇰🇷 Korea", desc: "K-Fashion" },
                  { id: "western", label: "🇺🇸 Barat / Western", desc: "Kaukasia" },
                  { id: "middle_eastern", label: "🇸🇦 Timur Tengah", desc: "Timur Tengah" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEthnicity(item.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      ethnicity === item.id ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-extrabold">{item.label}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Angle & Setting Selector */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-brand" />
                6. Sudut Pandang / Setting
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "studio_front", label: "📸 Studio Depan", desc: "Kamera Depan" },
                  { id: "studio_side", label: "📐 Studio Samping", desc: "Kamera Samping" },
                  { id: "outdoor", label: "🌳 Outdoor Street", desc: "Candid Casual" },
                  { id: "closeup", label: "🔍 Detail Close-Up", desc: "Fokus Tekstur" }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSetting(item.id as any)}
                    className={`p-2.5 rounded-2xl border text-left transition-all ${
                      setting === item.id ? "bg-brand/5 border-brand text-brand ring-1 ring-brand/10" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <p className="text-xs font-extrabold">{item.label}</p>
                    <p className="text-[9px] text-slate-400 font-semibold">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !productFile}
              className="w-full py-4 bg-brand hover:bg-brand-dark disabled:bg-slate-350 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand/10 text-xs active:scale-98 cursor-pointer"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Sedang Membuat Mockup...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Model Instan</span>
                </>
              )}
            </button>
          </div>

          {/* Right panel (Interactive preview) */}
          <div className="lg:col-span-7 p-6 flex flex-col justify-start items-center bg-slate-100/40 border-r border-slate-200/60 overflow-y-auto">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-[10px] text-brand font-black uppercase tracking-widest flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                LIVE WORKSPACE PREVIEW
              </span>
              {lastGeneratedMockup && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCompareMode(!compareMode)}
                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-extrabold flex items-center gap-1.5 transition-all ${
                      compareMode ? "bg-brand text-white border-transparent" : "bg-white border-slate-250 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{compareMode ? "Lihat Hasil AI" : "Bandingkan Asli"}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="relative w-full max-w-xl aspect-square bg-slate-900 border border-slate-300/80 rounded-[32px] overflow-hidden shadow-xl select-none flex items-center justify-center">
              {generating ? (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-center p-8">
                  {/* Glowing Pulse Ring */}
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full bg-brand/10 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-brand/20 animate-pulse" />
                    <div className="absolute inset-6 rounded-full bg-brand flex items-center justify-center shadow-lg shadow-brand/40">
                      <Sparkles className="w-8 h-8 text-white animate-pulse" />
                    </div>
                  </div>
                  <h4 className="text-base font-extrabold text-white mb-2 animate-pulse">Menghasilkan Model Fashion AI...</h4>
                  <div className="min-h-[40px] flex items-center justify-center">
                    <p className="text-xs text-brand/80 font-bold max-w-xs animate-fade-in">
                      {loadingMessages[loadingStep]}
                    </p>
                  </div>
                  
                  {/* Progress Line */}
                  <div className="w-48 h-1.5 bg-white/10 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="h-full bg-brand transition-all duration-1000 ease-out" 
                      style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : lastGeneratedMockup ? (
                <>
                  <img
                    src={getFullImagePath(compareMode ? productPreview || "" : lastGeneratedMockup.imagePath)}
                    alt="Active Mockup View"
                    className="w-full h-full object-cover animate-fade-in"
                  />
                  {!compareMode && (
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                      <a
                        href={getFullImagePath(lastGeneratedMockup.imagePath)}
                        download={`mockup_${lastGeneratedMockup.templateName}.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-2xl text-[10px] shadow-lg flex items-center gap-1.5 transition-all hover:scale-102"
                      >
                        <Download className="w-3.5 h-3.5 text-brand" />
                        <span>Download Mockup</span>
                      </a>
                    </div>
                  )}
                  {compareMode && (
                    <span className="absolute top-4 left-4 bg-black/60 text-white font-extrabold text-[9px] px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm">
                      Melihat Foto Asli
                    </span>
                  )}
                </>
              ) : productPreview ? (
                <div className="relative w-full h-full bg-slate-950 flex items-center justify-center">
                  <img
                    src={productPreview}
                    alt="Product Preview Only"
                    className="max-w-[80%] max-h-[80%] object-contain rounded-2xl"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-center">
                    <span className="text-[9px] bg-brand text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider inline-block mb-1">Terunggah</span>
                    <p className="text-[10px] text-white/90 font-bold">Produk siap digunakan. Klik &quot;Generate Model Instan&quot;.</p>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center text-white p-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-brand/10 flex items-center justify-center mb-4 text-brand">
                    <ImageIcon className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h4 className="text-sm font-extrabold tracking-tight">Belum Ada Pakaian Terunggah</h4>
                  <p className="text-[10px] text-slate-400 max-w-xs mt-2 font-semibold leading-relaxed">
                    Silakan unggah foto baju kaos, jaket, mukena, atau pakaian lainnya pada panel sebelah kiri untuk memulai pemodelan AI.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Gallery */}
        <div className="p-8 bg-white border-t border-slate-200/60">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <ImageIcon className="w-5 h-5 text-brand" />
              <h3 className="text-base font-extrabold text-slate-800">Galeri Hasil Mockup AI Saya</h3>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-6 h-6 text-brand animate-spin" />
              </div>
            ) : mockups.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold text-xs border border-dashed border-slate-200 rounded-3xl">
                Belum ada mockup yang pernah dibuat. Buat satu di atas!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockups.map((item) => {
                  const getGenderLabel = (g?: string) => {
                    if (item.templateName === "mukena") return "Hijab/Female"
                    return g === "male" ? "Male" : "Female"
                  }
                  
                  const getEthnicityLabel = (e?: string) => {
                    switch (e) {
                      case "indonesian": return "Indonesian"
                      case "korean": return "Korean"
                      case "western": return "Western"
                      case "middle_eastern": return "Middle Eastern"
                      default: return "Indonesian"
                    }
                  }

                  const getSettingLabel = (s?: string) => {
                    switch (s) {
                      case "studio_front": return "Front Studio"
                      case "studio_side": return "Side Studio"
                      case "outdoor": return "Outdoor"
                      case "closeup": return "Close-Up"
                      default: return "Studio"
                    }
                  }

                  return (
                    <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                      <div>
                        <div className="w-full aspect-square rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative mb-3 cursor-pointer" onClick={() => setLastGeneratedMockup(item)}>
                          <img
                            src={getFullImagePath(item.imagePath)}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 truncate mb-1">{item.title}</h4>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="text-[8px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{item.templateName}</span>
                          <span className="text-[8px] bg-brand/5 text-brand px-2 py-0.5 rounded-full font-bold uppercase">{getGenderLabel(item.gender)}</span>
                          <span className="text-[8px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{getEthnicityLabel(item.ethnicity)}</span>
                          <span className="text-[8px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold uppercase">{getSettingLabel(item.setting)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <button
                          type="button"
                          onClick={() => {
                            setLastGeneratedMockup(item)
                            setCompareMode(false)
                          }}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>
                        <a
                          href={getFullImagePath(item.imagePath)}
                          download={`mockup_${item.templateName}.jpg`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </a>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                          title="Hapus Mockup"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
