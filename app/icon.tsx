import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 900,
          letterSpacing: -1,
          borderRadius: 6,
        }}
      >
        M
      </div>
    ),
    { ...size }
  );
}
