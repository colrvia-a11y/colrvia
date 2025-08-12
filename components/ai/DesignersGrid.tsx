"use client"
import { Card, Button } from '@/components/ui'
import { designers } from "@/lib/ai/designers"
import Link from "next/link"
import { track } from "@/lib/analytics"
import { motion } from 'framer-motion'

export default function DesignersGrid(){
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {designers.map(d => (
        <motion.div key={d.id} whileHover={{ y:-4, rotate:-0.25 }} transition={{ type:'spring', stiffness:260, damping:20 }}>
        <Card className="group rounded-2xl shadow-sm border hover:shadow-md transition-shadow p-5 flex flex-col h-full">
          <div className="text-5xl mb-3" aria-hidden>{d.avatar}</div>
          <h2 className="text-xl font-medium">{d.name}</h2>
          <p className="text-sm text-muted-foreground mb-4">{d.tagline}</p>
          {d.pro && <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-black text-white px-2 py-1 rounded-full w-fit mb-3">Pro</span>}
          <div className="mt-auto">
            <Button
              as={Link}
              href={d.id === 'therapist' ? '/intake' : `/preferences/${d.id}`}
              className="w-full"
              onClick={() => track('designer_select', { designerId: d.id })}
              aria-label={`Start with ${d.name}`}
            >
              Start with {d.short}
            </Button>
          </div>
        </Card>
        </motion.div>
      ))}
    </div>
  )
}
