"use client"

import Link from "next/link"
import { ArrowLeft, Scissors, ShieldCheck, Lock } from "lucide-react"

export default function PrivacyPage() {
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
            Kebijakan Privasi
          </h1>
          <p className="text-xs text-slate-300 font-semibold mt-3 max-w-xl">
            Terakhir diperbarui: 15 Juni 2026. Kami berkomitmen untuk melindungi informasi pribadi Anda dan hak privasi Anda.
          </p>
        </div>

        {/* Content Card */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] p-6 md:p-10 shadow-sm space-y-8 text-left text-sm leading-relaxed text-slate-650 font-medium">
          
          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              1. Informasi Yang Kami Kumpulkan
            </h2>
            <p>
              Kami mengumpulkan informasi pribadi yang Anda berikan secara sukarela kepada kami saat mendaftar di Layanan kami, seperti:
              * **Informasi Profil Dasar**: Nama lengkap, alamat email, foto profil, dan kata sandi yang telah dienkripsi.
              * **Data Media**: File video, deskripsi proyek, transkrip teks, dan tautan YouTube yang Anda masukkan ke platform kami.
              * **Data Transaksi**: Riwayat top-up kredit, status pembayaran, bukti transfer manual, dan metode pembayaran yang Anda pilih.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              2. Bagaimana Kami Menggunakan Informasi Anda
            </h2>
            <p>
              Kami menggunakan data yang dikumpulkan untuk tujuan operasional dan peningkatan kualitas layanan, di antaranya:
              * Menyediakan, menjalankan, dan memelihara fitur-fitur pemotongan video AI dan transkripsi.
              * Memproses isi ulang kredit saldo, memvalidasi bukti transfer manual, dan menerbitkan notifikasi status akun.
              * Mengirimkan email konfirmasi transaksi, verifikasi keamanan berkode OTP (2FA), serta pesan tanggapan bantuan dukungan.
              * Mencegah aktivitas penipuan, penyalahgunaan sistem, atau pelanggaran hak cipta.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              3. Berbagi dan Pengungkapan Informasi
            </h2>
            <p>
              Kami sangat menghargai privasi Anda. Clippers AI **tidak akan pernah** menjual, menyewakan, atau membagikan informasi pribadi Anda kepada pihak ketiga untuk tujuan pemasaran eksternal mereka. Kami hanya membagikan informasi Anda dalam keadaan berikut:
              * **Penyedia Layanan Cloud & AI**: Layanan pemrosesan cloud (seperti AWS atau GCP) dan API AI transkripsi (seperti OpenAI/Whisper) demi kelancaran rendering video Anda.
              * **Kepatuhan Hukum**: Jika diwajibkan oleh hukum, panggilan pengadilan, atau perintah resmi dari otoritas penegak hukum yang sah di Republik Indonesia.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              4. Keamanan Informasi Anda
            </h2>
            <p>
              Kami mengimplementasikan langkah-langkah keamanan teknis dan organisasional untuk melindungi data pribadi Anda dari akses tidak sah, modifikasi, atau penghapusan tanpa izin. Kredensial akun Anda diamankan menggunakan enkripsi satu arah (*salted hashing* dengan bcrypt) dan otentikasi login wajib menggunakan kode OTP verifikasi sekali pakai yang kedaluwarsa cepat.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              5. Penyimpanan Data Video
            </h2>
            <p>
              File video yang diunggah ke cloud server kami disimpan hanya selama masa pengeditan aktif guna menghemat penyimpanan dan menjaga keamanan data Anda. Kami berhak menghapus berkas video mentah dari server kami setelah kurun waktu tertentu setelah ekspor proyek selesai secara permanen.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-brand rounded-full inline-block"></span>
              6. Hak Akses dan Kontrol Pengguna
            </h2>
            <p>
              Anda memiliki hak penuh untuk mengakses, memperbarui, atau meminta penghapusan akun serta seluruh data pribadi Anda dari basis data kami. Anda dapat mengirimkan permintaan penghapusan data secara formal melalui kontak email bantuan dukungan resmi kami.
            </p>
          </section>

          {/* Security stamp */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 mt-6">
            <Lock className="w-5.5 h-5.5 text-brand shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-black text-slate-900">Perlindungan Data Berlapis</h4>
              <p className="text-[11px] text-slate-500 font-semibold mt-1">
                Kami tunduk pada prinsip Undang-Undang Pelindungan Data Pribadi (UU PDP) yang berlaku demi memberikan rasa aman bagi semua kreator konten di Clippers AI.
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
            <Link href="/terms" className="hover:text-brand transition-colors">Syarat Ketentuan</Link>
            <Link href="/" className="hover:text-brand transition-colors">Hubungi Bantuan</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
