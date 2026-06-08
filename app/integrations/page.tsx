"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "@/providers/AuthProvider"
import { api } from "@/services/api"
import Sidebar from "@/components/Sidebar"
import { Link2, Video as YoutubeIcon, Music as Music2, CheckCircle2, AlertCircle } from "lucide-react"

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

export default function IntegrationsPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState({ youtube: false, tiktok: false, facebook: false })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await api.get("/api/oauth/status")
      setStatus(res.data)
    } catch (err: any) {
      setError("Failed to load integration status")
    } finally {
      setLoading(false)
    }
  }

  const handleConnectYoutube = async () => {
    try {
      const res = await api.get("/api/oauth/youtube/auth")
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err: any) {
      alert("Failed to initialize YouTube connection")
    }
  }

  const handleConnectTiktok = async () => {
    try {
      const res = await api.get("/api/oauth/tiktok/auth")
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err: any) {
      alert("Failed to initialize TikTok connection")
    }
  }

  const handleConnectFacebook = async () => {
    try {
      const res = await api.get("/api/oauth/facebook/auth")
      if (res.data.url) {
        window.location.href = res.data.url
      }
    } catch (err: any) {
      alert("Failed to initialize Facebook connection")
    }
  }

  const handleDisconnect = async (platform: string) => {
    try {
      if (confirm(`Are you sure you want to disconnect ${platform}?`)) {
        await api.post(`/api/oauth/disconnect/${platform}`)
        await fetchStatus()
      }
    } catch (err: any) {
      alert(`Failed to disconnect ${platform}`)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-800">
      <Sidebar />

      <main className="flex-1 flex flex-col max-h-screen overflow-y-auto pb-16 md:pb-0">
        <div className="h-16 border-b border-slate-200/60 px-6 flex items-center justify-between bg-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Social Integrations</h1>
          </div>
        </div>

        <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
          <div className="mb-8">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Connect Your Accounts</h2>
            <p className="text-slate-500 font-medium">Link your social media accounts to directly publish AI-generated clips with one click.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 border border-rose-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* YouTube Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <YoutubeIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">YouTube</h3>
                  <p className="text-sm text-slate-500 font-medium">Publish directly to YouTube Shorts</p>
                </div>
              </div>

              {loading ? (
                <div className="h-12 bg-slate-100 animate-pulse rounded-xl w-full"></div>
              ) : status.youtube ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Connected
                  </div>
                  <button
                    onClick={() => handleDisconnect("youtube")}
                    className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectYoutube}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Link2 className="w-5 h-5" />
                  Connect YouTube
                </button>
              )}
            </div>

            {/* TikTok Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0">
                  <Music2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">TikTok</h3>
                  <p className="text-sm text-slate-500 font-medium">Publish directly to TikTok profile</p>
                </div>
              </div>

              {loading ? (
                <div className="h-12 bg-slate-100 animate-pulse rounded-xl w-full"></div>
              ) : status.tiktok ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Connected
                  </div>
                  <button
                    onClick={() => handleDisconnect("tiktok")}
                    className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectTiktok}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Link2 className="w-5 h-5" />
                  Connect TikTok
                </button>
              )}
            </div>

            {/* Facebook Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FacebookIcon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Facebook</h3>
                  <p className="text-sm text-slate-500 font-medium">Publish directly to Facebook Reels</p>
                </div>
              </div>

              {loading ? (
                <div className="h-12 bg-slate-100 animate-pulse rounded-xl w-full"></div>
              ) : status.facebook ? (
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-green-700 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5" />
                    Connected
                  </div>
                  <button
                    onClick={() => handleDisconnect("facebook")}
                    className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectFacebook}
                  className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Link2 className="w-5 h-5" />
                  Connect Facebook
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
