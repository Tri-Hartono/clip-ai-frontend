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
    // 1. Check if there is a local session first (local credentials 2FA login)
    const localToken = localStorage.getItem("fb_token")
    const localProfileStr = localStorage.getItem("user_profile")
    if (localToken && localProfileStr) {
      try {
        const profile = JSON.parse(localProfileStr)
        setUser({
          uid: String(profile.id),
          email: profile.email,
          displayName: profile.name,
          photoURL: profile.image,
          getIdToken: async () => localToken,
        } as any)
        setIdToken(localToken)
        setLoading(false)
        
        if (pathname === "/login") {
          router.push("/dashboard")
        }
        return
      } catch (e) {
        // Clear corrupt session
      }
    }

    // 2. Fall back to Firebase Auth state listener
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
        // Double-check if local credentials session wasn't created in the meantime
        const token = localStorage.getItem("fb_token")
        const profileStr = localStorage.getItem("user_profile")
        if (token && profileStr) {
          try {
            const profile = JSON.parse(profileStr)
            setUser({
              uid: String(profile.id),
              email: profile.email,
              displayName: profile.name,
              photoURL: profile.image,
              getIdToken: async () => token,
            } as any)
            setIdToken(token)
            setLoading(false)
            return
          } catch (e) {}
        }

        setIdToken(null)
        localStorage.removeItem("fb_token")
        localStorage.removeItem("user_profile")
        
        // Protect dashboard routes in client-side router
        const isProtected = pathname.startsWith("/dashboard") ||
                            pathname.startsWith("/projects") ||
                            pathname.startsWith("/editor")
                            
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
    localStorage.removeItem("fb_token")
    localStorage.removeItem("user_profile")
    setUser(null)
    setIdToken(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, loading, idToken, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
