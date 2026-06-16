"use client"

import { useState, useEffect } from "react"
import { signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { 
  X, 
  Scissors, 
  Mail, 
  Lock, 
  User as UserIcon, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles,
  ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import axios from "axios"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: "login" | "register"
}

export default function LoginModal({ isOpen, onClose, initialMode = "register" }: LoginModalProps) {
  const [mode, setMode] = useState<"login" | "register">(initialMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [otp, setOtp] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [sendingOtp, setSendingOtp] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setError("")
      setSuccessMessage("")
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  const handleSendOtp = async () => {
    if (!email) {
      setError("Masukkan alamat email Anda terlebih dahulu.")
      return
    }
    setError("")
    setSuccessMessage("")
    setSendingOtp(true)

    try {
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/send-otp`, {
        email
      })
      const otpCode = resp.data.code
      setSuccessMessage(`Kode verifikasi telah dikirim! (Sandbox: ${otpCode})`)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || "Gagal mengirim kode verifikasi.")
    } finally {
      setSendingOtp(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    setSuccessMessage("")
    setGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/google`, {
        email: result.user.email,
        name: result.user.displayName || "Google Creator",
        image: result.user.photoURL || "https://avatar.iran.liara.run/public/boy",
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      localStorage.setItem("fb_token", token)
      localStorage.setItem("user_profile", JSON.stringify(resp.data.user))
      
      setSuccessMessage("Login Google berhasil!")
      setTimeout(() => {
        onClose()
        router.push("/dashboard")
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      if (err.code === "auth/popup-blocked" || err.message?.includes("popup-blocked")) {
        setError("Pop-up Google Login diblokir oleh browser. Silakan izinkan pop-up pada peramban Anda untuk situs ini, atau silakan login menggunakan Email, Sandi, dan OTP.")
      } else {
        setError("Gagal masuk dengan Google: " + (err.message || "Masalah jaringan"))
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !otp) {
      setError("Semua field (email, password, kode verifikasi) wajib diisi.")
      return
    }
    setError("")
    setSuccessMessage("")
    setSubmitting(true)

    try {
      const resp = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/login-register`, {
        email,
        password,
        name: mode === "register" ? name : "",
        otp,
        action: mode
      })

      const { token, user } = resp.data
      localStorage.setItem("fb_token", token)
      localStorage.setItem("user_profile", JSON.stringify(user))

      setSuccessMessage(mode === "register" ? "Pendaftaran berhasil!" : "Login berhasil!")
      setTimeout(() => {
        onClose()
        router.push("/dashboard")
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.error || "Otentikasi gagal. Silakan periksa kembali data Anda.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans text-slate-800">
      
      <div className="absolute inset-0 cursor-default" onClick={onClose} />

      <div className="bg-white border border-slate-200 rounded-[32px] w-full max-w-4xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-450 hover:text-slate-850 p-1.5 hover:bg-slate-100 rounded-xl transition-all cursor-pointer z-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: VISUAL ILLUSTRATION */}
        <div className="bg-gradient-to-br from-white via-[#03897B]/5 to-[#05b3a1]/10 text-slate-800 p-8 md:p-10 flex flex-col justify-between hidden md:flex md:w-1/2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-36 h-36 bg-brand/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase bg-[#03897B]/10 text-brand border border-[#03897B]/20 tracking-wider mb-6">
              <Sparkles className="w-3 h-3 text-brand fill-current" />
              100+ Languages Supported
            </span>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center py-6">
            <div className="w-full max-w-xs bg-white p-4 rounded-3xl border border-slate-200 shadow-md flex flex-col gap-3">
              <div className="flex gap-2">
                <span className="text-[9px] bg-brand text-white font-extrabold px-2 py-0.5 rounded">AI Subtitles</span>
                <span className="text-[9px] bg-brand/10 text-brand-accent font-extrabold px-2 py-0.5 rounded">Speaker Label</span>
              </div>
              <div className="w-full aspect-video rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 relative overflow-hidden border border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=400" 
                  alt="AI Video Crop Preview"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
                <span className="absolute bottom-2.5 left-2.5 text-[10px] bg-brand text-white px-2 py-0.5 rounded font-bold">
                  ★ Viral Clip ★
                </span>
              </div>
              <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                <span>AI Video Reframe</span>
                <span className="text-brand">9:16 Active</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-left space-y-2.5 mt-auto">
            <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight text-[#025a50]">
              Masuk untuk Membuka Fitur
            </h2>
            <p className="text-sm font-extrabold text-brand">
              Buka Lebih Banyak Fitur & 200 Kredit Gratis!
            </p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Daftar untuk mengunggah video Anda sendiri dan klaim Hadiah Selamat Datang Anda untuk membuat potongan klip viral secara instan.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: FORMS & ACTIONS */}
        <div className="p-8 md:p-10 flex flex-col justify-center w-full md:w-1/2 bg-white border-l border-slate-100">
          <div className="w-full space-y-6">
            <div className="text-center md:text-left mb-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {mode === "register" ? "Buat Akun Baru" : "Masuk ke Akun Anda"}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {mode === "register" ? "Mulai potong video Anda secara instan" : "Silakan masukkan kredensial akun Anda"}
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold animate-fade-in">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-brand/5 border border-brand/20 text-brand text-xs font-bold animate-pulse-slow">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleGoogleLogin}
                disabled={googleLoading || submitting}
                className="py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl flex items-center justify-center gap-2.5 transition-all text-xs active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand" />
                ) : (
                  <img 
                    src="https://authjs.dev/img/providers/google.svg" 
                    alt="Google Logo" 
                    className="w-4 h-4"
                  />
                )}
                <span>Google</span>
              </button>

              <button
                onClick={() => alert("Masuk dengan Apple saat ini disimulasikan.")}
                className="py-3 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold rounded-xl flex items-center justify-center gap-2.5 transition-all text-xs active:scale-95 cursor-pointer"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" 
                  alt="Apple Logo" 
                  className="w-4 h-4"
                />
                <span>Apple</span>
              </button>
            </div>

            <div className="relative flex py-1.5 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">ATAU</span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              {mode === "register" && (
                <div>
                  <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Nama Lengkap</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-450" />
                    <input
                      type="text"
                      placeholder="Nama Lengkap Anda"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs font-semibold"
                      required={mode === "register"}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Alamat email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-450" />
                  <input
                    type="email"
                    placeholder="kreator@gayadigital.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Kata Sandi</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-450" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan Kata Sandi"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-black text-slate-500 mb-1.5 uppercase tracking-wider">Kode verifikasi (2FA OTP)</label>
                <div className="relative flex items-center">
                  <ShieldCheck className="absolute left-4 top-3.5 w-4 h-4 text-slate-450 z-10" />
                  <input
                    type="text"
                    placeholder="Masukkan kode verifikasi"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-11 pr-24 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs font-semibold"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                    className="absolute right-2 top-1.5 px-3 py-1.5 bg-[#03897B] hover:bg-[#026b5f] disabled:bg-slate-200 disabled:text-slate-400 text-white text-[10px] font-bold rounded-lg transition-colors cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    {sendingOtp && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Kirim</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || googleLoading}
                className="w-full py-3.5 bg-brand hover:bg-brand-dark text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand/10 text-xs active:scale-98 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{mode === "register" ? "Buat Akun Anda" : "Masuk ke Akun Anda"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-500 font-semibold pt-2">
              {mode === "register" ? (
                <p>
                  Sudah memiliki akun?{" "}
                  <button 
                    onClick={() => { setMode("login"); setError(""); setSuccessMessage(""); }}
                    className="text-brand hover:underline font-extrabold cursor-pointer"
                  >
                    Masuk
                  </button>
                </p>
              ) : (
                <p>
                  Belum memiliki akun?{" "}
                  <button 
                    onClick={() => { setMode("register"); setError(""); setSuccessMessage(""); }}
                    className="text-brand hover:underline font-extrabold cursor-pointer"
                  >
                    Daftar
                  </button>
                </p>
              )}
            </div>

            <div className="text-[10px] text-slate-500 font-semibold text-center leading-relaxed max-w-xs mx-auto">
              Dengan melanjutkan, Anda menyetujui{" "}
              <Link href="/terms" className="underline hover:text-slate-600">Syarat Penggunaan</Link>{" "}
              dan mengakui{" "}
              <Link href="/privacy" className="underline hover:text-slate-600">Kebijakan Privasi</Link>{" "}
              kami.
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
