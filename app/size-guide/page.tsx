import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "尺码指南 · MaxLuLu AI",
  description: "找到最适合你的 MaxLuLu 裙装尺码，附腰围、臀围、裙长对照表。",
};

const SIZE_ROWS: {
  size: string;
  waist: string;
  hip: string;
  length: string;
  weight: string;
}[] = [
  { size: "XS", waist: "60-64", hip: "84-88", length: "45-50", weight: "40-45" },
  { size: "S", waist: "64-68", hip: "88-92", length: "48-53", weight: "45-50" },
  { size: "M", waist: "68-72", hip: "92-96", length: "50-55", weight: "50-57" },
  { size: "L", waist: "72-78", hip: "96-102", length: "52-57", weight: "57-65" },
  { size: "XL", waist: "78-84", hip: "102-108", length: "54-59", weight: "65-75" },
  { size: "XXL", waist: "84-90", hip: "108-114", length: "56-61", weight: "75-85" },
];

const STEPS: {
  title: string;
  desc: string;
  icon: (props: { className?: string }) => React.ReactElement;
}[] = [
  {
    title: "腰围",
    desc: "自然站立，软尺绕腰部最细处一圈",
    icon: WaistIcon,
  },
  {
    title: "臀围",
    desc: "软尺绕臀部最丰满处一圈",
    icon: HipIcon,
  },
  {
    title: "裙长",
    desc:
      "从腰线量到膝盖上方（A 字裙 / 百褶裙）或膝盖下方（鱼尾裙 / 直筒裙）",
    icon: LengthIcon,
  },
];

const TIPS = [
  "建议在内衣外测量，不要过紧或过松",
  "如果介于两个尺码之间，建议选大一号",
  "不同裙型版型略有差异，A 字裙和百褶裙偏宽松，鱼尾裙和直筒裙偏修身",
];

export default function SizeGuidePage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-4 py-3 backdrop-blur sm:px-6 sm:py-4">
        <Link
          href="/"
          title="返回首页"
          className="flex items-center gap-1.5 sm:gap-2"
        >
          <span aria-hidden className="text-gray-400">
            ←
          </span>
          <span className="h-7 w-7 rounded-xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] sm:h-8 sm:w-8" />
          <span className="text-base font-semibold tracking-tight sm:text-lg">
            MaxLuLu <span className="text-[#C084FC]">AI</span>
          </span>
        </Link>
        <Link
          href="/design"
          className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-4 py-1.5 text-sm font-medium text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95 sm:px-5 sm:py-2"
        >
          开始设计
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {/* 标题区 */}
        <section className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-4 py-1.5 text-xs font-medium text-[#C084FC]">
            📏 Size Guide
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-4xl">
            尺码指南
          </h1>
          <p className="mt-3 text-sm text-gray-500 sm:text-base">
            找到最适合你的尺码
          </p>
        </section>

        {/* 尺码对照表 */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            尺码对照表
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            横向滑动查看完整表格 · 单位：cm / kg
          </p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-gray-100 shadow-[0_20px_60px_-30px_rgba(192,132,252,0.2)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10">
                    <Th>尺码</Th>
                    <Th>腰围 (cm)</Th>
                    <Th>臀围 (cm)</Th>
                    <Th>裙长 (cm)</Th>
                    <Th>体重参考 (kg)</Th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_ROWS.map((r) => (
                    <tr
                      key={r.size}
                      className="border-t border-gray-100 transition hover:bg-gradient-to-r hover:from-[#FF6B9D]/5 hover:to-[#C084FC]/5"
                    >
                      <Td
                        className="font-bold bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-transparent"
                      >
                        {r.size}
                      </Td>
                      <Td>{r.waist}</Td>
                      <Td>{r.hip}</Td>
                      <Td>{r.length}</Td>
                      <Td>{r.weight}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 如何测量 */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
            如何测量
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            准备一条软尺，按以下 3 步测量即可
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#C084FC]/40 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B9D]/10 to-[#C084FC]/10">
                      <Icon className="text-[#C084FC]" />
                    </div>
                    <span className="text-xs font-semibold text-gray-300">
                      Step {i + 1}
                    </span>
                  </div>
                  <div className="text-base font-semibold text-gray-900">
                    {step.title}
                  </div>
                  <div className="mt-2 text-xs leading-relaxed text-gray-500">
                    {step.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 温馨提示 */}
        <section className="mt-12">
          <div className="rounded-3xl border border-[#C084FC]/20 bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/10 p-6 sm:p-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] text-xs font-bold text-white">
                !
              </span>
              <h2 className="text-base font-semibold text-gray-900">
                温馨提示
              </h2>
            </div>
            <ul className="space-y-2.5">
              {TIPS.map((t) => (
                <li key={t} className="flex items-start gap-2 text-sm text-gray-600">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#FF6B9D] to-[#C084FC]"
                  />
                  <span className="leading-relaxed">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 底部 CTA */}
        <section className="mt-12 text-center">
          <Link
            href="/design"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-[#C084FC]/40 transition hover:-translate-y-0.5 hover:opacity-95"
          >
            开始设计我的裙子 →
          </Link>
          <p className="mt-4 text-xs text-gray-400">
            选好尺码后，AI 为你生成专属印花
          </p>
        </section>
      </main>

      <footer className="py-10 text-center">
        <p className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-sm font-medium text-transparent">
          Fashion For You — 每一朵印花，都由你绽放
        </p>
      </footer>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold tracking-wide text-[#C084FC]">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
  );
}

function WaistIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M28 12 L52 12 L55 30 Q58 42 55 54 L52 72 L28 72 L25 54 Q22 42 25 30 Z" />
      <ellipse
        cx="40"
        cy="42"
        rx="18"
        ry="3.5"
        strokeDasharray="3 3"
        stroke="#FF6B9D"
      />
      <path d="M22 42 L18 42 M58 42 L62 42" stroke="#FF6B9D" />
    </svg>
  );
}

function HipIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M28 12 L52 12 L54 30 Q52 42 56 54 L60 72 L20 72 L24 54 Q28 42 26 30 Z" />
      <ellipse
        cx="40"
        cy="58"
        rx="22"
        ry="3.5"
        strokeDasharray="3 3"
        stroke="#FF6B9D"
      />
      <path d="M16 58 L12 58 M64 58 L68 58" stroke="#FF6B9D" />
    </svg>
  );
}

function LengthIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 80"
      width="32"
      height="32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M30 14 L50 14 L52 22 L28 22 Z" />
      <path d="M28 22 L18 64 L62 64 L52 22" />
      <path d="M18 64 Q40 70 62 64" />
      <g stroke="#FF6B9D">
        <line x1="70" y1="14" x2="70" y2="64" />
        <polyline points="66,18 70,14 74,18" />
        <polyline points="66,60 70,64 74,60" />
      </g>
    </svg>
  );
}
