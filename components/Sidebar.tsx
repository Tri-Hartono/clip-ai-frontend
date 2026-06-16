"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { 
  LayoutDashboard, 
  Video, 
  CreditCard, 
  LogOut, 
  LogIn,
  Scissors,
  Sparkles,
  Link as LinkIcon,
  Headphones,
  Mail,
  Phone,
  MapPin,
  X
} from "lucide-react"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/api"

const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard: LayoutDashboard,
  Video: Video,
  CreditCard: CreditCard,
  Scissors: Scissors,
  Sparkles: Sparkles,
  LinkIcon: LinkIcon,
}

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [contactInfo, setContactInfo] = useState({
    contactEmail: "support@gayadigital.com",
    contactPhone: "+62 812-3456-7890",
    contactLocation: "Gaya Digital Tower, Lantai 12, Jakarta, Indonesia",
  })

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const res = await fetch(`${API_BASE}/menus`)
        if (res.ok) {
          const data = await res.json()
          setMenuItems(data.filter((item: any) => item.active))
        } else {
          throw new Error("Failed to fetch menus")
        }
      } catch (err) {
        console.warn("[Sidebar] Failed to load menus, falling back to defaults", err)
        setMenuItems([
          { name: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
          { name: "My Clips", href: "/projects", icon: "Video" },
          { name: "Timelapse", href: "/timelapse", icon: "Sparkles" },
          { name: "Mockups", href: "/mockups", icon: "Sparkles" },
          { name: "Integrations", href: "/integrations", icon: "LinkIcon" },
          { name: "Billing", href: "/billing", icon: "CreditCard" },
        ])
      }
    }
    fetchMenus()

    // Fetch contact details for dynamic card popup
    fetch(`${API_BASE}/contact-settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setContactInfo({
            contactEmail: data.contactEmail || "support@gayadigital.com",
            contactPhone: data.contactPhone || "+62 812-3456-7890",
            contactLocation: data.contactLocation || "Gaya Digital Tower, Lantai 12, Jakarta, Indonesia"
          })
        }
      })
      .catch(err => console.warn("Failed to load contact info in sidebar", err))
  }, [])

  return (
    <>
      {/* Desktop Aside Sidebar */}
      <aside className="hidden md:flex w-20 hover:w-60 group bg-white border-r border-slate-200/80 flex-col justify-between text-slate-500 min-h-screen font-sans transition-all duration-300 z-30 shadow-sm shrink-0">
        <div>
          {/* Brand Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 overflow-hidden">
            <div className="w-11 h-11 rounded-2xl bg-brand flex items-center justify-center text-white shrink-0 shadow-lg shadow-brand/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              <h1 className="text-base font-extrabold text-slate-900 tracking-wider flex items-center gap-1.5">
                <span>CLIPPERS</span>
                <span className="text-[9px] bg-brand/10 text-brand px-1 py-0.5 rounded font-mono font-bold">AI</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold">Video Cutter SaaS</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1.5 mt-4">
            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const IconComponent = iconMap[item.icon] || Sparkles
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 font-extrabold text-sm ${
                    isActive 
                      ? "bg-brand/10 text-brand border border-brand/20 shadow-sm" 
                      : "hover:bg-slate-100/80 hover:text-slate-900"
                  }`}
                >
                  <IconComponent className={`w-5 h-5 shrink-0 ${isActive ? "text-brand" : "text-slate-400"}`} />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-slate-100 space-y-3.5">
          {/* Contact Admin Card */}
          <div 
            onClick={() => setIsContactModalOpen(true)}
            className="w-full bg-slate-50 hover:bg-brand/5 border border-slate-200/80 hover:border-brand/25 rounded-2xl p-2.5 group-hover:p-3 transition-all duration-300 cursor-pointer shadow-xs flex flex-col gap-1 select-none overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/5 border border-brand/10 text-brand flex items-center justify-center shrink-0">
                <Headphones className="w-4.5 h-4.5 text-brand animate-pulse" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap flex-1">
                <p className="text-[11px] font-black text-slate-800 leading-tight">Contact Admin</p>
                <p className="text-[9px] font-bold text-slate-400 leading-none uppercase tracking-wider">Support System</p>
              </div>
            </div>
            {/* Expanded description info */}
            <div className="max-h-0 group-hover:max-h-12 opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 text-[9.5px] text-slate-500 leading-relaxed font-semibold mt-0 group-hover:mt-2.5 border-t border-dashed border-slate-200/60 pt-0 group-hover:pt-2">
              Ada kendala dengan sistem? Klik di sini untuk menghubungi admin.
            </div>
          </div>

          {user && (
            <div className="flex items-center gap-3 px-1 overflow-hidden">
              <img 
                src={user.photoURL || "https://avatar.iran.liara.run/public/boy"} 
                alt={user.displayName || "Avatar"} 
                className="w-10 h-10 rounded-2xl border border-slate-200 bg-slate-100 shrink-0"
              />
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
                <p className="text-xs font-bold text-slate-900 truncate">{user.displayName || "Creator"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          )}

          {user ? (
            <button
              onClick={() => signOut()}
              className="w-full flex items-center gap-4 px-3.5 py-3 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-2xl transition-all duration-300 font-extrabold text-sm active:scale-95"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Sign Out</span>
            </button>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center gap-4 px-3.5 py-3 text-brand hover:text-white hover:bg-brand rounded-2xl transition-all duration-300 font-extrabold text-sm active:scale-95 border border-brand/20 hover:border-brand"
            >
              <LogIn className="w-5 h-5 shrink-0" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Sign In / Login</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Premium Look) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around z-50 shadow-lg px-3">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const IconComponent = iconMap[item.icon] || Sparkles
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive 
                  ? "text-brand scale-105" 
                  : "text-slate-400 hover:text-slate-650"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-[9px] font-black mt-1 uppercase tracking-wider">{item.name}</span>
            </Link>
          )
        })}

        <button
          onClick={() => setIsContactModalOpen(true)}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-400 hover:text-brand transition-all active:scale-95 font-sans font-bold"
        >
          <Headphones className="w-5 h-5" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Contact</span>
        </button>

        {user ? (
          <button
            onClick={() => signOut()}
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-400 hover:text-rose-600 transition-all active:scale-95 font-sans font-bold"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Sign Out</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-brand hover:text-brand-dark transition-all active:scale-95 font-sans font-bold"
          >
            <LogIn className="w-5 h-5" />
            <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Login</span>
          </Link>
        )}
      </div>

      {/* Contact Admin Popup Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">Hubungi Administrator</h3>
              <button 
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Mail className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email Support</p>
                  <p className="text-xs font-bold text-slate-800 break-all mt-0.5">{contactInfo.contactEmail}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <Phone className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Nomor Telepon / WA</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{contactInfo.contactPhone}</p>
                </div>
              </div>

              <div className="flex gap-3 items-start p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alamat Kantor</p>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed mt-0.5">{contactInfo.contactLocation}</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsContactModalOpen(false)}
              className="w-full mt-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl text-xs font-extrabold transition-all active:scale-98 cursor-pointer shadow-md shadow-brand/15"
            >
              Tutup Panel
            </button>
          </div>
        </div>
      )}
    </>
  )
}
