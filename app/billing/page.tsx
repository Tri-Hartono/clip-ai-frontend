"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import { Check, Sparkles, Zap, X, CreditCard, Send, ShieldCheck, ChevronDown, Coins, RefreshCw } from "lucide-react"
import { api } from "@/services/api"

export default function BillingPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  
  // Real-time credits from DB
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(false)
  
  // Interactive state for buying multiple credit packs
  const [starterPacks, setStarterPacks] = useState(1)
  const [creatorPacks, setCreatorPacks] = useState(1)
  const [agencyPacks, setAgencyPacks] = useState(1)

  // Simulation loading state
  const [simulating, setSimulating] = useState(false)
  const [simSuccess, setSimSuccess] = useState("")

  // Fetch current user credits balance on mount
  const fetchCredits = async () => {
    setLoadingCredits(true)
    try {
      const resp = await api.get("/api/auth/me")
      if (resp.data && resp.data.user) {
        setCurrentCredits(resp.data.user.credits)
      }
    } catch (err) {
      console.error("Failed to load real-time user credits balance", err)
    } finally {
      setLoadingCredits(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [])

  // Pure Credit System Packages (One-time payment, no monthly subscription)
  const plans = [
    {
      id: "trial",
      name: "TRIAL CREDITS",
      badge: "FREE BONUS",
      price: 0,
      priceLabel: "Gratis",
      description: "Bonus kredit uji coba saat pertama kali mendaftar akun",
      creditsBase: 10,
      credits: 10, // 10 Free credits (minutes)
      features: [
        "10 Menit Kredit Transkripsi Gratis",
        "Akses Penuh Model Whisper AI",
        "Pemotongan Video Loss-less FFmpeg",
        "Hardburn Subtitle Warna Kustom"
      ],
      cta: "Kredit Awal Aktif",
      active: true,
      popular: false,
      color: "border-slate-200 bg-white"
    },
    {
      id: "starter",
      name: "STARTER PACK",
      badge: "HEMAT",
      price: 10000, // Rp 10.000
      priceLabel: "Rp 10.000",
      description: "Isi ulang kredit hemat untuk pemula",
      creditsBase: 30,
      credits: 30 * starterPacks,
      features: [
        `${30 * starterPacks} Menit Kredit Transkripsi`,
        "Kredit Aktif Selamanya (Tanpa Kedaluwarsa)",
        "Dukungan Pemotongan Shorts 9:16",
        "Ekspor Kualitas Tinggi 1080p"
      ],
      cta: "Beli Paket Starter",
      active: false,
      popular: false,
      color: "border-slate-200 bg-white",
      packs: starterPacks,
      setPacks: setStarterPacks
    },
    {
      id: "creator",
      name: "CREATOR PACK",
      badge: "BEST VALUE",
      price: 25000, // Rp 25.000
      priceLabel: "Rp 25.000",
      description: "Paket terbaik untuk kreator konten aktif & rutin",
      creditsBase: 100, // 100 credits (minutes)
      credits: 100 * creatorPacks,
      features: [
        `${100 * creatorPacks} Menit Kredit (Bonus +10 Menit!)`,
        "Prioritas Antrean Transkripsi AI",
        "Bebas Potong Berulang Kali",
        "Ekspor Ultra Jernih Kualitas 2K"
      ],
      cta: "Beli Paket Creator",
      active: false,
      popular: true, // Most popular neon frame
      color: "border-brand bg-white ring-2 ring-brand/10 shadow-lg shadow-brand/5",
      packs: creatorPacks,
      setPacks: setCreatorPacks
    },
    {
      id: "agency",
      name: "AGENCY PACK",
      badge: "REKOMENDASI",
      price: 50000, // Rp 50.000
      priceLabel: "Rp 50.000",
      description: "Paket kuota besar untuk agensi atau editor profesional",
      creditsBase: 250, // 250 credits
      credits: 250 * agencyPacks,
      features: [
        `${250 * agencyPacks} Menit Kredit (Bonus +30 Menit!)`,
        "Prioritas Kecepatan AI Paling Tinggi",
        "Dukungan Penuh Layanan Admin VIP",
        "Ekspor Sinematik Kualitas 4K"
      ],
      cta: "Beli Paket Agency",
      active: false,
      popular: false,
      color: "border-slate-200 bg-white",
      packs: agencyPacks,
      setPacks: setAgencyPacks
    }
  ]

  const handleCheckoutOpen = (plan: any) => {
    let finalPrice = plan.price
    let finalCredits = plan.credits

    if (plan.id !== "trial") {
      finalPrice = plan.price * plan.packs
      finalCredits = plan.creditsBase * plan.packs
    }

    setSelectedPlan({
      id: plan.id,
      name: `${plan.name} ${plan.id !== "trial" ? `(${plan.packs}x Pack)` : ""}`,
      priceFormatted: `Rp ${finalPrice.toLocaleString()}`,
      creditsFormatted: `${finalCredits.toLocaleString()} Menit Kredit`,
      creditsRaw: finalCredits
    })
    setSimSuccess("")
    setModalOpen(true)
  }

  // Simulated instant payment bypass function
  const handleSimulatePayment = async () => {
    if (!selectedPlan) return
    setSimulating(true)
    setSimSuccess("")
    
    try {
      const resp = await api.post("/api/billing/simulate-topup", {
        credits: parseFloat(selectedPlan.creditsRaw)
      })
      
      if (resp.data) {
        // Refresh credit state balance in UI instantly
        setCurrentCredits(resp.data.credits)
        setSimSuccess(`Top-up sukses! Kredit sebesar ${selectedPlan.creditsRaw} Menit berhasil ditambahkan ke database Anda secara instan!`)
        
        // Auto close checkout modal after 2.5 seconds
        setTimeout(() => {
          setModalOpen(false)
          setSelectedPlan(null)
          setSimSuccess("")
        }, 2500)
      }
    } catch (err) {
      console.error("Simulation failed", err)
      alert("Simulasi pembayaran gagal. Coba restart server backend Anda.")
    } finally {
      setSimulating(false)
    }
  }

  const getWaUrl = (planName: string, planPrice: string, credits: string) => {
    const text = `Halo Admin Clippers, saya ingin konfirmasi transfer manual untuk pembelian Paket Kredit *${planName}* seharga *${planPrice}* untuk pengisian *${credits}*. Berikut adalah bukti transfer saya.`
    return `https://wa.me/628123456789?text=${encodeURIComponent(text)}`
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800 relative">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-y-auto max-h-screen">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-slate-200/60">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Top-Up Kredit Clippers AI</span>
              <Coins className="w-6 h-6 text-brand animate-bounce-slow" />
            </h1>
            <p className="text-xs text-brand font-extrabold uppercase tracking-widest mt-0.5">PURE CREDIT SYSTEM • PAY-AS-YOU-GO</p>
            <p className="text-sm text-slate-500 font-semibold mt-1.5">Beli paket kuota kredit (menit) sekali bayar sesuai kebutuhan Anda. Kredit aktif selamanya tanpa masa kedaluwarsa.</p>
          </div>
        </div>

        {/* Dynamic Credit Balance display card (Matching Dashboard layout style) */}
        <div className="mb-8 max-w-sm bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Sisa Saldo Kredit</p>
              <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 font-mono">
                {currentCredits !== null ? `${currentCredits.toFixed(2)} Menit` : "Loading..."}
              </h3>
            </div>
          </div>
          <button 
            onClick={fetchCredits}
            disabled={loadingCredits}
            className="p-2.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingCredits ? "animate-spin text-brand" : ""}`} />
          </button>
        </div>

        {/* Dynamic Pricing Cards Grid (Matching Dashboard Light Mode) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto py-2">
          
          {plans.map((plan) => {
            const isTrial = plan.id === "trial"
            let displayPrice = plan.price
            if (!isTrial && plan.packs) {
              displayPrice = plan.price * plan.packs
            }

            return (
              <div 
                key={plan.id}
                className={`border rounded-[32px] p-6.5 flex flex-col justify-between relative transition-all duration-300 hover:shadow-lg ${plan.color}`}
              >
                {/* Most Popular / Recommendation Badge */}
                {(plan.popular || plan.badge) && (
                  <span className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[9px] font-black tracking-widest uppercase shadow-md ${
                    plan.popular ? "bg-[#03897b] text-white animate-pulse" : "bg-slate-500 text-white"
                  }`}>
                    {plan.popular ? "MOST POPULAR" : plan.badge}
                  </span>
                )}

                <div>
                  {/* Plan Name */}
                  <div className="mb-4">
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-wide">{plan.name}</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-relaxed min-h-[32px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing details */}
                  <div className="flex items-baseline gap-1 mb-5 border-b border-slate-100 pb-5">
                    <span className="text-3xl font-black text-slate-900">
                      {isTrial ? "Gratis" : `Rp ${displayPrice.toLocaleString()}`}
                    </span>
                    {!isTrial && (
                      <span className="text-[9px] font-extrabold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">Sekali Bayar</span>
                    )}
                  </div>

                  {/* Dynamic Packs Multiplier Dropdown (For non-trial packs) */}
                  {!isTrial && plan.packs && plan.setPacks && (
                    <div className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl mb-5 flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Beli Sekaligus:</span>
                      <div className="relative">
                        <select 
                          value={plan.packs}
                          onChange={(e) => plan.setPacks(parseInt(e.target.value))}
                          className="bg-white border border-slate-200 text-slate-800 rounded-lg text-[9px] font-bold py-1.5 pl-2.5 pr-7 appearance-none focus:outline-none focus:border-brand cursor-pointer"
                        >
                          <option value="1">1 Pack</option>
                          <option value="2">2 Packs</option>
                          <option value="3">3 Packs</option>
                          <option value="5">5 Packs</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2.5 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Features List */}
                  <ul className="space-y-3.5 mb-8">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs font-bold text-slate-650">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span className={idx === 0 ? "text-slate-900 font-extrabold" : ""}>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sub Action CTA */}
                <button
                  onClick={() => {
                    if (!plan.active) {
                      handleCheckoutOpen(plan)
                    }
                  }}
                  disabled={plan.active}
                  className={`w-full py-3.5 rounded-xl font-extrabold transition-all duration-300 text-xs active:scale-95 cursor-pointer border ${
                    plan.active
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      : plan.popular
                        ? "bg-brand border-brand text-white hover:bg-brand-dark shadow-md shadow-brand/10 font-bold"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-bold"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}

        </div>

        {/* Safe payment disclaimer */}
        <div className="mt-10 max-w-7xl mx-auto p-6 bg-brand-light/35 border border-brand-soft/60 rounded-3xl flex flex-col sm:flex-row items-center gap-4 text-left">
          <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900">Sistem Kredit Adil & Transparan</h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Setiap kali Anda menempel link YouTube atau mengunggah video, kredit dikurangi sesuai durasi video yang di-transkripsikan. Jika kredit Anda habis, Anda dapat melakukan top-up dengan membeli paket sekali bayar di atas. Tidak ada langganan tersembunyi atau pemotongan otomatis kartu kredit Anda!
            </p>
          </div>
        </div>

        {/* Checkout Modal (Matching Dashboard light mode style) */}
        {modalOpen && selectedPlan && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-55 flex items-center justify-center p-4 font-sans animate-fade-in text-slate-800">
            <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
              <button
                onClick={() => {
                  setModalOpen(false)
                  setSelectedPlan(null)
                  setSimSuccess("")
                }}
                className="absolute top-4 right-4 p-2 bg-slate-50 border border-slate-200 text-slate-450 hover:text-slate-800 rounded-xl transition-all active:scale-90 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-4">
                <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20 shadow-sm">
                  <CreditCard className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Konfirmasi Top-Up Kredit</h3>
                  <p className="text-[10px] text-brand font-black uppercase tracking-wider">{selectedPlan.name}</p>
                </div>
              </div>

              {/* Simulation success feedback */}
              {simSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold animate-pulse-slow">
                  {simSuccess}
                </div>
              )}

              {/* Bank Details Container */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-4 mb-6">
                <div>
                  <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Kirim Transfer Ke Rekening BCA/Mandiri:</span>
                  <div className="flex items-center justify-between mt-2 pb-3 border-b border-slate-200/60">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Bank Central Asia (BCA)</h4>
                      <p className="text-sm font-mono font-black text-brand mt-0.5">123-456-7890</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold bg-white px-2.5 py-1 rounded border border-slate-200">a/n PT Gaya Digital</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">Bank Mandiri</h4>
                      <p className="text-sm font-mono font-black text-brand mt-0.5">098-765-4321</p>
                    </div>
                    <span className="text-[9px] text-slate-500 font-bold bg-white px-2.5 py-1 rounded border border-slate-200">a/n PT Gaya Digital</span>
                  </div>
                </div>

                <div className="pt-3.5 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Total Harga Pembayaran:</span>
                  <span className="text-base text-brand font-extrabold">{selectedPlan.priceFormatted}</span>
                </div>
              </div>

              {/* Confirmation Step Guidance */}
              <div className="space-y-3 mb-6 text-xs leading-relaxed text-slate-500 font-semibold">
                <p>1. Silakan lakukan transfer sebesar <strong className="text-slate-800">{selectedPlan.priceFormatted}</strong> ke salah satu rekening bank di atas.</p>
                <p>2. Ambil bukti screenshot atau struk transfer sukses.</p>
                <p>3. Klik tombol di bawah untuk mengirim bukti transfer ke WhatsApp admin Clippers. Saldo kredit akan diisi ulang instan.</p>
              </div>

              {/* Two buttons side-by-side inside the modal */}
              <div className="space-y-3">
                {/* 1. SIMULATED INSTANT BYPASS FOR TESTING */}
                <button
                  onClick={handleSimulatePayment}
                  disabled={simulating || !!simSuccess}
                  className="w-full py-4 bg-brand hover:bg-brand-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand/20 text-xs active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  <Coins className={`w-4.5 h-4.5 ${simulating ? "animate-spin" : ""}`} />
                  <span>{simulating ? "Memproses Simulasi..." : "Simulasi Bayar Instan (Bypass)"}</span>
                </button>

                {/* 2. WhatsApp Checkout Button (Standard flow) */}
                <a
                  href={getWaUrl(selectedPlan.name, selectedPlan.priceFormatted, selectedPlan.creditsFormatted)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs text-center cursor-pointer block"
                >
                  <Send className="w-3.5 h-3.5 fill-current text-slate-400" />
                  <span>Kirim Struk & Konfirmasi via WhatsApp</span>
                </a>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  )
}
