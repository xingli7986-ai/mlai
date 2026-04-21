import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-24 -z-0 mx-auto h-72 w-72 rounded-full bg-gradient-to-br from-[#FF6B9D]/30 to-[#C084FC]/30 blur-3xl" />

      <div className="relative">
        <LostSkirt />
      </div>

      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-4 py-1.5 text-xs font-medium text-[#C084FC]">
        404 · Not Found
      </span>
      <h1 className="mt-5 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
        页面走丢了
      </h1>
      <p className="mt-4 max-w-sm text-sm text-gray-500 sm:text-base">
        这条走丢的小裙子找不到回家的路，不如一起回首页继续设计？
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-8 py-3 text-base font-semibold text-white shadow-xl shadow-[#C084FC]/40 transition hover:-translate-y-0.5 hover:opacity-95"
        >
          回到首页 →
        </Link>
        <Link
          href="/design"
          className="rounded-full border border-gray-200 bg-white px-6 py-3 text-base font-medium text-gray-700 transition hover:border-[#C084FC] hover:text-[#C084FC]"
        >
          开始设计
        </Link>
      </div>

      <p className="mt-12 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-xs font-medium text-transparent">
        Fashion For You — 每一朵印花，都由你绽放
      </p>
    </main>
  );
}

function LostSkirt() {
  return (
    <svg
      viewBox="0 0 220 220"
      width="200"
      height="200"
      aria-hidden
      className="drop-shadow-[0_10px_30px_rgba(192,132,252,0.35)]"
    >
      <defs>
        <linearGradient id="skirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>
        <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFE4C4" />
          <stop offset="100%" stopColor="#FFC99E" />
        </linearGradient>
      </defs>

      {/* Question mark balloon floating above */}
      <g transform="translate(160, 22)">
        <circle cx="14" cy="14" r="18" fill="#ffffff" stroke="#C084FC" strokeWidth="2" />
        <text
          x="14"
          y="20"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="#C084FC"
          fontFamily="system-ui, sans-serif"
        >
          ?
        </text>
        <path
          d="M6 30 L0 42 L10 34"
          fill="#ffffff"
          stroke="#C084FC"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>

      {/* Waistband */}
      <rect
        x="80"
        y="60"
        width="60"
        height="14"
        rx="3"
        fill="#374151"
      />

      {/* Belt buckle */}
      <circle cx="110" cy="67" r="2.5" fill="#fbbf24" />

      {/* Skirt body (A-line) with gradient */}
      <path
        d="M80 74 L60 180 L160 180 L140 74 Z"
        fill="url(#skirtGrad)"
        stroke="#111827"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Scalloped hem */}
      <path
        d="M60 180 Q 70 192 85 180 Q 100 192 115 180 Q 130 192 145 180 Q 155 192 160 180"
        fill="url(#skirtGrad)"
        stroke="#111827"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Pleat suggestion lines */}
      <line
        x1="95"
        y1="76"
        x2="82"
        y2="178"
        stroke="#111827"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <line
        x1="110"
        y1="76"
        x2="110"
        y2="178"
        stroke="#111827"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />
      <line
        x1="125"
        y1="76"
        x2="138"
        y2="178"
        stroke="#111827"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* Two little polka dots */}
      <circle cx="95" cy="115" r="3.5" fill="#ffffff" fillOpacity="0.85" />
      <circle cx="125" cy="140" r="2.8" fill="#ffffff" fillOpacity="0.85" />

      {/* Tiny footprints (lost trail) */}
      <g fill="#C084FC" fillOpacity="0.45">
        <ellipse cx="30" cy="200" rx="4" ry="2.5" />
        <ellipse cx="42" cy="208" rx="4" ry="2.5" />
        <ellipse cx="54" cy="198" rx="4" ry="2.5" />
      </g>
    </svg>
  );
}
