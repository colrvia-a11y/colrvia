"use client"
import Link from 'next/link'
import { User } from 'lucide-react'
import { motion } from 'framer-motion'
import React from 'react'
import { track } from '@/lib/analytics'

export default function AccountIcon(){
  return (
    <motion.div whileTap={{ scale:0.95 }}>
      <Link href="/account" aria-label="Account" className="block" onClick={()=> track('nav_click',{ dest:'/account' })}>
        <div className="rounded-full border bg-[var(--bg-surface)]/80 p-2 backdrop-blur hover:bg-[var(--color-linen)]/70 transition-colors">
          <User className="h-5 w-5 text-[var(--ink-subtle)]" />
        </div>
      </Link>
    </motion.div>
  )
}
