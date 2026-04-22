import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FF6B9D, #C084FC)",
          color: "white",
          fontSize: 130,
          fontWeight: 900,
          letterSpacing: -4,
          borderRadius: 38,
        }}
      >
        M
      </div>
    ),
    { width: 192, height: 192 }
  );
}
