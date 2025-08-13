"use client";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export function Dialog({ open, onOpenChange, children }: { open?: boolean; onOpenChange?: (v:boolean)=>void; children: React.ReactNode }) {
  return <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>{children}</DialogPrimitive.Root>;
}
export function DialogTrigger(props: React.ComponentProps<typeof DialogPrimitive.Trigger>) { return <DialogPrimitive.Trigger {...props} />; }
export function DialogContent({ children, className="" }: { children: React.ReactNode; className?: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out" />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={`fixed left-1/2 top-1/2 w-[min(92vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-paper p-4 shadow-lg focus:outline-none ${className}`}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
export function DialogTitle(props: React.ComponentProps<typeof DialogPrimitive.Title>) { return <DialogPrimitive.Title className="text-lg font-semibold" {...props} />; }
export function DialogClose(props: React.ComponentProps<typeof DialogPrimitive.Close>) { return <DialogPrimitive.Close {...props} />; }
export function DialogHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mb-4 space-y-1 ${className}`}>{children}</div>;
}
