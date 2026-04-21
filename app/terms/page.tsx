import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "用户服务协议 · MaxLuLu AI",
  description:
    "MaxLuLu AI 用户服务协议，包含账号使用、AI 生成内容归属、订单支付、定制商品退换规则等条款。",
};

const UPDATED = "2026 年 4 月 22 日";

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: "服务简介",
    paragraphs: [
      "MaxLuLu AI 是由上海禄创企业管理有限公司（以下简称「我们」「本平台」）运营的 AI 印花设计与定制服务平台。我们为用户提供基于人工智能技术的印花图案生成、裙装定制下单与履约等一体化服务。",
      "本协议是你与我们之间就使用 MaxLuLu AI 服务订立的协议。在使用服务之前，请务必仔细阅读并充分理解本协议的全部内容。一旦你注册、登录或以其他方式使用本平台，即视为你已阅读并同意接受本协议的全部约束。",
    ],
  },
  {
    title: "账号注册与使用",
    paragraphs: [
      "你可以使用中国大陆手机号注册 MaxLuLu AI 账号。注册时你应提供真实、准确、完整的信息，不得冒用他人身份或使用虚假信息。",
      "账号的安全由你本人负责。你应妥善保管账号信息和登录凭证，避免与他人共享。通过你的账号进行的所有操作均视为你本人行为，由此产生的一切法律责任由你本人承担。",
      "如发现账号被盗用或存在其他安全风险，你应第一时间联系我们处理。",
    ],
  },
  {
    title: "AI 生成内容",
    paragraphs: [
      "本平台使用人工智能模型根据你的文字描述生成印花图案。你通过本平台生成的印花设计作品版权归你所有，我们不对你的生成结果主张任何所有权。",
      "但为提供展示、推广与社区交流等服务所必需，在你选择公开或下单后，我们有权在本平台范围内展示、使用你的公开设计作品（例如作为首页作品灵感墙的素材），但会对相关内容进行脱敏处理。",
      "你承诺所输入的文字描述不包含违法违规、侵犯他人权利、色情暴力、政治敏感等内容，否则由此产生的一切后果由你自行承担。",
    ],
  },
  {
    title: "订单与支付",
    paragraphs: [
      "商品价格以你下单时页面显示的金额为准。促销活动期间的价格与常规价格可能不同，一切以下单当时的最终展示价格为准。",
      "付款方式由平台支付渠道提供，支付成功后即视为订单成立。由于定制商品的特殊性，订单一经支付原则上不可随意取消或退款，具体退款规则以下述《定制商品说明》条款为准。",
    ],
  },
  {
    title: "定制商品说明",
    paragraphs: [
      "MaxLuLu AI 提供的是按需定制的个性化裙装服务，每一件商品均根据你的 AI 印花方案、裙型、面料和尺码单独裁剪生产，不属于现货商品。",
      "非质量问题不支持七天无理由退换。如果你收到的商品存在明显质量问题（如面料破损、印花严重色差、尺码严重不符等），请在收货后 7 天内联系客服，我们会根据具体情况提供重做、补偿或退款方案。",
      "请在下单前仔细阅读《尺码指南》，并核对印花描述与选择的裙型、面料、尺码信息。",
    ],
  },
  {
    title: "知识产权",
    paragraphs: [
      "你承诺输入给 AI 的描述以及通过其他方式上传到本平台的任何内容，均由你合法拥有或已获得合法授权，不侵犯任何第三方的著作权、商标权、专利权、肖像权、名誉权等合法权益。",
      "若我们合理认为你的输入或生成内容涉嫌侵权、违法或违反公序良俗，有权在不经通知的情况下删除相关内容、暂停或终止对你的服务，并保留追究相关责任的权利。",
      "本平台 UI、文案、品牌标识、交互设计、技术实现等均为我们所有或合法授权使用，未经允许不得复制、改编或用于商业用途。",
    ],
  },
  {
    title: "免责声明",
    paragraphs: [
      "AI 生成的印花图案属于生成式人工智能的概率性输出，其细节、色彩、构图与你的文字描述之间可能存在差异。我们不对 AI 生成结果与你主观预期的完全一致做出承诺或保证。",
      "实际印花效果以成品为准。由于面料材质、染色工艺、显示设备色差等客观因素，成品的色彩与屏幕显示可能存在一定差异，属于正常现象。",
      "因不可抗力、系统维护、第三方服务（如 AI 生成服务、支付渠道、物流）的不稳定等原因，可能导致服务的中断或延迟，我们将尽合理努力告知并恢复服务，但不承担由此产生的间接损失。",
    ],
  },
  {
    title: "协议修改",
    paragraphs: [
      "我们可能会根据业务发展、法律法规变化或用户反馈，不定期修改本协议。修改后的协议将在本平台公示，自公示之日起生效。",
      "对于重大变更（如影响用户核心权利的条款），我们会通过站内消息、短信或其他合理方式提前通知你。如你不同意修改后的协议，应停止使用本平台服务；你在协议修改生效后继续使用服务，即视为你接受修改后的全部内容。",
    ],
  },
  {
    title: "联系方式",
    paragraphs: [
      "如果你对本协议内容有任何疑问、意见或建议，或需要行使本协议下的任何权利，可以通过以下方式联系我们：",
      "运营主体：上海禄创企业管理有限公司",
    ],
  },
];

export default function TermsPage() {
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
          href="/privacy"
          className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:px-4 sm:py-2"
        >
          隐私政策
        </Link>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 sm:px-8 sm:py-12">
        <section className="mb-10 border-b border-gray-100 pb-8">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-4 py-1.5 text-xs font-medium text-[#C084FC]">
            用户协议
          </span>
          <h1 className="mt-4 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
            MaxLuLu AI 用户服务协议
          </h1>
          <p className="mt-3 text-xs text-gray-500 sm:text-sm">
            更新日期：{UPDATED}
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
            继续使用 MaxLuLu AI 即表示你已阅读并同意本协议的全部内容
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#C084FC]/30 transition hover:opacity-95"
            >
              返回首页
            </Link>
            <Link
              href="/privacy"
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:border-[#C084FC] hover:text-[#C084FC]"
            >
              查看隐私政策
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
