"use client"
import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import HowItWorksContent from './HowItWorksContent'

export default function HowItWorksModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>How it works</DialogTitle>
        </DialogHeader>
        <div>
          <HowItWorksContent compact />
        </div>
      </DialogContent>
    </Dialog>
  )
}
