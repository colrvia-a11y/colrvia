"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import GradientOverlay from '@/components/ui/GradientOverlay'
import Button from '@/components/ui/Button'
import { useReducedMotion } from '@/components/theme/MotionSettings'
import clsx from 'clsx'

interface StoryHeroCardProps {
  imageSrc: string
  title: string
  meta?: string
  href: string
  priority?: boolean
  skeleton?: boolean
  palette?: { hex:string; name?:string }[]
  ctaLabel?: string
  singleLineTitle?: boolean
}

export default function StoryHeroCard({ imageSrc, title, meta, href, priority, skeleton=false, palette=[], ctaLabel='Open', singleLineTitle=false }: StoryHeroCardProps){
  const reduced = useReducedMotion()
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={clsx('group relative rounded-2xl overflow-hidden bg-linen/40 border border-[var(--border)] shadow-soft',
      !loaded && 'animate-pulse')}
    >
      {!skeleton && (
        <Image src={imageSrc} alt={title} fill priority={priority} sizes="(max-width:768px) 90vw, (max-width:1200px) 33vw, 25vw" className={clsx('object-cover transition-opacity duration-500', loaded?'opacity-100':'opacity-0')} onLoad={()=>setLoaded(true)} />
      )}
      <GradientOverlay />
      {palette?.length>0 && (
        <div className="absolute top-2 left-2 flex gap-1">
          {palette.slice(0,5).map((p,i)=> <span key={i} className="h-6 w-6 rounded-md border border-[var(--border)]" style={{background:p.hex}} aria-hidden />)}
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2 text-white">
  <h3 className={clsx('font-display text-lg leading-snug tracking-[-0.01em] drop-shadow-sm', singleLineTitle ? 'line-clamp-1' : 'line-clamp-2')}>{title}</h3>
        {meta && <p className="text-[11px] uppercase tracking-wide font-medium text-white/80 line-clamp-1">{meta}</p>}
        <div className="pt-1">
          <Button as={Link} href={href} variant="primary" className="text-sm px-4 py-2 rounded-xl">{ctaLabel}</Button>
        </div>
      </div>
      <span className="absolute inset-0" aria-hidden />
    </div>
  )
}
