"use client"

import { Activity, Dumbbell, Flame, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { WeeklyStats } from "@/services/api"

interface StatsCardsProps {
  weeklyStats: WeeklyStats | null
  isDark: boolean
}

export function StatsCards({ weeklyStats, isDark }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card style={{ backgroundColor: 'rgba(98, 102, 235, 0.1)' }} className="border-0 overflow-hidden relative group hover:scale-105 transition-transform">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-full blur-2xl" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-white/80">
            Treinos Semanais
          </CardTitle>
          <Dumbbell className="h-4 w-4 text-blue-400" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-white">
            {weeklyStats?.completed || 0}
          </div>
          <p className="text-xs text-blue-300 mt-1">
            Meta: {weeklyStats?.goal || 5} treinos
          </p>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'rgba(98, 102, 235, 0.1)' }} className="border-0 overflow-hidden relative group hover:scale-105 transition-transform">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-2xl" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-white/80">
            Progresso Semanal
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-400" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-white">
            {weeklyStats ? Math.round((weeklyStats.completed / weeklyStats.goal) * 100) : 0}%
          </div>
          <p className="text-xs text-orange-300 mt-1">
            {weeklyStats?.emoji || '💪'}
          </p>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'rgba(98, 102, 235, 0.1)' }} className="border-0 overflow-hidden relative group hover:scale-105 transition-transform">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-full blur-2xl" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-white/80">
            Restam
          </CardTitle>
          <Activity className="h-4 w-4 text-green-400" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-white">
            {weeklyStats ? Math.max(0, weeklyStats.goal - weeklyStats.completed) : 0}
          </div>
          <p className="text-xs text-green-300 mt-1">
            Treinos para atingir a meta
          </p>
        </CardContent>
      </Card>

      <Card style={{ backgroundColor: 'rgba(98, 102, 235, 0.1)' }} className="border-0 overflow-hidden relative group hover:scale-105 transition-transform">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-2xl" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-white/80">
            Dias Ativos
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold text-white">
            {weeklyStats?.completed || 0}
          </div>
          <p className="text-xs text-purple-300 mt-1">
            Esta semana
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
