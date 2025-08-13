"use client"
import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, Button } from '@/components/ui'
import HowItWorksContent from './HowItWorksContent'
import { track } from '@/lib/analytics'
import { useEventTimer } from '@/lib/analytics/useEventTimer'
import { ArrowLeft } from 'lucide-react'

type Props = { open: boolean; onOpenChange: (v: boolean) => void; origin?: string }
export default function HowItWorksModal({ open, onOpenChange, origin='unknown' }: Props) {
  const timer = useEventTimer()
  const closeActionRef = React.useRef<"back" | "dismiss" | null>(null)

  React.useEffect(()=>{
    if(open){
      timer.start();
      try { track('howitworks_modal_open', { origin }) } catch {}
    } else {
      const ms = timer.stop();
      if(closeActionRef.current){
        try { track('howitworks_modal_close', { origin, action: closeActionRef.current, ms }) } catch {}
        closeActionRef.current = null;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[open])

  function handleBack(){
    closeActionRef.current = 'back';
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(v)=>{ if(!v) closeActionRef.current = closeActionRef.current ?? 'dismiss'; onOpenChange(v) }}>
      <DialogContent className="w-[96vw] max-w-3xl md:w-[85vw] md:max-w-4xl h-[85vh]">
        <DialogHeader className="flex items-center justify-between">
          <button type="button" aria-label="Back" onClick={handleBack} className="rounded-full border bg-background p-2 hover:bg-accent">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <DialogTitle>How it works</DialogTitle>
          <span className="w-8" aria-hidden />
        </DialogHeader>
        <div className="overflow-auto pr-1">
          <HowItWorksContent compact />
          <div className="mt-6">
            <Button as={"a"} href="/start/interview-intro" variant="primary" onClick={()=>{ const ms = timer.peek(); try { track('howitworks_start', { where:'modal', origin, ms }) } catch {} }}>Start Color Story</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
