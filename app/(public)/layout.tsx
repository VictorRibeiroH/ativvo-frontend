"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import { getCurrentUser, logout, type User } from "@/services/api"
import { Activity, Dumbbell, LogOut, Menu, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Pacifico } from "next/font/google"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
})

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

  // Pages that don't need sidebar
  const publicPages = ['/sign-in', '/sign-up', '/home', '/dashboard']
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

  // If it's a public page (sign-in, sign-up, home), just render children
  if (isPublicPage) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  const firstName = user?.name.split(" ")[0] || user?.name || "Usuário"
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <div className={`flex h-screen transition-colors duration-300 ${isDark ? 'bg-[#030303]' : 'bg-gradient-to-br from-indigo-50 via-white to-rose-50'}`}>
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex w-64 flex-col border-r transition-colors duration-300 ${
        isDark 
          ? 'border-white/10 bg-black/40 backdrop-blur-xl' 
          : 'border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl'
      }`}>
        <div className={`p-6 border-b transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3">
            <Image 
              src="/logo.png" 
              alt="Ativvo" 
              width={40} 
              height={40}
              className="rounded-lg"
            />
            <div>
              <h1 className={`text-2xl font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent ${pacifico.className}`}>
                Ativvo
              </h1>
              <p className={`text-xs transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Transforme-se diariamente
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Button 
            variant={pathname === '/dashboard' ? 'default' : 'ghost'}
            className={pathname === '/dashboard' 
              ? 'w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
              : `w-full justify-start transition-colors ${
                  isDark 
                    ? 'text-white/80 hover:text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`
            }
            onClick={() => router.push('/dashboard')}
          >
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant={pathname === '/workouts' ? 'default' : 'ghost'}
            className={pathname === '/workouts'
              ? 'w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
              : `w-full justify-start transition-colors ${
                  isDark 
                    ? 'text-white/80 hover:text-white hover:bg-white/10' 
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`
            }
            onClick={() => router.push('/workouts')}
          >
            <Dumbbell className="mr-2 h-4 w-4" />
            Treinos
          </Button>
        </nav>

        <div className={`p-4 border-t transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <Button 
            variant="ghost" 
            className={`w-full justify-start transition-colors ${
              isDark 
                ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
            }`}
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`border-b transition-colors duration-300 ${
          isDark 
            ? 'border-white/10 bg-black/40 backdrop-blur-xl' 
            : 'border-gray-200 bg-white/80 backdrop-blur-xl shadow-sm'
        }`}>
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className={`lg:hidden transition-colors ${
                    isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
                  }`}>
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className={`w-64 p-0 transition-colors ${
                  isDark 
                    ? 'bg-[#030303] border-white/10' 
                    : 'bg-white border-gray-200'
                }`}>
                  <div className={`p-6 border-b transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-center gap-3">
                      <Image 
                        src="/logo.png" 
                        alt="Ativvo" 
                        width={40} 
                        height={40}
                        className="rounded-lg"
                      />
                      <div>
                        <h1 className={`text-2xl font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent ${pacifico.className}`}>
                          Ativvo
                        </h1>
                        <p className={`text-xs transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          Transforme-se diariamente
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="p-4 space-y-2">
                    <Button 
                      variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                      className={pathname === '/dashboard'
                        ? 'w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
                        : `w-full justify-start transition-colors ${
                            isDark 
                              ? 'text-white/80 hover:text-white hover:bg-white/10' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`
                      }
                      onClick={() => router.push('/dashboard')}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button 
                      variant={pathname === '/workouts' ? 'default' : 'ghost'}
                      className={pathname === '/workouts'
                        ? 'w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
                        : `w-full justify-start transition-colors ${
                            isDark 
                              ? 'text-white/80 hover:text-white hover:bg-white/10' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                          }`
                      }
                      onClick={() => router.push('/workouts')}
                    >
                      <Dumbbell className="mr-2 h-4 w-4" />
                      Treinos
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start transition-colors ${
                        isDark 
                          ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                          : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
                      }`}
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sair
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>

              <div>
                <h2 className={`text-xl font-semibold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Olá, {firstName}!
                </h2>
                <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  {pathname === '/dashboard' && 'Veja seu progresso'}
                  {pathname === '/workouts' && 'Gerencie seus treinos'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <div className="flex items-center gap-2">
                <Sun className={`h-4 w-4 transition-colors ${isDark ? 'text-white/40' : 'text-yellow-500'}`} />
                <Switch 
                  checked={isDark} 
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-indigo-500"
                />
                <Moon className={`h-4 w-4 transition-colors ${isDark ? 'text-indigo-400' : 'text-gray-400'}`} />
              </div>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className={`h-10 w-10 ${
                      isDark 
                        ? 'bg-gradient-to-br from-indigo-500 to-rose-500' 
                        : 'bg-gradient-to-br from-indigo-400 to-rose-400'
                    }`}>
                      <AvatarFallback className="bg-transparent text-white font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-56 transition-colors ${
                  isDark 
                    ? 'bg-black/90 backdrop-blur-xl border-white/10' 
                    : 'bg-white border-gray-200'
                }`}>
                  <DropdownMenuLabel className={isDark ? 'text-white' : 'text-gray-900'}>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className={`text-xs font-normal transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className={isDark ? 'bg-white/10' : 'bg-gray-200'} />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className={`cursor-pointer transition-colors ${
                      isDark 
                        ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10' 
                        : 'text-rose-600 hover:text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03]' 
            : 'bg-gradient-to-br from-indigo-100/30 via-transparent to-rose-100/30'
        }`}>
          {children}
        </main>
      </div>
    </div>
  )
}
