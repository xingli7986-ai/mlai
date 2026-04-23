"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
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
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isValidPhone = /^1[3-9]\d{9}$/.test(phone);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startCountdown() {
    setCountdown(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function sendCode(): Promise<boolean> {
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setError(
          typeof data?.error === "string" ? data.error : "验证码发送失败，请稍后再试"
        );
        return false;
      }
      startCountdown();
      return true;
    } catch {
      setError("网络错误，请稍后再试");
      return false;
    } finally {
      setSending(false);
    }
  }

  async function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidPhone) {
      setError("请输入有效的 11 位手机号");
      return;
    }
    const ok = await sendCode();
    if (ok) setStep("code");
  }

  async function handleResend() {
    if (countdown > 0 || sending) return;
    await sendCode();
  }

  async function handleCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (code.length !== 6) {
      setError("请输入 6 位验证码");
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
      setError("验证码错误或已过期");
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
              disabled={!isValidPhone || sending}
              className="w-full rounded-xl bg-gradient-to-r from-[#FF6B9D] to-[#C084FC] py-3 text-base font-medium text-white shadow-lg shadow-[#C084FC]/30 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sending ? "发送中..." : "获取验证码"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-600">验证码</span>
              <div className="mt-1 flex items-stretch gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="请输入短信验证码"
                  className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-xl tracking-[0.35em] text-gray-900 outline-none transition focus:border-[#C084FC] focus:ring-2 focus:ring-[#C084FC]/30"
                />
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={countdown > 0 || sending}
                  className="shrink-0 rounded-xl border border-[#C084FC]/40 bg-white px-3 text-sm font-medium text-[#C084FC] transition hover:bg-[#C084FC]/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {countdown > 0
                    ? `${countdown}s后重发`
                    : sending
                      ? "发送中"
                      : "发送验证码"}
                </button>
              </div>
            </label>
            {error && <p className="text-sm text-rose-500">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
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
