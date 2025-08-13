// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const { storyId, userId } = await req.json().catch(() => ({}));
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  await supabase
    .from("stories")
    .update({ status: "processing" })
    .eq("id", storyId)
    .eq("user_id", userId);

  try {
    // TODO: call your renderer with input from DB
    await new Promise((r) => setTimeout(r, 4000));
    const result = {
      images: [
        { url: "https://picsum.photos/seed/a/1600/900" },
        { url: "https://picsum.photos/seed/b/1600/900" },
        { url: "https://picsum.photos/seed/c/1600/900" },
        { url: "https://picsum.photos/seed/d/1600/900" },
      ],
      meta: { variations: 4, colorways: 2 },
    };
    await supabase
      .from("stories")
      .update({ status: "ready", result })
      .eq("id", storyId)
      .eq("user_id", userId);
  } catch (e) {
    await supabase
      .from("stories")
      .update({ status: "failed", error: String(e) })
      .eq("id", storyId)
      .eq("user_id", userId);
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "content-type": "application/json" },
  });
});
