"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser, logout, type User } from "@/services/api"
import { LeftSidebar } from "@/components/layout/left-sidebar"
import { LayoutHeader } from "@/components/layout/layout-header"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(true)

  const publicPages = ['/sign-in', '/sign-up', '/home']
  const isPublicPage = publicPages.includes(pathname || '')

  useEffect(() => {
    if (!isPublicPage) {
      const currentUser = getCurrentUser()
      if (!currentUser) {
        router.push("/sign-in")
        return
      }
      setUser(currentUser)
    }
    setLoading(false)

    const savedTheme = localStorage.getItem('ativvo-theme')
    setIsDark(savedTheme !== 'light')
  }, [router, isPublicPage])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('ativvo-theme', newTheme ? 'dark' : 'light')
  }

  const handleLogout = () => {
    logout()
    router.push("/sign-in")
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  if (isPublicPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#030303]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto" />
          <p className="mt-4 text-white/60">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-[#030303]' : 'bg-gradient-to-br from-indigo-50 via-white to-rose-50'}`}>
      <LeftSidebar
        isDark={isDark}
        pathname={pathname}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
