import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 · MaxLuLu AI",
  description:
    "MaxLuLu AI 隐私政策，说明我们如何收集、使用、存储、保护你的个人信息与设计数据。",
};

const UPDATED = "2026 年 4 月 22 日";

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "信息收集",
    paragraphs: [
      "为了向你提供 MaxLuLu AI 的核心服务，我们会收集以下几类必要信息：",
      "账号信息：你在注册、登录时提供的手机号码，用于验证身份、保持登录态和接收重要通知。",
      "设计数据：你在设计页输入的文字描述、选择的风格预设、AI 为你生成的印花图案 URL、你选中的方案、裙型、面料与尺码等定制选择。",
      "订单信息：你下单时生成的订单号、订单金额、订单状态以及下单时间等交易记录。",
      "设备和使用数据：设备类型、操作系统版本、浏览器/客户端标识、IP 地址以及你在本平台内的页面访问与点击行为。这些信息帮助我们排查技术问题和改善服务。",
    ],
  },
  {
    title: "信息使用",
    paragraphs: [
      "我们使用收集到的信息主要用于：向你提供核心服务（账号登录、AI 印花生成、订单下单与履约、客服沟通等）；改善产品体验（通过分析使用数据优化生成质量、页面布局、商品选项）；履行订单（将你的定制信息传递给生产与物流合作方完成商品交付）；保障账号安全（防范异常登录、欺诈与滥用行为）；依据法律法规的要求履行合规义务。",
      "我们不会将你的个人信息用于上述目的之外的用途，除非事先获得你的明确同意或法律法规另有规定。",
    ],
  },
  {
    title: "信息存储与保护",
    paragraphs: [
      "你的数据存储在位于中国大陆或合作云服务商（如 AWS、Cloudflare、Neon 等）提供的数据库和对象存储服务中。我们采用行业通用的加密传输（HTTPS）与静态加密机制来保护传输与存储中的数据。",
      "我们会采取合理的技术与管理措施防止未经授权的访问、泄露、篡改或丢失，例如访问权限控制、操作日志审计、定期安全审查等。",
      "个人信息保存期限以实现本政策所述目的所必需的最短时间为准。在你注销账号后，我们会在合理期限内删除或匿名化你的个人信息，法律法规另有要求的除外。",
    ],
  },
  {
    title: "信息共享",
    paragraphs: [
      "我们不会向任何第三方出售你的个人信息。",
      "在以下必要场景下，我们可能与第三方共享部分信息：履行订单时，我们需要向生产合作方与物流服务商提供收件必要信息（收件人、电话、地址、商品规格）；使用第三方服务支持我们的核心功能（例如通过 Replicate 运行的 AI 生成服务、云存储服务）时，必要的脱敏请求数据会发送给服务商；根据法律法规的要求或有权机关的合法请求。",
      "我们仅在实现上述目的所必需的最小范围内共享信息，并要求第三方按照本政策和相关协议履行同等的保密与安全义务。",
    ],
  },
  {
    title: "AI 数据使用",
    paragraphs: [
      "你在设计页输入的文字描述会被发送给 AI 服务（当前为 Replicate 托管的 Flux 系列模型）用于生成印花图案。描述本身与生成的图片 URL 会与你的账号绑定保存在我们的数据库中，以便你查看历史设计与下单。",
      "我们不会使用你的输入或生成结果用于训练或微调任何 AI 模型，也不会将它们作为训练样本提供给第三方。",
      "我们会定期对历史生成图片进行清理或归档，已下单生成成品的图片会长期保留用于订单履约与售后取证。",
    ],
  },
  {
    title: "Cookie 与本地存储",
    paragraphs: [
      "我们使用 Cookie、localStorage 等浏览器/客户端本地存储技术来维持你的登录状态、记录你的偏好（如 Tab 筛选）、防御 CSRF 等安全攻击。",
      "你可以通过浏览器或客户端设置管理这些本地存储。禁用后可能导致部分功能无法正常使用（例如需要重复登录）。",
    ],
  },
  {
    title: "用户权利",
    paragraphs: [
      "你对自己的个人信息享有查阅、更正、删除与撤回同意的权利。",
      "你可以在「我的」页面查看手机号、头像、历史设计与订单；可以直接修改头像；如需更正其他信息或行使删除权，可通过本政策末尾的联系方式与我们取得联系。",
      "你也有权随时注销 MaxLuLu AI 账号。注销后我们会在合理期限内删除或匿名化你的个人信息。",
    ],
  },
  {
    title: "未成年人保护",
    paragraphs: [
      "MaxLuLu AI 面向成年用户提供服务，我们不会主动向未成年人（未满 18 周岁）收集或推广服务。",
      "如果你是未成年人，请在征得父母或法定监护人同意后再使用本服务。如果我们发现在未经监护人同意的情况下收集了未成年人的个人信息，会及时删除相关信息。",
    ],
  },
  {
    title: "政策更新",
    paragraphs: [
      "我们可能会不时更新本政策以反映服务变化或法律法规要求。更新后的政策会在本页面公示，并自公示之日起生效。",
      "对于重大变更，我们会通过站内消息、登录提醒或其他显著方式主动通知你。请定期查阅本政策以了解最新内容。",
    ],
  },
  {
    title: "联系方式",
    paragraphs: [
      "如对本隐私政策、你的个人信息处理方式或希望行使任何权利，欢迎与我们联系：",
      "运营主体：上海禄创企业管理有限公司",
    ],
  },
];

export default function PrivacyPage() {
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
          href="/terms"
          className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4 sm:py-2"
        >
          用户协议
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-10 border-b border-gray-100 pb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-4 py-1.5 text-xs font-medium text-[#C084FC]">
            隐私政策
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            MaxLuLu AI 隐私政策
          </h1>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            更新日期：{UPDATED}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            我们非常重视你的隐私。本政策旨在帮助你清楚了解：在使用 MaxLuLu AI
            过程中，我们会收集哪些信息、如何使用和保护这些信息、以及你享有的相关权利。
          </p>
        </section>

        <article className="space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.title}>
              <h2 className="mb-3 text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                {s.title}
              </h2>
              <div className="space-y-3 leading-loose text-gray-700">
                {s.paragraphs.map((p, i) => (
                  <p key={i} className="text-sm sm:text-[15px]">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </article>

        <div className="mt-14 rounded-2xl border border-gray-100 bg-gradient-to-br from-[#FF6B9D]/5 to-[#C084FC]/5 p-5 text-center sm:p-6">
          <p className="text-xs text-gray-500 sm:text-sm">
            本政策与《用户服务协议》一同构成你与 MaxLuLu AI 之间的完整协议
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95"
            >
              返回首页
            </Link>
            <Link
              href="/terms"
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#C084FC] hover:text-[#C084FC]"
            >
              查看用户协议
            </Link>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center">
        <p className="bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-sm font-medium text-transparent">
          Fashion For You — 每一朵印花，都由你绽放
        </p>
      </footer>
    </div>
  );
}
