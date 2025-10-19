"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getCurrentUser, logout, getWeeklyStats, type User, type WeeklyStats } from "@/services/api"
import { Activity, Dumbbell, Flame, TrendingUp, LogOut, Menu, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Pacifico } from "next/font/google"

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
})

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push("/sign-in")
      return
    }
    setUser(currentUser)
    loadWeeklyStats()
    setLoading(false)

    const savedTheme = localStorage.getItem('ativvo-theme')
    setIsDark(savedTheme !== 'light')
  }, [router])

  const loadWeeklyStats = async () => {
    try {
      const stats = await getWeeklyStats()
      setWeeklyStats(stats)
    } catch (error) {
      console.error('Failed to load weekly stats:', error)
    }
  }

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('ativvo-theme', newTheme ? 'dark' : 'light')
  }

  const handleLogout = () => {
    logout()
    router.push("/sign-in")
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

  const stats = [
    {
      title: "Treinos esta semana",
      value: weeklyStats ? `${weeklyStats.completed}/${weeklyStats.goal}` : "0/0",
      emoji: weeklyStats?.emoji || "💪",
      icon: Dumbbell,
      color: "text-blue-500",
      progress: weeklyStats ? Math.min((weeklyStats.completed / weeklyStats.goal) * 100, 100) : 0,
    },
    {
      title: "Calorias queimadas",
      value: "2,450",
      goal: "3000",
      icon: Flame,
      color: "text-orange-500",
      progress: 81,
    },
    {
      title: "Tempo de cardio",
      value: `${user?.cardio_time || 0}min`,
      goal: "150min",
      icon: Activity,
      color: "text-green-500",
      progress: user?.cardio_time ? Math.min((user.cardio_time / 150) * 100, 100) : 0,
    },
    {
      title: "Progresso do objetivo",
      value: "75%",
      goal: "100%",
      icon: TrendingUp,
      color: "text-purple-500",
      progress: 75,
    },
  ]

  const recentWorkouts = [
    { name: "Treino de Peito", date: "Hoje", duration: "45min", calories: 320 },
    { name: "Cardio HIIT", date: "Ontem", duration: "30min", calories: 280 },
    { name: "Treino de Costas", date: "2 dias atrás", duration: "50min", calories: 350 },
  ]

  const firstName = user?.name.split(" ")[0] || user?.name || "Usuário"

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
          <Button variant="default" className="w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white">
            <Activity className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
          <Button 
            variant="ghost" 
            className={`w-full justify-start transition-colors ${
              isDark 
                ? 'text-white/80 hover:text-white hover:bg-white/10' 
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
            }`}
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
                    <Button variant="default" className="w-full justify-start bg-gradient-to-r from-indigo-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 text-white">
                      <Activity className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                    <Button 
                      variant="ghost" 
                      className={`w-full justify-start transition-colors ${
                        isDark 
                          ? 'text-white/80 hover:text-white hover:bg-white/10' 
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }`}
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
                  Bem-vindo de volta, {firstName}!
                </h2>
                <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Veja seu progresso
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Dark Mode Toggle */}
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
                  <Button variant="ghost" className={`relative h-10 w-10 rounded-full transition-colors ${
                    isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                  }`}>
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-rose-500 text-white">
                        {user?.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={`w-56 transition-colors ${
                  isDark 
                    ? 'bg-black/95 backdrop-blur-xl border-white/10' 
                    : 'bg-white backdrop-blur-xl border-gray-200'
                }`}>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className={`text-sm font-medium leading-none transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user?.name}
                      </p>
                      <p className={`text-xs leading-none transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
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

        {/* Dashboard Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 transition-colors duration-300 ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-500/[0.03] via-transparent to-rose-500/[0.03]' 
            : 'bg-gradient-to-br from-indigo-100/30 via-transparent to-rose-100/30'
        }`}>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              
              return (
                <Card key={index} className={`transition-colors duration-300 ${
                  isDark 
                    ? 'bg-black/40 backdrop-blur-xl border-white/10' 
                    : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg'
                }`}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold transition-colors flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {stat.value}
                      {'emoji' in stat && <span className="text-2xl">{stat.emoji}</span>}
                    </div>
                    <Progress value={stat.progress} className="mt-2" />
                    {'goal' in stat && (
                      <p className={`text-xs mt-1 transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        Meta: {stat.goal}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* User Info Card */}
            <Card className={`lg:col-span-3 transition-colors duration-300 ${
              isDark 
                ? 'bg-black/40 backdrop-blur-xl border-white/10' 
                : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg'
            }`}>
              <CardHeader>
                <CardTitle className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Informações do Perfil
                </CardTitle>
                <CardDescription className={`transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Seus dados físicos atuais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Altura</p>
                    <p className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.height || "-"}cm
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Peso</p>
                    <p className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.weight || "-"}kg
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Gordura Corporal</p>
                    <p className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {user?.body_fat || "-"}%
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>Objetivo</p>
                    <p className="text-lg font-semibold capitalize text-transparent bg-gradient-to-r from-indigo-400 to-rose-400 bg-clip-text">
                      {user?.goal || "-"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Workouts */}
            <Card className={`lg:col-span-4 transition-colors duration-300 ${
              isDark 
                ? 'bg-black/40 backdrop-blur-xl border-white/10' 
                : 'bg-white/90 backdrop-blur-xl border-gray-200 shadow-lg'
            }`}>
              <CardHeader>
                <CardTitle className={`transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Treinos Recentes
                </CardTitle>
                <CardDescription className={`transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                  Seus últimos treinos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentWorkouts.map((workout, index) => (
                    <div key={index} className={`flex items-center justify-between p-3 border rounded-lg transition-all ${
                      isDark 
                        ? 'border-white/10 bg-white/5 hover:bg-white/10' 
                        : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-indigo-500/20 to-rose-500/20 flex items-center justify-center">
                          <Dumbbell className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <p className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {workout.name}
                          </p>
                          <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                            {workout.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {workout.duration}
                        </p>
                        <p className={`text-sm transition-colors ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                          {workout.calories} cal
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}