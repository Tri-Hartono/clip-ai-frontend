"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Scissors, ArrowLeft, Mail, Phone, MapPin, Send, Check, ArrowRight, Heart } from "lucide-react"
import { useAuth } from "@/providers/AuthProvider"
import LoginModal from "@/components/LoginModal"

export default function ContactPage() {
	const { user } = useAuth()
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState<"login" | "register">("login")

	const [contact, setContact] = useState({
		contactEmail: "support@gayadigital.com",
		contactPhone: "+62 812-3456-7890",
		contactLocation: "Gaya Digital Tower, Lantai 12, Jakarta, Indonesia",
		contactMapsIframe: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2952408365697!2d106.82025187498048!3d-6.224741360960548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f3f4c6e9be11%3A0x6b1076f82794c4be!2sSampoerna%20Strategic%20Square!5e0!3m2!1sid!2sid!4v1718471234567!5m2!1sid!2sid",
	})
	const [loading, setLoading] = useState(true)
	const [messageSent, setMessageSent] = useState(false)
	const [sending, setSending] = useState(false)

	useEffect(() => {
		fetch("http://localhost:8080/api/contact-settings")
			.then(res => {
				if (!res.ok) throw new Error("Gagal mengambil data kontak")
				return res.json()
			})
			.then(data => {
				if (data) {
					setContact({
						contactEmail: data.contactEmail || "support@gayadigital.com",
						contactPhone: data.contactPhone || "+62 812-3456-7890",
						contactLocation: data.contactLocation || "Gaya Digital Tower, Lantai 12, Jakarta, Indonesia",
						contactMapsIframe: data.contactMapsIframe || "",
					})
				}
				setLoading(false)
			})
			.catch(err => {
				console.error(err)
				setLoading(false)
			})
	}, [])

	// Helper to extract iframe src URL securely if admin pastes full <iframe> tag
	const getMapSrc = (input: string) => {
		if (!input) return ""
		if (input.includes("src=")) {
			const match = input.match(/src="([^"]+)"/)
			return match ? match[1] : ""
		}
		return input
	}

	const handleSendMessage = (e: React.FormEvent) => {
		e.preventDefault()
		setSending(true)
		setTimeout(() => {
			setSending(false)
			setMessageSent(true)
			const form = e.target as HTMLFormElement
			form.reset()
			setTimeout(() => setMessageSent(false), 5000)
		}, 1000)
	}

	const mapSrc = getMapSrc(contact.contactMapsIframe)

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
					<Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
					<Link href="/billing" className="hover:text-brand transition-colors">Harga</Link>
					<Link href="/contact" className="hover:text-brand transition-colors text-brand">Contact</Link>
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
								className="text-xs font-bold text-slate-750 hover:text-brand transition-colors cursor-pointer mr-2"
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
						Hubungi Tim Kami
					</span>
					<h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">
						Kontak & Lokasi
					</h1>
					<p className="text-xs md:text-sm text-slate-300 font-semibold mt-4 max-w-2xl leading-relaxed">
						Punya pertanyaan atau butuh bantuan teknis? Hubungi kami langsung via email, telepon, atau isi form pesan di bawah ini.
					</p>
				</div>

				{loading ? (
					<div className="py-24 flex flex-col items-center justify-center gap-3">
						<div className="w-10 h-10 border-4 border-slate-200 border-t-brand rounded-full animate-spin"></div>
						<p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Informasi...</p>
					</div>
				) : (
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
						
						{/* Left Column: Contact Cards & Info */}
						<div className="lg:col-span-5 flex flex-col justify-between gap-6">
							
							<div className="bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm space-y-6 flex-1 flex flex-col justify-center">
								
								<div className="flex gap-4 items-start">
									<div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
										<Mail className="w-5.5 h-5.5" />
									</div>
									<div>
										<h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Email Resmi</h4>
										<p className="text-xs md:text-sm text-slate-600 font-semibold mt-1.5 break-all">{contact.contactEmail}</p>
										<p className="text-[10px] text-slate-400 mt-1 font-bold">Kirim email kapan saja, kami akan merespon segera.</p>
									</div>
								</div>

								<div className="flex gap-4 items-start border-t border-slate-100 pt-6">
									<div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
										<Phone className="w-5.5 h-5.5" />
									</div>
									<div>
										<h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Nomor Telepon / WhatsApp</h4>
										<p className="text-xs md:text-sm text-slate-600 font-semibold mt-1.5">{contact.contactPhone}</p>
										<p className="text-[10px] text-slate-400 mt-1 font-bold">Tersedia pada hari kerja (Senin - Jumat 09:00 - 18:00 WIB).</p>
									</div>
								</div>

								<div className="flex gap-4 items-start border-t border-slate-100 pt-6">
									<div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
										<MapPin className="w-5.5 h-5.5" />
									</div>
									<div>
										<h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">Alamat Kantor</h4>
										<p className="text-xs md:text-sm text-slate-600 font-semibold mt-1.5 leading-relaxed">{contact.contactLocation}</p>
										<p className="text-[10px] text-slate-400 mt-1 font-bold">PT Gaya Digital Globalindo.</p>
									</div>
								</div>

							</div>

						</div>

						{/* Right Column: Messages Form */}
						<div className="lg:col-span-7 bg-white border border-slate-200/80 p-8 rounded-3xl shadow-sm">
							<h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-wider">Kirim Pesan Langsung</h3>
							
							{messageSent ? (
								<div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-6 text-center space-y-3 animate-in fade-in zoom-in-95">
									<div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow shadow-emerald-500/20">
										<Check className="w-6 h-6" />
									</div>
									<h4 className="text-sm font-black text-emerald-800">Pesan Berhasil Terkirim!</h4>
									<p className="text-xs text-emerald-600 font-semibold max-w-sm mx-auto leading-relaxed">
										Terima kasih atas pesan Anda. Customer support kami akan meninjau dan merespon pesan Anda melalui email secepatnya.
									</p>
								</div>
							) : (
								<form onSubmit={handleSendMessage} className="space-y-4">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										<div>
											<label className="block text-[10px] font-bold text-slate-400 mb-1">NAMA LENGKAP</label>
											<input 
												type="text" 
												required
												placeholder="e.g. Budi Santoso"
												className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-xs font-semibold outline-none transition-all"
											/>
										</div>
										<div>
											<label className="block text-[10px] font-bold text-slate-400 mb-1">ALAMAT EMAIL</label>
											<input 
												type="email" 
												required
												placeholder="e.g. budi@gmail.com"
												className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-xs font-semibold outline-none transition-all"
											/>
										</div>
									</div>

									<div>
										<label className="block text-[10px] font-bold text-slate-400 mb-1">SUBJEK PESAN</label>
										<input 
											type="text" 
											required
											placeholder="e.g. Pertanyaan Harga Kemitraan atau Akun"
											className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-xs font-semibold outline-none transition-all"
										/>
									</div>

									<div>
										<label className="block text-[10px] font-bold text-slate-400 mb-1">PESAN / PERTANYAAN ANDA</label>
										<textarea 
											rows={5}
											required
											placeholder="Tuliskan pesan Anda secara lengkap dan mendetail di sini..."
											className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand focus:ring-1 focus:ring-brand rounded-xl text-xs font-semibold outline-none resize-none transition-all"
										/>
									</div>

									<button 
										type="submit"
										disabled={sending}
										className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer shadow-md shadow-brand/15 disabled:opacity-50"
									>
										<Send className="w-3.5 h-3.5" />
										<span>{sending ? "Sedang Mengirim..." : "Kirim Pesan Sekarang"}</span>
									</button>
								</form>
							)}
						</div>
					</div>
				)}

				{/* Map Container */}
				{!loading && mapSrc && (
					<div className="mt-12 bg-white border border-slate-200/80 p-4 rounded-[32px] shadow-sm">
						<h3 className="text-sm font-black text-slate-900 mb-4 px-2 uppercase tracking-wider">Lokasi Kantor di Google Maps</h3>
						<div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-100">
							<iframe
								src={mapSrc}
								width="100%"
								height="100%"
								style={{ border: 0 }}
								allowFullScreen={true}
								loading="lazy"
								referrerPolicy="no-referrer-when-downgrade"
							></iframe>
						</div>
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
									<span className="break-all">{contact.contactEmail}</span>
								</li>
								<li className="flex items-start gap-2.5">
									<Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
									<span>{contact.contactPhone}</span>
								</li>
								<li className="flex items-start gap-2.5">
									<MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
									<span className="leading-normal">{contact.contactLocation}</span>
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
