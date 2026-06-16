"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/?login=true")
  }, [router])

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-slate-455 text-xs font-bold tracking-wider animate-pulse">
        MENGALIHKAN KE HALAMAN MASUK...
      </div>
    </div>
  )
}
