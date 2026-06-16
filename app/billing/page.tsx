"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Sidebar from "@/components/Sidebar"
import { 
  Check, 
  Sparkles, 
  Zap, 
  X, 
  CreditCard, 
  Send, 
  ShieldCheck, 
  ChevronDown, 
  Coins, 
  RefreshCw,
  Scissors,
  ArrowRight,
  Mail,
  Phone,
  MapPin,
  Heart
} from "lucide-react"
import { api } from "@/services/api"
import { useAuth } from "@/providers/AuthProvider"
import LoginModal from "@/components/LoginModal"

export default function BillingPage() {
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
      .catch(err => console.warn("Failed to load contact info in billing footer", err))
  }, [])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  
  // Real-time credits from DB
  const [currentCredits, setCurrentCredits] = useState<number | null>(null)
  const [loadingCredits, setLoadingCredits] = useState(false)
  
  // Interactive state for buying multiple credit packs
  const [starterPacks, setStarterPacks] = useState(1)
  const [creatorPacks, setCreatorPacks] = useState(1)
  const [agencyPacks, setAgencyPacks] = useState(1)

  // Dynamic DB Plans
  const [dbPlans, setDbPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  
  // Simulation loading state
  const [simulating, setSimulating] = useState(false)
  const [simSuccess, setSimSuccess] = useState("")

  const [payments, setPayments] = useState<any[]>([])
  const [fetchingPayments, setFetchingPayments] = useState(false)

  // Fetch current user credits balance on mount
  const fetchCredits = async () => {
    if (!user) return
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

  const fetchPayments = async () => {
    if (!user) return
    setFetchingPayments(true)
    try {
      const resp = await api.get("/api/billing/history")
      setPayments(resp.data || [])
    } catch (err) {
      console.error("Failed to load user billing history", err)
    } finally {
      setFetchingPayments(false)
    }
  }

  const fetchPlans = async () => {
    setLoadingPlans(true)
    try {
      const resp = await api.get("/api/billing/plans")
      setDbPlans(resp.data || [])
    } catch (err) {
      console.error("Failed to load billing plans:", err)
    } finally {
      setLoadingPlans(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  useEffect(() => {
    if (user) {
      fetchCredits()
      fetchPayments()
    } else {
      setCurrentCredits(null)
      setPayments([])
    }
  }, [user])

  // Pure Credit System Packages (One-time payment, no monthly subscription)
  const plans = dbPlans.map((plan: any) => {
    const isTrial = plan.planId === "trial"
    
    let packs = 1
    let setPacks = (n: number) => {}
    if (plan.planId === "starter") {
      packs = starterPacks
      setPacks = setStarterPacks
    } else if (plan.planId === "creator") {
      packs = creatorPacks
      setPacks = setCreatorPacks
    } else if (plan.planId === "agency") {
      packs = agencyPacks
      setPacks = setAgencyPacks
    }

    const rawFeatures = plan.features ? plan.features.split("\n") : []
    const processedFeatures = rawFeatures.map((feat: string, idx: number) => {
      if (idx === 0 && !isTrial) {
        const baseCredits = plan.creditsBase
        const currentCredits = baseCredits * packs
        const prefix = `${baseCredits} Menit`
        if (feat.startsWith(prefix)) {
          return feat.replace(prefix, `${currentCredits} Menit`)
        }
        return `${currentCredits} Menit ${feat}`
      }
      return feat
    })

    return {
      id: plan.planId,
      dbId: plan.id,
      name: plan.name,
      badge: plan.badge,
      price: plan.price,
      priceLabel: isTrial ? "Gratis" : `Rp ${plan.price.toLocaleString()}`,
      description: plan.description,
      creditsBase: plan.creditsBase,
      credits: plan.creditsBase * packs,
      features: processedFeatures,
      cta: plan.cta || (isTrial ? "Kredit Awal Aktif" : "Beli Paket"),
      active: isTrial ? true : false,
      popular: plan.popular,
      color: plan.color || "border-slate-200 bg-white",
      packs: isTrial ? undefined : packs,
      setPacks: isTrial ? undefined : setPacks
    }
  })

  const handleCheckoutOpen = (plan: any) => {
    if (!user) {
      setModalMode("login")
      setIsLoginModalOpen(true)
      return
    }

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
      priceRaw: finalPrice,
      creditsFormatted: `${finalCredits.toLocaleString()} Menit Kredit`,
      creditsRaw: finalCredits
    })
    setSimSuccess("")
    setModalOpen(true)
  }

  const [checkingOutWa, setCheckingOutWa] = useState(false)

  const handleWhatsAppCheckout = async () => {
    if (!selectedPlan) return
    setCheckingOutWa(true)
    setSimSuccess("")
    try {
      // Register pending transaction in backend database
      await api.post("/api/billing/checkout", {
        plan: selectedPlan.id,
        amount: parseFloat(selectedPlan.priceRaw),
        credits: parseFloat(selectedPlan.creditsRaw),
        paymentMethod: "manual"
      })

      // Open WhatsApp text in new tab
      const url = getWaUrl(selectedPlan.name, selectedPlan.priceFormatted, selectedPlan.creditsFormatted)
      window.open(url, "_blank", "noopener,noreferrer")

      setSimSuccess("Pemesanan manual berhasil dikirim! Menunggu konfirmasi transfer Anda di WhatsApp...")
      
      // Refresh list
      fetchPayments()

      // Auto close checkout modal after 3 seconds
      setTimeout(() => {
        setModalOpen(false)
        setSelectedPlan(null)
        setSimSuccess("")
      }, 3000)
    } catch (err) {
      console.error("WhatsApp checkout registration failed", err)
      alert("Gagal melakukan registrasi pembayaran. Coba restart server backend Anda.")
    } finally {
      setCheckingOutWa(false)
    }
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
        
        // Refresh list
        fetchPayments()

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
    <div className={`min-h-screen bg-slate-50 flex ${user ? "flex-col md:flex-row" : "flex-col"} font-sans text-slate-800 relative`}>
      {user ? (
        <Sidebar />
      ) : (
        <header className="h-20 px-6 md:px-12 flex items-center justify-between bg-white/70 backdrop-blur-md sticky top-0 z-55 shadow-sm border-b border-slate-100/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/25 animate-float-fast">
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

          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600">
            <Link href="/" className="hover:text-brand transition-colors">Beranda</Link>
            <Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
            <Link href="/billing" className="hover:text-brand transition-colors text-brand">Harga</Link>
            <Link href="/contact" className="hover:text-brand transition-colors">Contact</Link>
          </nav>

          <div className="flex items-center gap-4">
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
          </div>
        </header>
      )}

      <main className={`flex-1 p-4 md:p-8 pb-24 md:pb-8 ${user ? "overflow-y-auto max-h-screen" : ""}`}>
        
        {/* Top welcome banner with green-mesh gradient background */}
        <div className="relative bg-gradient-to-r from-[#025a50] to-[#01423a] text-white rounded-3xl p-6 md:p-8 shadow-xl overflow-hidden mb-8 border border-emerald-900/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-white/10 text-emerald-300 border border-white/5 tracking-wider mb-2.5">
            Pure Credit System • Pay-As-You-Go
          </span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight flex items-center gap-2">
            Top-Up Kredit Clippers AI
            <Coins className="w-5.5 h-5.5 text-amber-300 animate-bounce-slow" />
          </h1>
          <p className="text-xs text-slate-355 font-medium mt-1.5 max-w-xl">
            Beli paket kuota kredit (menit) sekali bayar sesuai kebutuhan Anda. Kredit aktif selamanya tanpa masa kedaluwarsa.
          </p>
        </div>

        {/* Dynamic Credit Balance display card (Matching Dashboard layout style) */}
        <div className="mb-8 max-w-sm bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20">
              <Coins className="w-6 h-6" />
            </div>
            <div>
              {user ? (
                <>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Sisa Saldo Kredit</p>
                  <h3 className="text-lg font-extrabold text-slate-900 mt-0.5 font-mono">
                    {currentCredits !== null ? `${currentCredits.toFixed(2)} Menit` : "Loading..."}
                  </h3>
                </>
              ) : (
                <>
                  <p className="text-[10px] text-brand font-black uppercase tracking-wider">GUEST MODE</p>
                  <h3 className="text-xs font-black text-slate-805 mt-0.5 leading-tight">
                    Login / Daftar Akun Baru
                  </h3>
                </>
              )}
            </div>
          </div>
          {user ? (
            <button 
              onClick={fetchCredits}
              disabled={loadingCredits}
              className="p-2.5 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingCredits ? "animate-spin text-brand" : ""}`} />
            </button>
          ) : (
            <button 
              onClick={() => {
                setModalMode("login")
                setIsLoginModalOpen(true)
              }}
              className="px-3.5 py-2 bg-brand hover:bg-brand-dark text-white rounded-xl text-[10px] font-extrabold transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              Masuk
            </button>
          )}
        </div>

        {/* Dynamic Pricing Cards Grid (Matching Dashboard Light Mode) */}
        {loadingPlans ? (
          <div className="flex items-center justify-center py-20 bg-white border border-slate-200/60 rounded-[32px] max-w-7xl mx-auto shadow-sm">
            <RefreshCw className="w-8 h-8 text-brand animate-spin" />
            <span className="ml-3 text-xs font-bold text-slate-550 uppercase tracking-wider">Memuat Paket Harga...</span>
          </div>
        ) : (
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
                            onChange={(e) => plan.setPacks?.(parseInt(e.target.value))}
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
                      {plan.features.map((feat: string, idx: number) => (
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
                        ? "bg-slate-150 border-slate-200 text-slate-400 cursor-not-allowed"
                        : plan.popular
                          ? "bg-brand border-brand text-white hover:bg-brand-dark shadow-md shadow-brand/10 font-bold"
                          : "bg-white hover:bg-brand text-slate-800 hover:text-white border border-slate-200 hover:border-brand font-bold"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              )
            })}

          </div>
        )}

        {/* Safe payment disclaimer */}
        <div className="mt-10 max-w-7xl mx-auto p-6 bg-slate-50 border border-slate-200 rounded-3xl flex flex-col sm:flex-row items-center gap-4 text-left">
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

        {/* Riwayat Pembayaran & Billing (Hanya Tampil Jika User Login) */}
        {user && (
          <div className="mt-8 max-w-7xl mx-auto bg-white border border-slate-200/80 rounded-[32px] p-6.5 shadow-sm">
            <div className="flex items-center gap-3.5 mb-6 border-b border-slate-100 pb-4">
              <div className="w-11 h-11 rounded-xl bg-brand/10 flex items-center justify-center text-brand border border-brand/20">
                <CreditCard className="w-5.5 h-5.5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Riwayat Pembayaran & Billing</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Daftar transaksi pengisian kredit akun Anda</p>
              </div>
            </div>

            {fetchingPayments ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-6 h-6 text-brand animate-spin" />
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                <Coins className="w-9 h-9 text-slate-300 mx-auto mb-2.5" />
                <p className="text-xs text-slate-400 font-semibold">Belum ada riwayat transaksi pembayaran.</p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Silakan pilih salah satu paket di atas untuk melakukan top-up.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-500 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[9px] tracking-widest font-black">
                      <th className="pb-3">Tanggal</th>
                      <th className="pb-3">Kode Transaksi</th>
                      <th className="pb-3">Paket</th>
                      <th className="pb-3">Nominal</th>
                      <th className="pb-3">Kredit</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {payments.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 text-slate-400">
                          {new Date(pay.createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 font-mono font-bold text-slate-700">{pay.reference || `TXN-${pay.id}`}</td>
                        <td className="py-4 capitalize text-slate-800 font-extrabold">{pay.plan}</td>
                        <td className="py-4 text-slate-700 font-bold">
                          {pay.amount === 0 ? "Gratis" : `Rp ${pay.amount.toLocaleString("id-ID")}`}
                        </td>
                        <td className="py-4 text-emerald-600 font-bold">+{pay.credits} Menit</td>
                        <td className="py-4 text-right">
                          <span className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                            pay.status === "completed" 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                              : pay.status === "pending" 
                                ? "bg-amber-50 border-amber-100 text-amber-600 animate-pulse" 
                                : "bg-rose-50 border-rose-100 text-rose-600"
                          }`}>
                            {pay.status === "completed" ? "Sukses" : pay.status === "pending" ? "Pending" : "Gagal"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

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
                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={checkingOutWa || !!simSuccess}
                  className="w-full py-3.5 bg-white hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-300 text-emerald-700 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs text-center cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5 fill-current text-emerald-500" />
                  <span>{checkingOutWa ? "Menghubungkan..." : "Kirim Struk & Konfirmasi via WhatsApp"}</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </main>

      {/* Login / Register Modal for Guest Users */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)} 
        initialMode={modalMode} 
      />

      {/* RENDER FOOTER FOR GUESTS ONLY */}
      {!user && (
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
      )}
    </div>
  )
}
