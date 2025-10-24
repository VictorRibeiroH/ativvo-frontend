"use client"

import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Poppins } from 'next/font/google'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500'],
})

interface HeroBannerProps {
  userName: string
  imageSrc?: string
}

export function HeroBanner({ userName, imageSrc = '/hero-banner.svg' }: HeroBannerProps) {
  return (
    <Card className="border-0 overflow-hidden rounded-3xl">
      <CardContent className="p-0">
        <div 
          className="relative w-full h-48 md:h-56 px-8 py-6 md:px-12 md:py-8 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, #6266EB 0%, #8F5BC0 25%, #A356AE 50%, #D84778 75%, #EF405F 100%)'
          }}
        >
          <div className="flex-1 text-left">
            <h1 className={`text-white mb-2 text-[32px] font-medium leading-[100%] tracking-[0px] ${poppins.className}`}>
              Oi, {userName} 👋
            </h1>
            <p className={`text-white/90 max-w-xl text-[16px] font-normal leading-[100%] tracking-[0px] ${poppins.className}`}>
              Tenha um ótimo dia e não se esqueça de adicionar seu treino de hoje!
            </p>
          </div>
          
          <div className="hidden md:block relative w-[160px] h-[160px] flex-shrink-0 ml-6">
            <Image
              src={imageSrc}
              alt=""
              width={160}
              height={160}
              className="object-contain"
              priority
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
