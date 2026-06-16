"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Scissors, ArrowLeft, Calendar, Eye, Tag, ArrowRight, Heart, Mail, Phone, MapPin } from "lucide-react"
import { useAuth } from "@/providers/AuthProvider"
import LoginModal from "@/components/LoginModal"

export default function BlogListingPage() {
  const { user } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"login" | "register">("login")
  const [contactState, setContactState] = useState<any>({
    contactEmail: "support@gayadigital.com",
    contactPhone: "+62 812-3456-7890",
    contactLocation: "Gaya Digital Tower, Lantai 12, Jakarta, Indonesia"
  })

  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  useEffect(() => {
    fetch("http://localhost:8080/api/blog")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPosts(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error("Failed to fetch blog posts", err)
        setLoading(false)
      })

    fetch("http://localhost:8080/api/contact-settings")
      .then(res => res.json())
      .then(data => {
        if (data) setContactState(data)
      })
      .catch(err => console.warn("Failed to load contact settings in blog listing footer", err))
  }, [])

  const categories = ["All", "AI & Tech", "Video Editing", "Content Creation", "Social Media Marketing"]

  const filteredPosts = selectedCategory === "All"
    ? posts
    : posts.filter(post => post.category === selectedCategory)

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
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12 md:py-16 relative z-10">
        
        {/* Banner Section */}
        <div className="relative bg-gradient-to-r from-[#025a50] to-[#01423a] text-white rounded-3xl p-8 md:p-12 shadow-xl overflow-hidden mb-12 border border-emerald-900/50">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-white/10 text-emerald-300 border border-white/5 tracking-wider mb-4">
            Kumpulan Artikel & Edukasi
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
            Blog Clippers AI
          </h1>
          <p className="text-xs md:text-sm text-slate-300 font-semibold mt-4 max-w-2xl leading-relaxed">
            Temukan tips praktis, panduan mengedit video pendek, trik algoritma media sosial, dan tren terbaru seputar pembuatan konten digital.
          </p>
        </div>

        {/* Categories Tabs Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar" style={{ scrollbarWidth: "none" }}>
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                selectedCategory === cat
                  ? "bg-brand border-brand text-white shadow-md shadow-brand/20"
                  : "bg-white border-slate-200 text-slate-600 hover:border-brand/40"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-brand rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Artikel...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-24 text-center bg-white border border-slate-200 rounded-[32px] p-10">
            <p className="text-slate-400 font-bold text-sm">Tidak ada artikel di kategori ini.</p>
          </div>
        ) : (
          /* Blog Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article 
                key={post.id}
                className="bg-white border border-slate-200/80 rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 group"
              >
                <div>
                  {/* Blog Image */}
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative border-b border-slate-100">
                    <img 
                      src={post.image || "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400"} 
                      alt={post.title} 
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    <span className="absolute top-4 left-4 bg-brand/90 backdrop-blur text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
                      {post.category}
                    </span>
                  </div>

                  {/* Blog content preview */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(post.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {post.views || 0} Kali Dilihat
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-brand transition-colors min-h-[48px] line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-xs text-slate-550 line-clamp-3 leading-relaxed font-semibold">
                      {post.content}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.split(",").slice(0, 3).map((tag: string, tIdx: number) => (
                        <span key={tIdx} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-50 border border-slate-200/60 text-[9px] font-bold text-slate-500">
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author & Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6.5 h-6.5 rounded-full bg-brand/10 text-brand flex items-center justify-center font-extrabold text-[9px] border border-brand/20">
                        {post.authorName ? post.authorName.charAt(0) : "A"}
                      </div>
                      <span className="text-[10px] font-black text-slate-700">{post.authorName || "GDVideo Admin"}</span>
                    </div>
                    
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-[10px] font-black text-brand group-hover:text-brand-dark transition-colors"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>

              </article>
            ))}
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
