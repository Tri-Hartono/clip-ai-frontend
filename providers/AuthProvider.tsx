"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter, usePathname } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  idToken: string | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  idToken: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Retrieve fresh ID token JWT from Firebase Auth provider
        const token = await currentUser.getIdToken()
        setIdToken(token)
        localStorage.setItem("fb_token", token)
        
        if (pathname === "/login") {
          router.push("/dashboard")
        }
      } else {
        setIdToken(null)
        localStorage.removeItem("fb_token")
        
        // Protect dashboard routes in client-side router
        const isProtected = pathname.startsWith("/dashboard") ||
                            pathname.startsWith("/projects") ||
                            pathname.startsWith("/editor") ||
                            pathname.startsWith("/billing")
                            
        if (isProtected) {
          router.push("/login")
        }
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [pathname, router])

  const signOut = async () => {
    setLoading(true)
    await fbSignOut(auth)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, idToken, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
