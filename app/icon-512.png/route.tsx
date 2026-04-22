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
          fontSize: 340,
          fontWeight: 900,
          letterSpacing: -10,
          borderRadius: 100,
        }}
      >
        M
      </div>
    ),
    { width: 512, height: 512 }
  );
}
