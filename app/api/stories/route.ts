import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const supabase = supabaseServer();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    console.error("POST /api/stories auth error:", userErr);
    return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 });
  }

  const payload = {
    user_id: user.id,
    designer_key: body.designer_key ?? "marisol",
    brand: body.brand ?? "sherwin_williams",
    inputs: body.inputs ?? {},
    palette: body.palette ?? {},
    narrative: body.narrative ?? null,
    has_variants: body.has_variants ?? false,
    status: body.status ?? "new",
  };

  const { data, error } = await supabase
    .from("stories")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("DB_INSERT_FAILED /stories:", {
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      payloadKeys: Object.keys(payload),
    });
    return NextResponse.json(
      { ok: false, error: "DB_INSERT_FAILED", message: error.message, details: (error as any).details },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, story: data }, { status: 201 });
}
