import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { supabaseServer } from "@/lib/supabase/server";

function hashIdem(payload: unknown) {
	return crypto
		.createHash("sha256")
		.update(JSON.stringify(payload))
		.digest("hex")
		.slice(0, 24);
}

// POST /api/render  -> create (or reuse) a job
export async function POST(req: Request) {
	const supabase = supabaseServer();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

	const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
	const idempotency_key = hashIdem({ user: user.id, body });

	// Try find existing job (idempotent retrieval)
	const { data: existing } = await supabase
		.from("jobs")
		.select("id,status")
		.eq("user_id", user.id)
		.eq("idempotency_key", idempotency_key)
		.single();
	if (existing) {
		return NextResponse.json({ jobId: existing.id, accepted: true, reused: true });
	}

	const { data: job, error } = await supabase
		.from("jobs")
		.insert({ user_id: user.id, status: "queued", input: body, idempotency_key })
		.select("id")
		.single();
	if (error || !job) return NextResponse.json({ error: "failed_to_create_job" }, { status: 500 });

	// Fire the worker (Edge Function) asynchronously; failures here don't block creation
	try {
		await supabase.functions.invoke("render-worker", { body: { jobId: job.id, userId: user.id } });
	} catch {
		// swallow; worker infra might enqueue separately; job remains queued
	}

	return NextResponse.json({ jobId: job.id, accepted: true });
}

// GET /api/render?id=...  -> polling fallback for status/result
export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const id = searchParams.get("id");
	if (!id) return NextResponse.json({ error: "missing_id" }, { status: 400 });
	const supabase = supabaseServer();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
	const { data } = await supabase
		.from("jobs")
		.select("id,status,result,error")
		.eq("id", id)
		.eq("user_id", user.id)
		.single();
	if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
	return NextResponse.json(data);
}
