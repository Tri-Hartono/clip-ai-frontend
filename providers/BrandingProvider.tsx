"use client"

import { useEffect } from "react"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080") + "/api"

interface BrandingSettings {
  appTitle: string
  logoIconName: string
  faviconURL: string
  primaryColorHex: string
  colorBrandDark: string
  colorBrandLight: string
  colorBrandAccent: string
  colorBrandSoft: string
}

/** Adjust a hex color brightness by a percentage (-100 to 100) */
function adjustColorBrightness(hex: string, percent: number): string {
  if (!hex || hex.length < 7) return hex
  let R = parseInt(hex.substring(1, 3), 16)
  let G = parseInt(hex.substring(3, 5), 16)
  let B = parseInt(hex.substring(5, 7), 16)
  R = Math.min(255, Math.max(0, Math.round((R * (100 + percent)) / 100)))
  G = Math.min(255, Math.max(0, Math.round((G * (100 + percent)) / 100)))
  B = Math.min(255, Math.max(0, Math.round((B * (100 + percent)) / 100)))
  return `#${R.toString(16).padStart(2, "0")}${G.toString(16).padStart(2, "0")}${B.toString(16).padStart(2, "0")}`
}

/** Apply branding colors as CSS variables on :root so they override Tailwind theme */
function applyBrandColors(settings: BrandingSettings) {
  const root = document.documentElement

  const brand   = settings.primaryColorHex  || "#03897B"
  const dark    = settings.colorBrandDark   || adjustColorBrightness(brand, -20)
  const light   = brand
  const accent  = settings.colorBrandAccent || adjustColorBrightness(brand, 15)
  const soft    = brand

  // Override :root --brand-* variables
  root.style.setProperty("--brand-primary", brand)
  root.style.setProperty("--brand-dark",    dark)
  root.style.setProperty("--brand-light",   light)
  root.style.setProperty("--brand-accent",  accent)
  root.style.setProperty("--brand-soft",    soft)

  // Clean pure-white background and deep slate text instead of pastel tints
  root.style.setProperty("--background", "#ffffff")
  root.style.setProperty("--foreground", "#0f172a")

  // Update page title
  if (settings.appTitle) {
    document.title = `${settings.appTitle} - AI Video Clip Generator`
  }

  // Update favicon dynamically if a URL is provided
  if (settings.faviconURL && settings.faviconURL !== "/favicon.ico") {
    const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement | null
    if (existing) {
      existing.href = settings.faviconURL
    } else {
      const link = document.createElement("link")
      link.rel = "icon"
      link.href = settings.faviconURL
      document.head.appendChild(link)
    }
  }
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    fetch(`${API_BASE}/branding`)
      .then((res) => {
        if (!res.ok) throw new Error(`Branding fetch failed: ${res.status}`)
        return res.json() as Promise<BrandingSettings>
      })
      .then((data) => {
        applyBrandColors(data)
      })
      .catch((err) => {
        console.warn("[BrandingProvider] Could not load branding, using defaults:", err.message)
      })
  }, [])

  return <>{children}</>
}
