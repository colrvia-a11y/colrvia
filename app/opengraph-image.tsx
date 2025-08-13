import { ImageResponse } from "next/og";
export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OG() {
  return new ImageResponse(
    (<div style={{ fontSize: 72, background: "#fff", color: "#111", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ padding: 40, borderRadius: 24, border: "4px solid #111" }}>Colrvia</div>
    </div>), { ...size }
  );
}
