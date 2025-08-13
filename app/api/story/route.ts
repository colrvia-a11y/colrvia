import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const IntakeSchema = z.object({
  room: z.string(),
  style: z.string(),
  budget: z.enum(["$", "$$", "$$$"]).optional(),
  prompt: z.string(),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = IntakeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT" }, { status: 422 });
  }

  const supabase = supabaseServer();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (!user || userErr) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      designer_key: "default",
      brand: "sherwin_williams",
      inputs: parsed.data,
      status: "new",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "CREATE_FAILED" }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
