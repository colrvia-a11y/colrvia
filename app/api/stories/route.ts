import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";

const normalizeBrand = (b: string) => {
  const s = b.trim().toLowerCase();
  if (["sherwin-williams", "sherwin_williams", "sw", "sherwin"].includes(s)) return "sherwin_williams";
  if (["behr", "behr®", "behr paint"].includes(s)) return "behr";
  return s;
};

const BrandSchema = z
  .string()
  .transform(normalizeBrand)
  .refine((v) => v === "sherwin_williams" || v === "behr", "brand must be sherwin_williams or behr");

const DesignerSchema = z.enum(["marisol", "emily", "zane"]).default("marisol");

const BodySchema = z.object({
  brand: BrandSchema.default("sherwin_williams"),
  designerKey: DesignerSchema,
  vibe: z.string().optional(),
  lighting: z.enum(["daylight", "evening", "mixed"]).optional(),
  room: z.string().optional(),
  inputs: z.record(z.any()).optional(),
});

export async function POST(req: Request) {
  const supabase = supabaseServer();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    console.error("AUTH_MISSING", userErr);
    return NextResponse.json({ error: "AUTH_MISSING" }, { status: 401 });
  }

  let parsed: z.infer<typeof BodySchema>;
  try {
    const body = await req.json();
    parsed = BodySchema.parse(body);
  } catch (e) {
    const zerr = e as z.ZodError;
    const issues = zerr.issues?.map((i) => ({ path: i.path.join("."), message: i.message }));
    console.warn("INVALID_INPUT", issues);
    return NextResponse.json({ error: "INVALID_INPUT", issues }, { status: 422 });
  }

  const payload = {
    user_id: user.id,
    designer_key: parsed.designerKey,
    brand: parsed.brand,
    inputs: {
      vibe: parsed.vibe ?? null,
      lighting: parsed.lighting ?? null,
      room: parsed.room ?? null,
      ...(parsed.inputs ?? {}),
    },
  title: parsed.vibe ? `${parsed.vibe} Palette` : 'Color Story',
  vibe: parsed.vibe ?? null,
    palette: [],
    narrative: null,
    has_variants: false,
    status: "new",
  };

  const { data: row, error } = await supabase
    .from("stories")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("DB_INSERT_FAILED", {
      code: (error as any).code,
      message: error.message,
      details: (error as any).details,
      hint: (error as any).hint,
      payloadKeys: Object.keys(payload),
      brand: payload.brand,
    });
    const status = /check constraint/i.test(error.message) ? 400 : 500;
    return NextResponse.json({ error: "DB_INSERT_FAILED", detail: error.message }, { status });
  }

  return NextResponse.json({ id: row.id }, { status: 201 });
}
