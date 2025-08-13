export async function POST() {
  return Response.json({ sessionId: crypto.randomUUID() });
}
