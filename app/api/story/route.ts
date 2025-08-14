import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseServer } from "@/lib/supabase/server";

function idemKey(payload: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex")
    .slice(0, 24);
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const idempotency_key = idemKey({ u: user.id, b: body });

  // Return existing story for duplicate clicks
  const { data: existing } = await supabase
    .from("stories")
    .select("id")
    .eq("user_id", user.id)
    .eq("idempotency_key", idempotency_key)
    .single();

  if (existing?.id) {
    return NextResponse.json({ storyId: existing.id, accepted: true, duplicate: true });
  }

  const title =
    (typeof body?.["title"] === "string" && (body as any).title) ||
    `${(body as any)?.style ?? (body as any)?.room ?? "Design"} concept`;

  const { data: created, error } = await supabase
    .from("stories")
    .insert({
      user_id: user.id,
      title,
      status: "queued",
      input: body,
      idempotency_key,
    })
    .select("id")
    .single();

  if (error || !created) {
    return NextResponse.json({ error: "create_failed" }, { status: 500 });
  }

  // OPTIONAL: kick your render worker so it updates this story later
  // Swap to your actual function/queue name if different.
  await supabase.functions
    .invoke("render-worker", { body: { storyId: created.id, userId: user.id } })
    .catch(() => {
      /* fire-and-forget */
    });

  return NextResponse.json({ storyId: created.id, accepted: true });
}
