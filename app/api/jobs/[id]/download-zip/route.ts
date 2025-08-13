import { NextResponse } from "next/server";
// @ts-ignore - jszip types may not be present in build env
import JSZip from "jszip";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data: job } = await supabase
    .from("jobs")
    .select("id,user_id,result")
    .eq("id", params.id)
    .single();
  const images: string[] = (job as any)?.result?.images?.map((i: any) => i.url) ?? [];
  if (!images.length) return NextResponse.json({ error: "no_images" }, { status: 400 });
  const zip = new JSZip();
  let idx = 1;
  for (const url of images) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const ab = await res.arrayBuffer();
      const ext = url.split("?")[0].split(".").pop() || "jpg";
      zip.file(`colrvia-${params.id}-${String(idx).padStart(2, "0")}.${ext}`, ab);
      idx++;
    } catch {}
  }
  const out = await zip.generateAsync({ type: "uint8array" });
  const arrayBuffer = out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
  const blob = new Blob([arrayBuffer as ArrayBuffer], { type: 'application/zip' });
  return new NextResponse(blob, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": `attachment; filename=\"colrvia-${params.id}.zip\"`,
      "cache-control": "no-store",
    },
  });
}
