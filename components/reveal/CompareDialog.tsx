"use client";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/Dialog";
import Image from "next/image";
export function CompareDialog({ a, b, open, onOpenChange }:{ a:{url:string}; b:{url:string}; open?:boolean; onOpenChange?:(v:boolean)=>void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Compare</DialogTitle>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <Image src={a.url} alt="Option A" width={800} height={450} className="w-full h-auto rounded-md" />
          <Image src={b.url} alt="Option B" width={800} height={450} className="w-full h-auto rounded-md" />
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <DialogClose className="rounded-xl border px-3 py-2 text-sm">Close</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
