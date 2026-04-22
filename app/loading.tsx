export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF6B9D]/5 via-white to-[#C084FC]/10 px-6">
      <div className="flex items-center gap-3">
        <SpinningFlower />
        <span className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          MaxLuLu AI
        </span>
      </div>
      <p className="mt-4 text-xs text-gray-400">Fashion For You</p>
    </div>
  );
}

function SpinningFlower() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="28"
      height="28"
      className="h-7 w-7 animate-spin text-[#C084FC]"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="12" cy="4.5" r="2.2" />
      <circle cx="18.5" cy="9.5" r="2.2" />
      <circle cx="16" cy="18" r="2.2" />
      <circle cx="8" cy="18" r="2.2" />
      <circle cx="5.5" cy="9.5" r="2.2" />
      <circle cx="12" cy="12" r="1.8" fillOpacity="0.45" />
    </svg>
  );
}
