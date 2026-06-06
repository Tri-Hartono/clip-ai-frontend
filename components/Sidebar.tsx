"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/providers/AuthProvider"
import { 
  LayoutDashboard, 
  Video, 
  CreditCard, 
  LogOut, 
  Scissors,
  Sparkles
} from "lucide-react"

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Clips", href: "/projects", icon: Video },
    { name: "Mockups", href: "/mockups", icon: Sparkles },
    { name: "Billing", href: "/billing", icon: CreditCard },
  ]

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
                  <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-brand" : "text-slate-400"}`} />
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">{item.name}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Session Footer */}
        <div className="p-3 border-t border-slate-100 space-y-3.5">
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

          <button
            onClick={() => signOut()}
            className="w-full flex items-center gap-4 px-3.5 py-3 text-slate-400 hover:text-rose-650 hover:bg-rose-50 rounded-2xl transition-all duration-300 font-extrabold text-sm active:scale-95"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Premium Look) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-around z-50 shadow-lg px-3">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
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
              <item.icon className="w-5 h-5" />
              <span className="text-[9px] font-black mt-1 uppercase tracking-wider">{item.name}</span>
            </Link>
          )
        })}

        <button
          onClick={() => signOut()}
          className="flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-slate-400 hover:text-rose-600 transition-all active:scale-95 font-sans font-bold"
        >
          <LogOut className="w-5 h-5 text-slate-400" />
          <span className="text-[9px] font-black mt-1 uppercase tracking-wider">Sign Out</span>
        </button>
      </div>
    </>
  )
}
