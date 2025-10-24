"use client"

interface PageTopBaseProps {
  userName: string
  subtitle: string
  isDark: boolean
}

export function PageTopBase({ userName, subtitle, isDark }: PageTopBaseProps) {
  return (
    <div className="hidden lg:block">
      <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Bem-vindo de volta, {userName}! 👋
      </h2>
      <p className={isDark ? 'text-white/60' : 'text-gray-600'}>
        {subtitle}
      </p>
    </div>
  )
}
