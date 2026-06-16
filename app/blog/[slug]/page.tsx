"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Scissors, ArrowLeft, Calendar, Eye, Tag, Clock, Share2, MessageSquare, ArrowRight, Heart, Mail, Phone, MapPin } from "lucide-react"
import { useAuth } from "@/providers/AuthProvider"
import LoginModal from "@/components/LoginModal"

export default function BlogDetailPage() {
  const { user } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"login" | "register">("login")
  const [contactState, setContactState] = useState<any>({
    contactEmail: "support@gayadigital.com",
    contactPhone: "+62 812-3456-7890",
    contactLocation: "Gaya Digital Tower, Lantai 12, Jakarta, Indonesia"
  })

  useEffect(() => {
    fetch("http://localhost:8080/api/contact-settings")
      .then(res => res.json())
      .then(data => {
        if (data) setContactState(data)
      })
      .catch(err => console.warn("Failed to load contact settings in blog detail footer", err))
  }, [])

  const params = useParams()
  const router = useRouter()
  const slug = params.slug

  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [latestPosts, setLatestPosts] = useState<any[]>([])

  useEffect(() => {
    if (!slug) return

    // 1. Fetch current blog post
    fetch(`http://localhost:8080/api/blog/${slug}`)
      .then(res => {
        if (!res.ok) {
          throw new Error("Artikel tidak ditemukan")
        }
        return res.json()
      })
      .then(data => {
        setPost(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError(err.message || "Gagal memuat artikel")
        setLoading(false)
      })

    // 2. Fetch other recommendations
    fetch("http://localhost:8080/api/blog")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Filter out current post
          const filtered = data.filter(p => p.slug !== slug).slice(0, 3)
          setLatestPosts(filtered)
        }
      })
      .catch(err => console.error("Failed to fetch recommendations", err))

  }, [slug])

  // Simple reading time estimator (e.g. 200 words per minute)
  const estimateReadingTime = (text: string) => {
    if (!text) return 1
    const words = text.trim().split(/\s+/).length
    const time = Math.ceil(words / 200)
    return time
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      
      {/* Background decoration blur items */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between bg-white border-b border-slate-200/80 sticky top-0 z-45 shadow-sm">
        <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
          <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/35">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-wider flex items-center gap-1.5">
              <span>CLIPPERS</span>
              <span className="text-[9px] bg-brand/10 text-brand px-1.5 py-0.5 rounded-lg font-mono font-bold">AI</span>
            </h1>
            <p className="text-[9px] text-brand font-semibold tracking-widest uppercase">Video Clip Generator</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
          <Link href="/" className="hover:text-brand transition-colors">Beranda</Link>
          <Link href="/blog" className="hover:text-brand transition-colors text-brand">Blog</Link>
          <Link href="/billing" className="hover:text-brand transition-colors">Harga</Link>
          <Link href="/contact" className="hover:text-brand transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/dashboard"
                className="text-xs font-bold text-slate-500 hover:text-brand transition-colors mr-2 hidden sm:block"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-extrabold transition-all shadow-lg shadow-brand/20 flex items-center gap-2 active:scale-95 shimmer-btn"
              >
                <span>Masuk Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setModalMode("login")
                  setIsLoginModalOpen(true)
                }}
                className="text-xs font-bold text-slate-755 hover:text-brand transition-colors cursor-pointer mr-2"
              >
                Masuk
              </button>
              <button
                onClick={() => {
                  setModalMode("register")
                  setIsLoginModalOpen(true)
                }}
                className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-dark text-white text-xs font-extrabold transition-all shadow-lg shadow-brand/20 flex items-center gap-2 active:scale-95 shimmer-btn cursor-pointer"
              >
                <span>Daftar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-grow max-w-5xl mx-auto w-full px-6 py-10 md:py-14 relative z-10">
        
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-brand rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Isi Artikel...</p>
          </div>
        ) : error || !post ? (
          <div className="py-24 text-center bg-white border border-slate-200 rounded-[32px] p-10 space-y-4">
            <p className="text-rose-500 font-bold text-sm">{error || "Artikel tidak ditemukan"}</p>
            <button 
              onClick={() => router.push("/blog")}
              className="px-5 py-2.5 bg-brand text-white font-bold rounded-xl text-xs"
            >
              Kembali ke Halaman Blog
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left/Main Column: Post Detail */}
            <article className="lg:col-span-8 bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm p-6 md:p-10 space-y-6">
              
              {/* Category & Date */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-brand/10 text-brand text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  {post.category}
                </span>
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
                <span className="text-slate-400 text-xs font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {estimateReadingTime(post.content)} Menit Baca
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2.5xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
                {post.title}
              </h1>

              {/* Author Info */}
              <div className="flex items-center justify-between py-4 border-y border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-xs border border-brand/20">
                    {post.authorName ? post.authorName.charAt(0) : "A"}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">{post.authorName || "GDVideo Admin"}</h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Official Publisher</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-slate-450 text-xs font-semibold">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    {post.views || 0} Dilihat
                  </span>
                </div>
              </div>

              {/* Cover Image */}
              <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/50 shadow-inner">
                <img 
                  src={post.image || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600"} 
                  alt={post.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Content body */}
              <div className="text-slate-700 text-sm md:text-base leading-relaxed space-y-6 pt-4 font-medium whitespace-pre-line">
                {post.content}
              </div>

              {/* Footer Tags */}
              {post.tags && (
                <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-2 items-center">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest mr-1">Tags:</span>
                  {post.tags.split(",").map((tag: string, idx: number) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-bold text-slate-650"
                    >
                      <Tag className="w-3.5 h-3.5 text-slate-450" />
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              )}

            </article>

            {/* Right Column: Recommendations */}
            <aside className="lg:col-span-4 space-y-6">
              
              {/* Author Box */}
              <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-sm text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center font-black text-lg mx-auto border border-brand/20">
                  GD
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">PT Gaya Digital</h3>
                  <p className="text-[10px] text-brand font-black uppercase tracking-wider mt-0.5">Author Group</p>
                </div>
                <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                  Kami mempublikasikan wawasan industri, tips marketing video, dan pembaruan produk secara berkala untuk mendukung pertumbuhan kreator Indonesia.
                </p>
              </div>

              {/* Latest articles card */}
              <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 shadow-sm space-y-5">
                <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                  Artikel Lainnya
                </h3>

                <div className="space-y-4.5">
                  {latestPosts.map((lat) => (
                    <Link 
                      key={lat.id}
                      href={`/blog/${lat.slug}`}
                      className="flex gap-3 group hover:opacity-95 block"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                        <img 
                          src={lat.image} 
                          alt={lat.title} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        />
                      </div>
                      <div className="text-left space-y-1">
                        <h4 className="text-xs font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-brand transition-colors">
                          {lat.title}
                        </h4>
                        <span className="text-[9px] font-black text-brand uppercase tracking-wider">
                          {lat.category}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

            </aside>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="py-20 bg-white relative z-10 border-t border-slate-200/80 text-slate-500 text-xs font-semibold">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 md:gap-12 mb-16">
            
            {/* Column 1: Brand details */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/25">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-extrabold text-slate-900 text-base tracking-wider">CLIPPERS AI</span>
                  <p className="text-[9px] text-brand uppercase font-bold tracking-wider">Video Clip Generator</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-sm">
                Solusi cerdas pengeditan klip video otomatis bertenaga FFmpeg & kecerdasan buatan Whisper AI. Ubah konten panjang Anda menjadi klip Shorts, Reels, dan TikTok viral dalam hitungan menit.
              </p>
            </div>

            {/* Column 2: Navigation Links */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Navigasi</h4>
              <ul className="space-y-2.5">
                <li><Link href="/" className="hover:text-brand transition-colors text-slate-500 font-semibold">Beranda</Link></li>
                <li><Link href="/blog" className="hover:text-brand transition-colors text-slate-500 font-semibold">Blog Edukasi</Link></li>
                <li><Link href="/billing" className="hover:text-brand transition-colors text-slate-500 font-semibold">Harga Paket</Link></li>
                <li><Link href="/contact" className="hover:text-brand transition-colors text-slate-500 font-semibold">Kontak Kami</Link></li>
              </ul>
            </div>

            {/* Column 3: Legal & Support */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Kebijakan</h4>
              <ul className="space-y-2.5">
                <li><Link href="/terms" className="hover:text-brand transition-colors text-slate-500 font-semibold">Syarat Ketentuan</Link></li>
                <li><Link href="/privacy" className="hover:text-brand transition-colors text-slate-500 font-semibold">Kebijakan Privasi</Link></li>
                <li><Link href="/contact" className="hover:text-brand transition-colors text-slate-500 font-semibold flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-500 fill-current" /> Hubungi Dukungan</Link></li>
              </ul>
            </div>

            {/* Column 4: Contact Summary */}
            <div className="lg:col-span-4 space-y-4 text-left">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Informasi Kontak</h4>
              <ul className="space-y-3 text-slate-500 font-semibold">
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="break-all">{contactState.contactEmail}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{contactState.contactPhone}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-normal">{contactState.contactLocation}</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom copyright and credentials */}
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-bold">
            <p>© 2026 Clippers AI. Semua Hak Dilindungi Undang-Undang.</p>
            <p className="flex items-center gap-1 text-[10px]">
              Powered by high-performance FFmpeg & Whisper AI. PT Gaya Digital Globalindo.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)} 
        initialMode={modalMode} 
      />
    </div>
  )
}
