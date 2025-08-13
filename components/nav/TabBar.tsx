"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, FolderOpen, User } from 'lucide-react'

const tabs = [
  { href:'/', label:'Home', icon:Home },
  { href:'/start', label:'New', icon:PlusCircle },
  { href:'/dashboard', label:'Stories', icon:FolderOpen },
  { href:'/account', label:'Account', icon:User },
]

export default function TabBar(){
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[color:rgba(247,245,239,0.9)] backdrop-blur" aria-label="App tabs">
      <ul className="flex justify-around py-2">
        {tabs.map(t=>{
          const active = pathname === t.href
          const Icon = t.icon
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? 'page': undefined} className="flex flex-col items-center text-[11px] font-medium relative px-2 py-1 focus:outline-none focus-visible:underline">
                <span className="absolute inset-[-6px]" aria-hidden />
                <Icon size={20} className="mb-0.5" />
                {t.label}
                {active && <span aria-hidden className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[var(--brand)]" />}
                <span className="sr-only">{active? '(Current)': ''}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
