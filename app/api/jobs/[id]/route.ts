import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { data, error } = await supabase
    .from("jobs")
    .select("id,status,input,result,error")
    .eq("id", params.id)
    .single();
  if (error || !data) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(data);
}
