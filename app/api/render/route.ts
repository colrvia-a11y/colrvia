import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  // TODO: enqueue render job with your provider; return jobId from backend
  const jobId = `job_${Math.random().toString(36).slice(2, 10)}`;
  return NextResponse.json({ jobId, accepted: true });
}

// Optional GET to check status if you want to poll
export async function GET() {
  // This mock always claims "ready"
  return NextResponse.json({ status: "ready" });
}
