"use client"

import { Activity, Dumbbell, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Pacifico } from "next/font/google"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
})

interface LeftSidebarProps {
  isDark: boolean
  pathname: string | null
  onNavigate: (path: string) => void
  onLogout: () => void
}

export function LeftSidebar({ isDark, pathname, onNavigate, onLogout }: LeftSidebarProps) {
  return (
    <aside className={`hidden lg:flex w-64 flex-col border-r transition-colors duration-300 ${
      isDark 
        ? 'border-white/10 bg-black/40 backdrop-blur-xl' 
        : 'border-gray-200 bg-white/80 backdrop-blur-xl shadow-xl'
    }`}>
      <div className={`p-6 border-b transition-colors ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3">
          <div>
            <img src="/logo.png" alt="Ativvo Logo" className="h-8 w-8" />
          </div>
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
          onClick={() => onNavigate('/dashboard')}
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
          onClick={() => onNavigate('/workouts')}
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
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </aside>
  )
}
