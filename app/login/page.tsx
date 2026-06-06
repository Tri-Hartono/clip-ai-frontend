"use client"

import { useState } from "react"
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { Sparkles, ShieldCheck, ArrowRight, Scissors, Mail, Lock, User } from "lucide-react"
import { useRouter } from "next/navigation"
import axios from "axios"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isCredentialsMode, setIsCredentialsMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setError("")
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const token = await result.user.getIdToken()
      
      // Sync user account profile to GOLANG GORM Database
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/google`, {
        email: result.user.email,
        name: result.user.displayName || "Google Creator",
        image: result.user.photoURL || "https://avatar.iran.liara.run/public/boy",
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      
      localStorage.setItem("fb_token", token)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Google Auth failed:", err)
      setError("Gagal masuk dengan Google: " + (err.message || "Masalah jaringan"))
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setSubmitting(true)
    setError("")

    try {
      let userCredential
      try {
        // 1. Try to login
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      } catch (loginErr) {
        // 2. If user doesn't exist, register them automatically for developer sandbox simplicity
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        if (userCredential.user) {
          await updateProfile(userCredential.user, {
            displayName: name || "Developer Mode",
          })
        }
      }

      const token = await userCredential.user.getIdToken()

      // Sync custom account registration to Golang REST database
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/auth/google`, {
        email: userCredential.user.email,
        name: userCredential.user.displayName || name || "Developer Mode",
        image: "https://avatar.iran.liara.run/public/boy",
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      localStorage.setItem("fb_token", token)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Credentials Auth failed:", err)
      setError(err.message || "Autentikasi email / password gagal.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-800">
      
      {/* Background Animated Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-brand/10 blur-[100px] animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-teal-400/10 blur-[100px] animate-float-medium"></div>

      <div className="w-full max-w-md bg-white border border-brand-soft rounded-3xl p-8 shadow-xl relative z-10">
        
        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30 mb-4 text-white animate-float-fast">
            <Scissors className="w-7 h-7" />
          </div>
          <h1 className="text-2.5xl font-extrabold text-slate-900 tracking-tight">Selamat Datang</h1>
          <p className="text-xs text-brand font-extrabold uppercase tracking-wider mt-1.5">CLIPPERS AI Video Generator</p>
          <p className="text-xs text-slate-400 font-semibold mt-2 max-w-xs leading-relaxed">
            Ubah video panjang Anda menjadi klip Shorts viral siap pakai otomatis dengan subtitle estetik AI
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold">
            {error}
          </div>
        )}

        {isCredentialsMode ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Nama Lengkap (Bila Akun Baru)</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs font-bold"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="kreator@gayadigital.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs font-bold"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 mb-1.5 uppercase tracking-wider">Password (Minimal 6 karakter)</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-850 placeholder-slate-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-all text-xs font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand/10 text-xs active:scale-98 cursor-pointer"
            >
              <span>Masuk / Buat Akun Sandbox</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              type="button"
              onClick={() => setIsCredentialsMode(false)}
              className="w-full text-center text-xs text-brand hover:text-brand-dark font-extrabold mt-3 active:scale-95 transition-all cursor-pointer"
            >
              Kembali ke Login Google
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Google Authentication Button via Firebase popup */}
            <button
              onClick={handleGoogleLogin}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-brand-soft text-slate-800 font-extrabold rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-sm text-xs active:scale-95 cursor-pointer"
            >
              <img 
                src="https://authjs.dev/img/providers/google.svg" 
                alt="Google Logo" 
                className="w-5 h-5"
              />
              <span>Masuk dengan Akun Google</span>
            </button>

            {/* Email sandbox option */}
            <button
              onClick={() => setIsCredentialsMode(true)}
              className="w-full py-3.5 border border-dashed border-brand/40 text-brand hover:text-brand-dark bg-brand/5 text-xs font-extrabold rounded-2xl transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Log in / Daftar Cepat dengan Email
            </button>
          </div>
        )}

        {/* Security / Privacy Trust note */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-extrabold font-sans uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-brand" />
          <span>Secured oauth by Firebase SDK</span>
        </div>
      </div>
    </div>
  )
}
