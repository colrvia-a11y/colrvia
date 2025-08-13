import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { seedIndex } = await req.json().catch(() => ({})) as { seedIndex?: number };
  const { data: base } = await supabase.from("stories").select("input").eq("id", params.id).single();
  if (!base?.input) return NextResponse.json({ error: "missing_input" }, { status: 400 });

  const nextInput = { ...(base.input as any), seedIndex };
  const { data: created, error } = await supabase
    .from("stories")
    .insert({ user_id: user.id, status: "queued", input: nextInput })
    .select("id")
    .single();
  if (error || !created) return NextResponse.json({ error: "create_failed" }, { status: 500 });

  await supabase.functions.invoke("render-worker", { body: { storyId: created.id, userId: user.id } }).catch(() => {});
  return NextResponse.json({ storyId: created.id, accepted: true });
}
