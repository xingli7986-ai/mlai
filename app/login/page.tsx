"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

type Step = "phone" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidPhone = /^1[3-9]\d{9}$/.test(phone);

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidPhone) {
      setError("请输入有效的 11 位手机号");
      return;
    }
    setStep("code");
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length !== 4) {
      setError("请输入 4 位验证码");
      return;
    }
    setLoading(true);
    const res = await signIn("credentials", {
      phone,
      code,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("验证码错误，请输入 1234");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white px-4 py-8 sm:py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-[0_20px_60px_-20px_rgba(192,132,252,0.35)] ring-1 ring-black/5 sm:p-8">
        <div className="mb-6 flex flex-col items-center sm:mb-8">
          <div className="mb-3 h-12 w-12 rounded-2xl bg-gradient-to-br from-[#FF6B9D] to-[#C084FC] sm:h-14 sm:w-14" />
          <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
            欢迎来到 Maxlulu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {step === "phone" ? "请输入你的手机号" : `验证码已发送至 ${phone}`}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-600">手机号</span>
              <input
                type="tel"
                inputMode="numeric"
                autoFocus
                maxLength={11}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
                }
                placeholder="13800138000"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-[#C084FC] focus:ring-2 focus:ring-[#C084FC]/30"
              />
            </label>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={!isValidPhone}
              className="w-full rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] py-3 text-base font-medium text-white shadow-lg shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              获取验证码
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-600">验证码</span>
              <input
                type="text"
                inputMode="numeric"
                autoFocus
                maxLength={4}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="1234"
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-2xl tracking-[0.6em] text-gray-900 outline-none transition focus:border-[#C084FC] focus:ring-2 focus:ring-[#C084FC]/30"
              />
            </label>
            <p className="rounded-lg bg-gradient-to-r from-[#FF6B9D]/10 to-[#C084FC]/10 px-3 py-2 text-xs text-gray-600">
              MVP 测试阶段，请输入验证码 <span className="font-semibold text-[#C084FC]">1234</span>
            </p>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 4}
              className="w-full rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] py-3 text-base font-medium text-white shadow-lg shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "登录中..." : "登录"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
              }}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
            >
              返回修改手机号
            </button>
          </form>
        )}
      </div>

      <p className="mt-5 max-w-sm px-4 text-center text-xs leading-relaxed text-gray-400">
        登录即表示同意
        <Link
          href="/terms"
          className="text-[#C084FC] hover:underline"
        >
          《用户协议》
        </Link>
        和
        <Link
          href="/privacy"
          className="text-[#C084FC] hover:underline"
        >
          《隐私政策》
        </Link>
      </p>

      <p className="mt-8 bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] bg-clip-text text-center text-sm font-medium text-transparent">
        Fashion For You — 每一朵印花，都由你绽放
      </p>
    </main>
  );
}
