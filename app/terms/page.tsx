"use client"

import Link from "next/link"
import { ArrowLeft, Scissors, ShieldCheck, HelpCircle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      
      {/* Background decoration blur items */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-brand/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-accent/5 blur-[120px] pointer-events-none"></div>

      {/* HEADER */}
      <header className="h-20 px-6 md:px-12 flex items-center justify-between bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
          <div className="w-9 h-9 rounded-xl bg-brand flex items-center justify-center text-white shadow shadow-brand/20">
            <Scissors className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900 tracking-wider">CLIPPERS AI</h1>
            <p className="text-[8px] text-brand font-semibold tracking-widest uppercase">Video Clip Generator</p>
          </div>
        </Link>
        <Link 
          href="/" 
          className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl border border-slate-200 hover:border-brand text-xs font-bold text-slate-600 hover:text-brand transition-all cursor-pointer bg-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Beranda</span>
        </Link>
      </header>

      {/* MAIN LAYOUT */}
      <main className="flex-grow max-w-4xl mx-auto w-full px-6 py-12 md:py-16 relative z-10">
        
        {/* Banner Section */}
        <div className="relative bg-gradient-to-r from-[#025a50] to-[#01423a] text-white rounded-3xl p-8 md:p-10 shadow-xl overflow-hidden mb-10 border border-emerald-900/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          <h1 className="text-2.5xl md:text-3.5xl font-black tracking-tight leading-none">
            Syarat Ketentuan Penggunaan
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-3 max-w-xl">
            Terakhir diperbarui: 15 Juni 2026. Harap baca syarat dan ketentuan ini dengan saksama sebelum menggunakan layanan kami.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 md:p-10 shadow-sm space-y-8 text-left text-sm leading-relaxed text-slate-650 font-medium">
          
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              1. Penerimaan Syarat
            </h2>
            <p>
              Dengan mengakses atau menggunakan platform **Clippers AI** (selanjutnya disebut "Layanan" atau "Kami"), Anda menyatakan bahwa Anda telah membaca, memahami, dan menyetujui untuk terikat oleh Syarat Ketentuan Penggunaan ini. Jika Anda tidak menyetujui bagian mana pun dari syarat ini, Anda tidak diperkenankan menggunakan Layanan kami.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              2. Deskripsi Layanan
            </h2>
            <p>
              Clippers AI menyediakan alat pengeditan video berbasis kecerdasan buatan (AI) yang mendeteksi momen klimaks secara otomatis, mentranskripsikan ucapan (speech-to-text), serta menambahkan subtitle bergaya karaoke. Layanan kami beroperasi dengan sistem kredit prabayar (pay-as-you-go).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              3. Pendaftaran Akun & Keamanan
            </h2>
            <p>
              Untuk menggunakan beberapa fitur utama, Anda wajib melakukan pendaftaran akun melalui otentikasi Google atau email dengan verifikasi kode OTP (2FA). Anda bertanggung jawab penuh atas kerahasiaan informasi akun, kata sandi, dan kode OTP Anda. Clippers AI tidak bertanggung jawab atas kerugian akibat akses tanpa izin ke akun Anda.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              4. Kebijakan Kredit & Pengembalian Dana (Refund)
            </h2>
            <p>
              * **Sistem Kuota**: Kredit yang Anda beli direpresentasikan dalam satuan menit durasi pemrosesan video. Kredit yang telah berhasil ditransaksikan aktif selamanya dan tidak memiliki masa kedaluwarsa.
              * **Kebijakan Pembayaran**: Seluruh pembelian bersifat final. Kami tidak menyediakan pengembalian dana (refund) atau uang kembali atas kredit yang telah ditransaksikan kecuali terjadi kegagalan sistem total di pihak kami yang dikonfirmasi oleh tim bantuan dukungan.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              5. Batasan Tanggung Jawab Konten
            </h2>
            <p>
              Anda memegang hak kepemilikan dan tanggung jawab hukum sepenuhnya atas semua file video yang Anda unggah atau tautkan melalui YouTube/MP4. Kami melarang keras penggunaan Layanan untuk memproses materi yang melanggar hak cipta pihak lain, konten pornografi, ujaran kebencian, atau hal-hal yang melanggar hukum Republik Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              6. Modifikasi Ketentuan Layanan
            </h2>
            <p>
              Kami berhak untuk memperbarui atau mengubah Syarat Ketentuan ini sewaktu-waktu. Perubahan akan berlaku segera setelah dipublikasikan pada halaman ini. Melanjutkan penggunaan Layanan kami setelah pembaruan tersebut dianggap sebagai persetujuan Anda atas ketentuan yang baru.
            </p>
          </section>

          {/* Quick Help box */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 mt-6">
            <HelpCircle className="w-5.5 h-5.5 text-brand shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-slate-900">Ada pertanyaan mengenai ketentuan kami?</h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Jika Anda memiliki pertanyaan atau kekhawatiran tentang syarat penggunaan ini, silakan hubungi tim dukungan kami di email <span className="text-brand font-bold">support@gayadigital.com</span>.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="py-8 bg-white border-t border-slate-200 text-center text-[11px] text-slate-400 font-semibold relative z-10">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Clippers AI. Semua Hak Dilindungi Undang-Undang.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-brand transition-colors">Kebijakan Privasi</Link>
            <Link href="/" className="hover:text-brand transition-colors">Hubungi Bantuan</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
