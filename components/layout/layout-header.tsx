"use client"

import { Menu, Activity, Dumbbell, LogOut, Moon, Sun } from "lucide-react"
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
import type { User } from "@/services/api"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
})

interface LayoutHeaderProps {
  user: User | null
  isDark: boolean
  pathname: string | null
  onToggleTheme: () => void
  onLogout: () => void
  onNavigate: (path: string) => void
}

export function LayoutHeader({ 
  user, 
  isDark, 
  pathname, 
  onToggleTheme, 
  onLogout, 
  onNavigate 
}: LayoutHeaderProps) {
  const firstName = user?.name.split(" ")[0] || user?.name || "Usuário"
  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U"

  return (
    <header style={{ backgroundColor: '#6266EB1A' }} className="lg:hidden border-b border-white/10 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden text-white">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-[#1a1b23] border-white/10 p-0">
              <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center">
                    <img src="/logo.png" alt="Ativvo Logo" className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className={`text-2xl font-bold bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent ${pacifico.className}`}>
                      Ativvo
                    </h1>
                    <p className="text-xs text-white/60">
                      Transforme-se diariamenste
                    </p>
                  </div>
                </div>
              </div>
              
              <nav className="p-4 space-y-2">
                <Button 
                  variant={pathname === '/dashboard' ? 'default' : 'ghost'}
                  className={pathname === '/dashboard'
                    ? 'w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
                    : 'w-full justify-start text-white/80 hover:text-white hover:bg-white/10'
                  }
                  onClick={() => onNavigate('/dashboard')}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
                <Button 
                  variant={pathname === '/workouts' ? 'default' : 'ghost'}
                  className={pathname === '/workouts'
                    ? 'w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white'
                    : 'w-full justify-start text-white/80 hover:text-white hover:bg-white/10'
                  }
                  onClick={() => onNavigate('/workouts')}
                >
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Treinos
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-rose-400 hover:text-rose-300 hover:bg-rose-500/10"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </nav>
            </SheetContent>
          </Sheet>

          <h1 className={`${pacifico.className} text-2xl bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text text-transparent`}>
            Ativvo
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-white/60" />
             <Switch
              checked={isDark}
              style={{
                backgroundColor: isDark ? "#000" : "#000",
                borderColor: "#828492",
              }}
            />
            <Moon className="h-4 w-4 text-indigo-300" />
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                  <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={isDark ? 'bg-[#1a1b23] border-white/10' : ''} align="end">
              <DropdownMenuLabel className={isDark ? 'text-white' : ''}>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className={`text-xs font-normal ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className={isDark ? 'bg-white/10' : ''} />
              <DropdownMenuItem className={isDark ? 'text-white/70 focus:text-white focus:bg-white/10' : ''}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem className={isDark ? 'text-white/70 focus:text-white focus:bg-white/10' : ''}>
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator className={isDark ? 'bg-white/10' : ''} />
              <DropdownMenuItem 
                onClick={onLogout}
                className={isDark ? 'text-red-400 focus:text-red-300 focus:bg-red-500/10' : 'text-red-600'}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
