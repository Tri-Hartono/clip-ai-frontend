"use client"

import Link from "next/link"
import { useAuth } from "@/providers/AuthProvider"
import { 
  Scissors, 
  Play, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Video, 
  Download, 
  CheckCircle, 
  Flame, 
  Star, 
  Quote, 
  ArrowUpRight, 
  Languages, 
  Maximize2, 
  Smartphone, 
  Clock, 
  Sliders, 
  TrendingUp, 
  Users, 
  Cpu,
  Layers,
  Heart
} from "lucide-react"
import { useState, useEffect } from "react"

export default function LandingPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("podcast")
  const [typedText, setTypedText] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState("id")
  const [captionStyle, setCaptionStyle] = useState("yellow-dark")
  const [videoAspect, setVideoAspect] = useState("916") // '916' or '169'

  // Typing animation effect for the link input box mock
  useEffect(() => {
    const textToType = "https://www.youtube.com/watch?v=viral-podcast-clip"
    let index = 0
    const interval = setInterval(() => {
      setTypedText(textToType.slice(0, index))
      index++
      if (index > textToType.length + 5) {
        index = 0
      }
    }, 150)
    return () => clearInterval(interval)
  }, [])

  const useCases = {
    podcast: {
      title: "Podcast & Talkshow",
      quote: "Ubah obrolan 1 jam menjadi 10 klip Shorts penuh wawasan bernilai tinggi dalam semenit.",
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=600",
      tag: "Viral Potential"
    },
    ecommerce: {
      title: "E-Commerce & Produk",
      quote: "Buat video review produk yang dinamis dan tingkatkan konversi penjualan Anda hingga 300%.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=600",
      tag: "Tinggi Konversi"
    },
    education: {
      title: "Edukasi & Webinar",
      quote: "Potong poin penting materi ajar untuk konten edukasi mikro yang interaktif dan mudah dipahami.",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600",
      tag: "Mudah Dipelajari"
    }
  }

  const features = [
    {
      icon: Cpu,
      title: "AI Smart Scene Detection",
      description: "AI kami secara cerdas menganalisis seluruh durasi video untuk menemukan momen paling klimaks, lucu, atau inspiratif secara otomatis.",
      badge: "Teknologi Core"
    },
    {
      icon: Smartphone,
      title: "Auto Portrait Reframing (9:16)",
      description: "Secara otomatis memotong video landscape menjadi potrait dengan pelacakan wajah (smart face focusing) agar pembicara selalu di tengah frame.",
      badge: "Center Crop"
    },
    {
      icon: Sparkles,
      title: "Karaoke-Style Subtitles",
      description: "Hasilkan subtitle otomatis berbasis Whisper AI berakurasi tinggi dengan gaya running text menyala mengikuti suku kata yang diucapkan.",
      badge: "Akurasi 99%"
    },
    {
      icon: Languages,
      title: "Multi-Language Transcribe",
      description: "Dukungan penuh untuk transkrip otomatis bahasa Indonesia, Inggris, gaul/slang, dan puluhan bahasa lainnya tanpa hambatan.",
      badge: "Global Ready"
    },
    {
      icon: Sliders,
      title: "Instant Fast-Cut Engine",
      description: "Didukung backend FFmpeg berkinerja tinggi. Potong video berukuran GB langsung di cloud dalam milidetik tanpa render ulang yang lama.",
      badge: "Kecepatan Cahaya"
    },
    {
      icon: TrendingUp,
      title: "Algorithmic Retention Booster",
      description: "Desain layout, kombinasi warna, font tebal, dan template subtitle yang dioptimalkan khusus untuk memicu algoritma fyp TikTok & Reels.",
      badge: "Fyp Magnet"
    }
  ]

  const testimonials = [
    {
      name: "Andi Wijaya",
      role: "Digital Marketer & Shopify Seller",
      image: "https://avatar.iran.liara.run/public/boy?id=1",
      text: "Setelah menggunakan Clippers untuk video promosi produk saya, rasio konversi iklan naik drastis. Desain subitlenya menarik perhatian instan di feed Instagram."
    },
    {
      name: "Siti Rahma",
      role: "Podcaster & Content Creator",
      image: "https://avatar.iran.liara.run/public/girl?id=2",
      text: "Dulu butuh waktu berjam-jam untuk potong video landscape dan nulis subtitle manual di Premiere. Sekarang dengan Clippers, tinggal tempel link YouTube, beres dalam 2 menit!"
    },
    {
      name: "Kevin Pratama",
      role: "TikTok Agency Owner",
      image: "https://avatar.iran.liara.run/public/boy?id=3",
      text: "Tim editor kami bisa memproduksi ratusan konten Shorts per hari semenjak beralih menggunakan Clippers. Efisiensi kerja naik luar biasa tinggi!"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-[#0d3b35] flex flex-col font-sans relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-150px] left-1/4 w-[700px] h-[700px] rounded-full bg-brand/15 blur-[140px] pointer-events-none animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-[-150px] w-[600px] h-[600px] rounded-full bg-teal-400/10 blur-[130px] pointer-events-none animate-float-slow"></div>
      <div className="absolute bottom-1/4 left-[-200px] w-[700px] h-[700px] rounded-full bg-[#05b3a1]/10 blur-[150px] pointer-events-none animate-pulse-slow"></div>

      {/* STUNNING HEADER */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-55 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/35 animate-float-fast">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-wider flex items-center gap-1.5">
              <span>CLIPPERS</span>
              <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-lg font-mono font-bold">AI</span>
            </h1>
            <p className="text-[9px] text-brand font-semibold tracking-widest uppercase">Video Clip Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <Link 
              href="/dashboard"
              className="text-xs font-bold text-slate-500 hover:text-brand transition-colors mr-2 hidden sm:block"
            >
              Dashboard
            </Link>
          )}
          <Link
            href={user ? "/dashboard" : "/login"}
            className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-extrabold transition-all shadow-lg shadow-brand/20 flex items-center gap-2 active:scale-95 shimmer-btn"
          >
            <span>{user ? "Masuk Dashboard" : "Coba Gratis Sekarang"}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-16 pb-24 px-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        
        {/* Left Column Info */}
        <div className="lg:col-span-6 space-y-8 text-left animate-slide-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-full text-brand text-xs font-extrabold animate-float-medium uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>AI-POWERED VIDEO CLIP GENERATOR</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
            Ubah Video Panjang <br />
            <span className="gradient-text-animated">
              Jadi Klip Shorts Viral
            </span>
          </h1>

          <p className="text-base text-slate-500 max-w-xl leading-relaxed font-semibold">
            Gunakan kekuatan kecerdasan buatan untuk mengekstrak bagian paling menarik dari video YouTube, podcast, atau file mp4 Anda. Tambahkan subtitle keren, reframe otomatis ke 9:16, dan unduh secara instan!
          </p>

          {/* Bullet Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle className="w-4.5 h-4.5 text-brand" />
              <span>Smart Scene Detection</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle className="w-4.5 h-4.5 text-brand" />
              <span>Subtitle Running Karaoke</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle className="w-4.5 h-4.5 text-brand" />
              <span>Reframe Portrait 9:16</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <CheckCircle className="w-4.5 h-4.5 text-brand" />
              <span>FFmpeg Cloud Fast-Cutting</span>
            </div>
          </div>

          {/* Input Box Mockup for conversion & CTA */}
          <div className="p-2.5 bg-white rounded-3xl shadow-xl flex flex-col sm:flex-row items-center gap-2 max-w-xl">
            <div className="flex-1 w-full px-3 py-2 flex items-center gap-2">
              <Video className="w-4.5 h-4.5 text-brand shrink-0" />
              <input 
                type="text"
                value={typedText}
                readOnly
                placeholder="Tempel link video YouTube Anda di sini..."
                className="w-full bg-transparent text-xs font-bold font-mono outline-none text-slate-800"
              />
              <span className="w-1 h-4 bg-brand animate-pulse"></span>
            </div>
            <Link
              href={user ? "/dashboard" : "/login"}
              className="w-full sm:w-auto px-6 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2.5 transition-all shadow-lg shadow-brand/20 whitespace-nowrap active:scale-95"
            >
              <span>Mulai Potong Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand" />
              Proses Kurang Dari 2 Menit
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              4.9/5 Rating Kreator Konten
            </span>
          </div>
        </div>

        {/* Right Column: Dynamic Interactive AI Workspace Simulator */}
        <div className="lg:col-span-6 relative">
          
          {/* Decorative Floating Badges */}
          <div className="absolute -top-6 -left-6 bg-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 z-30 animate-float-medium">
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Deteksi AI</p>
              <h4 className="text-xs font-bold text-slate-900">Viral Moment 99%</h4>
            </div>
          </div>

          <div className="absolute -bottom-6 -right-4 bg-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 z-30 animate-float-slow">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Flame className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Potensi Trafik</p>
              <h4 className="text-xs font-bold text-slate-900">FYP Boosting Actived</h4>
            </div>
          </div>

          {/* Interactive Workspace Card */}
          <div className="w-full bg-white p-4.5 rounded-[32px] shadow-2xl relative z-10 overflow-hidden">
            
            {/* Header Workspace */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <div className="flex items-center gap-2">
                {/* Aspect selector */}
                <button 
                  onClick={() => setVideoAspect("916")}
                  className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all ${
                    videoAspect === "916" ? "bg-brand/10 text-brand border border-brand/20" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Portrait (9:16)
                </button>
                <button 
                  onClick={() => setVideoAspect("169")}
                  className={`px-2.5 py-1 text-[9px] font-extrabold rounded-lg transition-all ${
                    videoAspect === "169" ? "bg-brand/10 text-brand border border-brand/20" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Original (16:9)
                </button>
              </div>
            </div>

            {/* Split Simulator Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Left Side: Video Preview Container */}
              <div className="md:col-span-7 bg-slate-950 rounded-2xl aspect-[9/16] relative overflow-hidden flex items-center justify-center shadow-inner group border border-slate-900 transition-all duration-500">
                
                {/* Simulated original landscape clip or portrait crop */}
                <img 
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600" 
                  alt="Video content preview"
                  className={`absolute inset-0 w-full h-full transition-all duration-500 ${
                    videoAspect === "916" ? "object-cover scale-110" : "object-contain scale-100"
                  }`}
                />
                
                {/* Black blur overlay sides if landscape is active */}
                {videoAspect === "169" && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-5 flex items-center justify-center">
                    <img 
                      src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600" 
                      alt="Center focus"
                      className="w-full h-auto object-contain border-y border-white/10"
                    />
                  </div>
                )}

                {/* Subtitle styles simulator */}
                <div className="absolute bottom-10 left-3 right-3 z-20 text-center font-sans tracking-wide">
                  {captionStyle === "yellow-dark" && (
                    <span className="inline-block px-3 py-2 bg-slate-950/95 border border-brand/40 text-yellow-400 text-[11px] font-extrabold rounded-xl shadow-lg leading-relaxed">
                      "Ini adalah momen paling <span className="text-brand-accent underline underline-offset-2">PENTING</span> untuk kesuksesan Anda!"
                    </span>
                  )}
                  {captionStyle === "brand-light" && (
                    <span className="inline-block px-4 py-2 bg-brand text-white text-[11px] font-black rounded-lg shadow-xl uppercase tracking-wider">
                      ★ Momen Paling Penting! ★
                    </span>
                  )}
                  {captionStyle === "simple-white" && (
                    <span className="inline-block px-3 py-1.5 bg-black/80 text-white text-[11px] font-bold rounded-lg shadow">
                      "Ini adalah momen paling penting untuk kesuksesan..."
                    </span>
                  )}
                </div>

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 z-20 bg-black/75 px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand animate-ping"></span>
                  <span className="text-[8px] font-black text-slate-100 uppercase tracking-widest">
                    {videoAspect === "916" ? "Shorts Mode" : "Original Mode"}
                  </span>
                </div>
              </div>

              {/* Right Side: Control Panels & Customizer */}
              <div className="md:col-span-5 space-y-4 text-left flex flex-col justify-between">
                
                {/* Language Select Mock */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block">1. Pilih Bahasa Transkrip</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setSelectedLanguage("id")}
                      className={`px-3 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border ${
                        selectedLanguage === "id" ? "bg-brand/10 border-brand/35 text-brand font-black" : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      🇮🇩 Indonesia
                    </button>
                    <button 
                      onClick={() => setSelectedLanguage("en")}
                      className={`px-3 py-2 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border ${
                        selectedLanguage === "en" ? "bg-brand/10 border-brand/35 text-brand font-black" : "bg-slate-50 border-slate-200 text-slate-500"
                      }`}
                    >
                      🇺🇸 Inggris
                    </button>
                  </div>
                </div>

                {/* Caption Styles selector */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-extrabold text-slate-450 uppercase tracking-widest block">2. Desain Gaya Subtitle</label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setCaptionStyle("yellow-dark")}
                      className={`w-full p-2 text-left rounded-xl border text-[10px] font-bold transition-all flex items-center gap-2 ${
                        captionStyle === "yellow-dark" ? "bg-brand/5 border-brand text-brand font-extrabold" : "bg-slate-50 border-slate-200 text-slate-650"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-yellow-400 border border-slate-900 shrink-0"></span>
                      <span>Teal Highlight & Yellow text</span>
                    </button>
                    <button
                      onClick={() => setCaptionStyle("brand-light")}
                      className={`w-full p-2 text-left rounded-xl border text-[10px] font-bold transition-all flex items-center gap-2 ${
                        captionStyle === "brand-light" ? "bg-brand/5 border-brand text-brand font-extrabold" : "bg-slate-50 border-slate-200 text-slate-650"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-brand shrink-0"></span>
                      <span>All-Caps Brand Solid</span>
                    </button>
                    <button
                      onClick={() => setCaptionStyle("simple-white")}
                      className={`w-full p-2 text-left rounded-xl border text-[10px] font-bold transition-all flex items-center gap-2 ${
                        captionStyle === "simple-white" ? "bg-brand/5 border-brand text-brand font-extrabold" : "bg-slate-50 border-slate-200 text-slate-650"
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded bg-white border border-slate-200 shrink-0"></span>
                      <span>Minimalist Simple White</span>
                    </button>
                  </div>
                </div>

                {/* Action CTA mock */}
                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href={user ? "/dashboard" : "/login"}
                    className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-brand/20 active:scale-95 transition-all shimmer-btn"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Klip Full HD</span>
                  </Link>
                  <p className="text-[8px] text-center text-slate-400 font-bold mt-2 uppercase tracking-wide">Instant render, No watermark trial</p>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* HORIZONTAL SHOWCASE: AI GENERATED SHORTS PREVIEW CAROUSEL */}
      <section className="py-20 bg-brand-light/20 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex items-end justify-between">
          <div className="text-left space-y-2">
            <span className="text-brand text-xs font-black uppercase tracking-widest bg-brand/10 px-3.5 py-1.5 rounded-full">Output Galeri</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Galeri Hasil Klip AI Shorts
            </h2>
            <p className="text-slate-500 font-semibold text-xs md:text-sm">
              Geser untuk melihat contoh video portrait 9:16 yang dihasilkan secara otomatis dengan visual subtitle karaoke oleh Clippers AI.
            </p>
          </div>
          
          {/* Scroll Navigation Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const el = document.getElementById("gallery-carousel")
                if (el) el.scrollBy({ left: -320, behavior: "smooth" })
              }}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand hover:border-brand flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById("gallery-carousel")
                if (el) el.scrollBy({ left: 320, behavior: "smooth" })
              }}
              className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 hover:text-brand hover:border-brand flex items-center justify-center transition-all shadow-sm active:scale-90 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Horizontal scrollbar block */}
        <div className="w-full relative px-6 md:px-12">
          <div 
            id="gallery-carousel"
            className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth pb-6 pt-2"
            style={{ scrollbarWidth: "none" }}
          >
            
            {/* Card 1: Breezy Sleek Intro Card */}
            <div className="w-[230px] md:w-[260px] aspect-[9/16] rounded-3xl bg-[#1c1210] border border-white/5 flex flex-col justify-between p-5 shrink-0 shadow-lg relative overflow-hidden group hover:scale-[1.02] hover:shadow-xl transition-all duration-350">
              <div className="absolute top-4 left-4 z-20 bg-white/10 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                <span className="text-[7.5px] font-black text-white uppercase tracking-wider">AI GENERATED</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center text-center px-2 pt-16">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-white tracking-wide">Breezy</h3>
                <p className="text-[9.5px] text-white/70 font-semibold mt-2 leading-relaxed">Be the agent who sees it first.</p>
              </div>
              <div className="flex items-center justify-between z-25 mt-auto">
                <span className="text-[9px] font-mono text-white/50 font-bold">www.breezy.com</span>
                <div className="w-7 h-7 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white/80 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Card 2: Podcast guy laughing */}
            <div className="w-[230px] md:w-[260px] aspect-[9/16] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shrink-0 shadow-lg group hover:scale-[1.02] hover:shadow-xl transition-all duration-350">
              <div className="absolute inset-0 z-5">
                <img 
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=300" 
                  alt="Podcast Short Clip" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
              </div>
              <div className="absolute top-4 left-4 z-20 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
                <span className="text-[7.5px] font-black text-white uppercase tracking-wider">AI GENERATED</span>
              </div>
              <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col justify-end h-full">
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1.5 bg-black/80 border border-brand/30 text-yellow-400 text-[10px] font-black rounded-xl leading-relaxed shadow-lg">
                    "So I had a <span className="text-white underline">setback</span>..."
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-[8px] font-bold bg-brand/20 border border-brand/30 text-brand-accent px-1.5 py-0.5 rounded font-mono">ID: 002</span>
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Kitchen interior */}
            <div className="w-[230px] md:w-[260px] aspect-[9/16] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shrink-0 shadow-lg group hover:scale-[1.02] hover:shadow-xl transition-all duration-350">
              <div className="absolute inset-0 z-5">
                <img 
                  src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=300" 
                  alt="Interior Design" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
              </div>
              <div className="absolute top-4 left-4 z-20 bg-[#03897b]/40 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
                <span className="text-[7.5px] font-black text-white uppercase tracking-wider">AI GENERATED</span>
              </div>
              <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col justify-end h-full">
                <div className="text-center mb-6">
                  <span className="inline-block px-3.5 py-2 bg-[#03897b] text-white text-[10px] font-black rounded-lg shadow-xl uppercase tracking-wider">
                    ★ Luxury Kitchen ★
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-[8px] font-bold bg-brand/20 border border-brand/30 text-brand-accent px-1.5 py-0.5 rounded font-mono">ID: 003</span>
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: Writing/Laptop screen */}
            <div className="w-[230px] md:w-[260px] aspect-[9/16] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shrink-0 shadow-lg group hover:scale-[1.02] hover:shadow-xl transition-all duration-350">
              <div className="absolute inset-0 z-5">
                <img 
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=300" 
                  alt="Writing on laptop" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
              </div>
              <div className="absolute top-4 left-4 z-20 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
                <span className="text-[7.5px] font-black text-white uppercase tracking-wider">AI GENERATED</span>
              </div>
              <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col justify-end h-full">
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1.5 bg-black/80 text-white text-[9.5px] font-bold rounded-lg shadow leading-relaxed">
                    "Writing custom 3D charms..."
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-[8px] font-bold bg-brand/20 border border-brand/30 text-brand-accent px-1.5 py-0.5 rounded font-mono">ID: 004</span>
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 5: Courtney doll */}
            <div className="w-[230px] md:w-[260px] aspect-[9/16] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shrink-0 shadow-lg group hover:scale-[1.02] hover:shadow-xl transition-all duration-350">
              <div className="absolute inset-0 z-5">
                <img 
                  src="https://images.unsplash.com/photo-1559251606-c623743a6d76?q=80&w=300" 
                  alt="Doll Short Video" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
              </div>
              <div className="absolute top-4 left-4 z-20 bg-[#03897b]/40 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
                <span className="text-[7.5px] font-black text-white uppercase tracking-wider">AI GENERATED</span>
              </div>
              <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col justify-end h-full">
                <div className="text-center mb-6">
                  <span className="inline-block px-4 py-1 bg-fuchsia-600 text-white text-[12px] font-black rounded-full shadow-lg tracking-wide uppercase border border-fuchsia-300">
                    Courtney 1986
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-[8px] font-bold bg-brand/20 border border-brand/30 text-brand-accent px-1.5 py-0.5 rounded font-mono">ID: 005</span>
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 6: 3D Charms */}
            <div className="w-[230px] md:w-[260px] aspect-[9/16] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shrink-0 shadow-lg group hover:scale-[1.02] hover:shadow-xl transition-all duration-350">
              <div className="absolute inset-0 z-5">
                <img 
                  src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=300" 
                  alt="3D Charms promo" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
              </div>
              <div className="absolute top-4 left-4 z-20 bg-white/15 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
                <span className="text-[7.5px] font-black text-white uppercase tracking-wider">AI GENERATED</span>
              </div>
              <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col justify-end h-full">
                <div className="text-center mb-6 space-y-2">
                  <div className="bg-lime-400 text-black text-[9px] font-black px-2 py-0.5 rounded inline-block">in a day</div>
                  <span className="block text-white text-[10px] font-black tracking-wide leading-relaxed drop-shadow-md">
                    TRY MESHY FREE → MESHY.AI
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-[8px] font-bold bg-brand/20 border border-brand/30 text-brand-accent px-1.5 py-0.5 rounded font-mono">ID: 006</span>
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 7: Woman speaking on mic */}
            <div className="w-[230px] md:w-[260px] aspect-[9/16] rounded-3xl bg-slate-900 border border-slate-800 relative overflow-hidden shrink-0 shadow-lg group hover:scale-[1.02] hover:shadow-xl transition-all duration-350">
              <div className="absolute inset-0 z-5">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300" 
                  alt="Speaker video" 
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"></div>
              </div>
              <div className="absolute top-4 left-4 z-20 bg-[#03897b]/40 backdrop-blur-md px-2.5 py-0.5 rounded border border-white/10">
                <span className="text-[7.5px] font-black text-white uppercase tracking-wider">AI GENERATED</span>
              </div>
              <div className="absolute bottom-5 left-4 right-4 z-20 flex flex-col justify-end h-full">
                <div className="text-center mb-6">
                  <span className="inline-block px-3 py-1.5 bg-black/90 text-yellow-400 border-2 border-white/30 text-[10.5px] font-black tracking-widest uppercase rounded shadow-lg">
                    A DECISION...
                  </span>
                </div>
                <div className="flex items-center justify-between text-white/90">
                  <span className="text-[8px] font-bold bg-brand/20 border border-brand/30 text-brand-accent px-1.5 py-0.5 rounded font-mono">ID: 007</span>
                  <div className="w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION (CREATIFY INSPIRED) */}
      <section className="py-24 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-brand text-xs font-extrabold uppercase tracking-widest bg-brand/10 px-3.5 py-1.5 rounded-full">Proses Cerdas</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
              Bagaimana Clippers Mengubah Video Anda?
            </h2>
            <p className="text-slate-500 font-semibold max-w-xl mx-auto text-sm">
              Sederhanakan alur kerja pengeditan video Anda ke dalam 3 tahapan otomatis tanpa memerlukan keahlian teknis sedikit pun.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="p-8 bg-slate-50 rounded-[32px] transition-all duration-300 group hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-6xl font-black text-brand/5 absolute top-4 right-6 group-hover:text-brand/10 transition-all">01</span>
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg mb-6 shadow-inner">
                  01
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-3 group-hover:text-brand transition-colors">Tempel Link YouTube / Upload Video</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Cukup salin tautan video YouTube apa saja atau unggah file MP4 Anda langsung ke dashboard. AI Clippers langsung membaca informasi video dalam hitungan milidetik.
                </p>
              </div>
              <div className="mt-8 border-t border-slate-200/50 pt-4 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                <span>Input Sumber</span>
                <span className="text-brand">Auto Read</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 bg-slate-50 rounded-[32px] transition-all duration-300 group hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-6xl font-black text-brand/5 absolute top-4 right-6 group-hover:text-brand/10 transition-all">02</span>
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg mb-6 shadow-inner">
                  02
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-3 group-hover:text-brand transition-colors">AI Transkripsi & Deteksi Momen</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Model faster-whisper AI kami mengekstrak dialog audio secara presisi menjadi teks. AI kami secara otomatis menyusun timeline subtitle per kata agar sinkron sempurna.
                </p>
              </div>
              <div className="mt-8 border-t border-slate-200/50 pt-4 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                <span>Proses Inti</span>
                <span className="text-brand">Whisper Model</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 bg-slate-50 rounded-[32px] transition-all duration-300 group hover:shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <span className="text-6xl font-black text-brand/5 absolute top-4 right-6 group-hover:text-brand/10 transition-all">03</span>
                <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-black text-lg mb-6 shadow-inner">
                  03
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-3 group-hover:text-brand transition-colors">Potong, Kustomisasi & Unduh</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  Pilih durasi potong Shorts (preset 15s / 30s), sesuaikan warna subtitle running pilihan Anda, lalu klik cut. Video Shorts Anda siap diunduh berformat Full HD!
                </p>
              </div>
              <div className="mt-8 border-t border-slate-200/50 pt-4 flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                <span>Output Klip</span>
                <span className="text-brand">FFmpeg Lossless</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DYNAMIC USE-CASES TABBED SHOWCASE */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-brand text-xs font-extrabold uppercase tracking-widest bg-brand/10 px-3.5 py-1.5 rounded-full">Sesuai Kebutuhan</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
              Satu Solusi Untuk Seluruh Kreator Konten
            </h2>
            <p className="text-slate-500 font-semibold max-w-xl mx-auto text-sm">
              Maksimalkan performa fyp konten video Anda di platform mana saja dengan template optimal kami.
            </p>

            {/* Tabs Selector */}
            <div className="flex justify-center gap-2.5 mt-8 border border-brand-soft bg-white/80 p-2 rounded-2xl max-w-md mx-auto shadow-sm">
              <button
                onClick={() => setActiveTab("podcast")}
                className={`flex-1 py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${
                  activeTab === "podcast" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-400 hover:text-slate-800"
                }`}
              >
                Podcast
              </button>
              <button
                onClick={() => setActiveTab("ecommerce")}
                className={`flex-1 py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${
                  activeTab === "ecommerce" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-400 hover:text-slate-800"
                }`}
              >
                Produk
              </button>
              <button
                onClick={() => setActiveTab("education")}
                className={`flex-1 py-2.5 text-[11px] font-black uppercase rounded-xl transition-all ${
                  activeTab === "education" ? "bg-brand text-white shadow-md shadow-brand/20" : "text-slate-400 hover:text-slate-800"
                }`}
              >
                Edukasi
              </button>
            </div>
          </div>

          {/* Active Tab Content Card */}
          <div className="bg-white rounded-[32px] p-6 md:p-10 shadow-xl max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Left Content text */}
            <div className="md:col-span-6 space-y-6 text-left">
              <span className="text-[10px] bg-brand/10 text-brand px-3 py-1 rounded-full font-black uppercase tracking-wider">
                {useCases[activeTab as keyof typeof useCases].tag}
              </span>
              <h3 className="text-2xl md:text-3.5xl font-extrabold text-slate-900 tracking-tight">
                {useCases[activeTab as keyof typeof useCases].title}
              </h3>
              <p className="text-sm font-semibold text-slate-500 italic leading-relaxed">
                "{useCases[activeTab as keyof typeof useCases].quote}"
              </p>

              <div className="space-y-3.5 pt-4 border-t border-slate-100 text-xs font-bold text-slate-650">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-brand shrink-0" />
                  <span>Meningkatkan retensi penonton hingga 85% dengan visual running text</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-brand shrink-0" />
                  <span>Didesain siap upload langsung ke TikTok, Reels, & Shorts</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4.5 h-4.5 text-brand shrink-0" />
                  <span>Ekspor metadata subtitle VTT/SRT untuk aksesibilitas SEO</span>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  href={user ? "/dashboard" : "/login"}
                  className="inline-flex items-center gap-2 px-5 py-3.5 bg-brand hover:bg-brand-dark text-white rounded-2xl text-xs font-extrabold shadow transition-all active:scale-95"
                >
                  <span>Coba Template Sekarang</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Content Graphic */}
            <div className="md:col-span-6">
              <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden relative border border-slate-200 shadow-md">
                <img 
                  src={useCases[activeTab as keyof typeof useCases].image} 
                  alt={useCases[activeTab as keyof typeof useCases].title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur rounded-2xl border border-brand-soft/40 shadow flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </div>
                    <div>
                      <p className="text-[8px] text-slate-400 font-extrabold uppercase tracking-wider font-sans">Template Siap Pakai</p>
                      <h5 className="text-[11px] font-extrabold text-slate-900">Format FYP Optimization</h5>
                    </div>
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
                    9:16 Ready
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CORE VALUE FEATURES GRID */}
      <section className="py-24 bg-brand-light/30 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-brand text-xs font-extrabold uppercase tracking-widest bg-brand/10 px-3.5 py-1.5 rounded-full">Fitur Premium</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
              Segudang Fitur Untuk Video Viral Anda
            </h2>
            <p className="text-slate-500 font-semibold max-w-xl mx-auto text-sm">
              Semua perkakas canggih yang Anda butuhkan untuk mendominasi algoritma video vertikal dalam satu platform terpadu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="bg-white p-8 rounded-[28px] shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-brand mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-brand" />
                  </div>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-3 inline-block">
                    {feature.badge}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mb-3 group-hover:text-brand transition-colors">{feature.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / TESTIMONIALS SECTION */}
      <section className="py-24 relative overflow-hidden z-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="text-brand text-xs font-extrabold uppercase tracking-widest bg-brand/10 px-3.5 py-1.5 rounded-full">Testimoni Kreator</span>
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-5xl tracking-tight">
              Dipercaya Oleh Ratusan Video Editor & Kreator
            </h2>
            <p className="text-slate-500 font-semibold max-w-xl mx-auto text-sm">
              Temukan bagaimana Clippers AI memangkas waktu kerja dan melipatgandakan performa tayangan konten mereka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testi, i) => (
              <div 
                key={i} 
                className="bg-slate-50/70 p-8 rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-xl transition-all hover:bg-white"
              >
                <div className="space-y-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-xs font-bold text-slate-650 leading-relaxed italic">
                    "{testi.text}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-6">
                  <img 
                    src={testi.image} 
                    alt={testi.name} 
                    className="w-10 h-10 rounded-full border-2 border-brand object-cover bg-brand/10 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{testi.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BIG CTA BANNER (HIGH IMPACT) */}
      <section className="py-24 bg-brand text-white text-center relative overflow-hidden z-10 shadow-inner">
        <div className="absolute inset-0 bg-brand-dark/20 mix-blend-overlay"></div>
        
        {/* Floating background shape details */}
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-brand-accent/20 blur-xl"></div>
        <div className="absolute -bottom-10 -right-10 w-44 h-44 rounded-full bg-brand-soft/20 blur-xl"></div>

        <div className="max-w-4xl mx-auto px-6 relative space-y-8">
          <div className="w-14 h-14 rounded-3xl bg-white/10 flex items-center justify-center text-white mx-auto border border-white/20 shadow animate-float-medium">
            <Scissors className="w-7 h-7" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
            Siap Melipatgandakan <br className="hidden sm:block"/> Viewers Video Shorts Anda?
          </h2>
          <p className="text-brand-light/80 max-w-xl mx-auto text-xs md:text-sm font-bold">
            Bergabunglah dengan ratusan kreator sukses lainnya yang sudah menghemat ratusan jam waktu pengeditan video. Coba secara gratis hari ini.
          </p>

          <div className="pt-2">
            <Link
              href={user ? "/dashboard" : "/login"}
              className="inline-flex items-center gap-2.5 bg-white text-brand hover:bg-slate-50 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-dark/30 transition-all duration-300 active:scale-95 hover:shadow-white/10"
            >
              <span>Buat Video Shorts Pertama Anda</span>
              <ArrowUpRight className="w-4.5 h-4.5 text-brand" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-6 text-[10px] font-black tracking-widest text-brand-light/60 uppercase">
            <span>✓ No credit card required</span>
            <span>✓ Loss-less FFmpeg cutting</span>
            <span>✓ 99% whisper accuracy</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 bg-white text-slate-500 text-xs font-semibold relative z-10 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow shadow-brand/20">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 text-sm">CLIPPERS AI</span>
              <p className="text-[8px] text-brand uppercase font-bold tracking-wider">Video Clip Generator</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-bold">© 2026 Clippers AI. Powered by high-performance FFmpeg & Whisper AI. All rights reserved.</p>
          <div className="flex gap-4.5 text-[11px] font-bold text-slate-400">
            <a href="#" className="hover:text-brand transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand transition-colors flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> Hubungi Dukungan</a>
          </div>
        </div>
      </footer>

    </div>
  )
}
