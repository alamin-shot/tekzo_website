"use client";

import Banner from "@/Components/ReuseableComponent/Banner";
import { useState, useRef, useCallback, useEffect } from "react";
import type { ClipboardEvent, KeyboardEvent } from "react";
import type { IntervalHandle } from "@/types/props/checkout";
import { errMessage, rec } from "@/lib/json";
import { nodeOf } from "@/lib/render";

const STEPS = { EMAIL: 1, OTP: 2, PASSWORD: 3, SUCCESS: 4 };

export default function ForgotPassword() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<unknown>("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState<unknown>("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState<unknown>("");
  const [showPass, setShowPass] = useState(false);
  const [showPassConfirm, setShowPassConfirm] = useState(false);
  const [timer, setTimer] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [resendVisible, setResendVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<IntervalHandle | null>(null);

  const startTimer = useCallback(() => {
    setTimer(60);
    setTimerActive(true);
    setResendVisible(false);
    clearInterval(timerRef.current ?? undefined);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current ?? undefined);
          setTimerActive(false);
          setResendVisible(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearInterval(timerRef.current ?? undefined), []);

  const validateEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  /* ── Safe fetch helper ── */
  const safePost = async (url: string, body: unknown): Promise<unknown> => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data: unknown = {};
    try {
      data = JSON.parse(text);
    } catch {
      /* server returned HTML/non-JSON */
    }
    if (!res.ok)
      throw new Error(
        String(rec(data)?.message || `Request failed (${res.status}). Please try again.`),
      );
    return data;
  };

  /* ── STEP 1: Send OTP ── */
  const handleSendCode = async () => {
    if (!email.trim()) {
      setEmailError("Please enter your email address.");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await safePost(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email },
      );
      setStep(STEPS.OTP);
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setEmailError(errMessage(err) || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── OTP helpers ── */
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setOtpError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setOtp(next);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  /* ── STEP 2: Verify OTP → POST { email, otp } ── */
  const handleVerify = async () => {
    if (otp.join("").length < 6) {
      setOtpError("Please enter all 6 digits.");
      return;
    }
    setOtpError("");
    setLoading(true);
    try {
      await safePost(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp`, {
        email,
        otp: otp.join(""),
      });
      clearInterval(timerRef.current ?? undefined);
      setStep(STEPS.PASSWORD);
    } catch (err) {
      setOtpError(errMessage(err) || "Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setOtpError("");
    setLoading(true);
    try {
      await safePost(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
        { email },
      );
      startTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setOtpError(errMessage(err) || "Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 3: Save new password → POST { email, otp, password, password_confirmation } ── */
  const handleResetPassword = async () => {
    setPasswordError("");
    if (!password) {
      setPasswordError("Please enter a new password.");
      return;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (password !== passwordConfirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await safePost(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/confirm-password`,
        {
          email,
          otp: otp.join(""),
          password,
          password_confirmation: passwordConfirm,
        },
      );
      setStep(STEPS.SUCCESS);
    } catch (err) {
      setPasswordError(
        errMessage(err) || "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isOtpFull = otp.every((d) => d !== "");
  const totalSteps = 4;

  return (
    <div className="">
      <Banner
        image={"/loginPage/contact-about-bg.webp"}
        title={"reset password"}
      />
      <div className="flex items-start pt-15  justify-center ">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm px-8 py-10">
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s
                    ? "bg-primary w-5"
                    : step > s
                      ? "bg-green-500 w-2"
                      : "bg-slate-200 w-2"
                }`}
              />
            ))}
          </div>

          {/* ── STEP 1: Email ── */}
          {step === STEPS.EMAIL && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <LockIcon className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-center text-slate-900 mb-1.5">
                Forgot password?
              </h1>
              <p className="text-sm text-slate-500 text-center leading-relaxed mb-7">
                Enter the email address linked to your account and we'll send
                you a verification code.
              </p>

              <label
                className="block text-xs font-medium text-slate-600 mb-1.5"
                htmlFor="fp-email"
              >
                Email address
              </label>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && handleSendCode()
                }
                className={`w-full h-11 px-3 text-sm rounded-xl border bg-slate-50 text-slate-900 outline-none transition-all
                focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                ${
                  emailError
                    ? "border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-400"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              />
              <div className="min-h-[18px] mt-1.5">
                {nodeOf(emailError && (
                  <p className="text-xs text-red-500">{nodeOf(emailError)}</p>
                ))}
              </div>

              <button
                onClick={handleSendCode}
                disabled={loading}
                className="w-full h-11 mt-3 rounded-xl bg-primary text-white text-sm font-semibold
                hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Spinner />}
                {loading ? "Sending..." : "Send verification code"}
              </button>

              <div className="text-center mt-4">
                <a
                  href="/login"
                  className="text-xs text-primary hover:underline underline-offset-2"
                >
                  ← Back to sign in
                </a>
              </div>
            </div>
          )}

          {/* ── STEP 2: OTP ── */}
          {step === STEPS.OTP && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <MailIcon className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-center text-slate-900 mb-1.5">
                Check your email
              </h1>
              <p className="text-sm text-slate-500 text-center leading-relaxed mb-7">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-slate-700">{email}</span>.
                Enter it below.
              </p>

              <label className="block text-xs font-medium text-slate-600 mb-3 text-center">
                Verification code
              </label>
              <div
                className="flex gap-2 justify-center"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-11 h-13 text-center text-lg font-semibold rounded-xl border outline-none transition-all
                    focus:ring-2 text-slate-900
                    ${
                      otpError
                        ? "border-red-400 bg-red-50 focus:ring-red-100"
                        : digit
                          ? "border-primary bg-primary/5 focus:ring-primary/20"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-primary focus:bg-white focus:ring-primary/20"
                    }`}
                  />
                ))}
              </div>
              <div className="min-h-[18px] mt-2 text-center">
                {nodeOf(otpError && <p className="text-xs text-red-500">{nodeOf(otpError)}</p>)}
              </div>

              <button
                onClick={handleVerify}
                disabled={!isOtpFull || loading}
                className={`w-full h-11 mt-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2
                ${
                  isOtpFull && !loading
                    ? "bg-primary text-white hover:bg-primary/90 active:scale-[0.99] cursor-pointer"
                    : "bg-primary/30 text-white cursor-not-allowed"
                }`}
              >
                {loading && <Spinner />}
                {loading ? "Verifying..." : "Verify code"}
              </button>

              {timerActive && (
                <p className="text-xs text-slate-400 text-center mt-4">
                  Resend code in{" "}
                  <span className="font-semibold text-slate-600 tabular-nums">
                    {timer}s
                  </span>
                </p>
              )}
              {resendVisible && (
                <div className="text-center mt-3">
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="text-xs text-primary hover:underline underline-offset-2 cursor-pointer disabled:opacity-50 flex items-center gap-1 mx-auto"
                  >
                    {loading && <Spinner size="sm" />}
                    Resend code →
                  </button>
                </div>
              )}

              <div className="text-center mt-3">
                <button
                  onClick={() => {
                    setStep(STEPS.EMAIL);
                    setOtp(["", "", "", "", "", ""]);
                    setOtpError("");
                    clearInterval(timerRef.current ?? undefined);
                  }}
                  className="text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  ← Change email
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === STEPS.PASSWORD && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <KeyIcon className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-xl font-semibold text-center text-slate-900 mb-1.5">
                Set new password
              </h1>
              <p className="text-sm text-slate-500 text-center leading-relaxed mb-7">
                Choose a new password for your account. It must be at least 8
                characters.
              </p>

              {/* New password */}
              <label
                className="block text-xs font-medium text-slate-600 mb-1.5"
                htmlFor="new-pass"
              >
                New password
              </label>
              <div className="relative">
                <input
                  id="new-pass"
                  type={showPass ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  className={`w-full h-11 px-3 pr-10 text-sm rounded-xl border bg-slate-50 text-slate-900 outline-none transition-all
                  focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                  ${
                    passwordError
                      ? "border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Confirm password */}
              <label
                className="block text-xs font-medium text-slate-600 mb-1.5 mt-4"
                htmlFor="confirm-pass"
              >
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-pass"
                  type={showPassConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value);
                    if (passwordError) setPasswordError("");
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !loading && handleResetPassword()
                  }
                  className={`w-full h-11 px-3 pr-10 text-sm rounded-xl border bg-slate-50 text-slate-900 outline-none transition-all
                  focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary
                  ${
                    passwordError
                      ? "border-red-400 bg-red-50 focus:ring-red-100 focus:border-red-400"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassConfirm ? (
                    <EyeOffIcon className="w-4 h-4" />
                  ) : (
                    <EyeIcon className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="min-h-[18px] mt-1.5">
                {nodeOf(passwordError && (
                  <p className="text-xs text-red-500">{nodeOf(passwordError)}</p>
                ))}
              </div>

              {/* Password strength hint */}
              {password.length > 0 && (
                <div className="flex gap-1 mt-1 mb-2">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        password.length >= level * 4
                          ? level === 1
                            ? "bg-red-400"
                            : level === 2
                              ? "bg-amber-400"
                              : "bg-green-500"
                          : "bg-slate-200"
                      }`}
                    />
                  ))}
                  <span className="text-xs text-slate-400 ml-1 self-center">
                    {password.length < 4
                      ? "Weak"
                      : password.length < 8
                        ? "Fair"
                        : "Good"}
                  </span>
                </div>
              )}

              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full h-11 mt-3 rounded-xl bg-primary text-white text-sm font-semibold
                hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Spinner />}
                {loading ? "Resetting..." : "Reset password"}
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={() => {
                    setStep(STEPS.OTP);
                    setPasswordError("");
                  }}
                  className="text-xs text-slate-400 hover:text-primary transition-colors cursor-pointer"
                >
                  ← Back
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === STEPS.SUCCESS && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                <CheckIcon className="w-5 h-5 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold text-center text-slate-900 mb-1.5">
                Password reset!
              </h1>
              <p className="text-sm text-slate-500 text-center leading-relaxed mb-7">
                Your password has been successfully updated. You can now sign in
                with your new password.
              </p>

              <a
                href="/login"
                className="w-full h-11 rounded-xl bg-primary text-white text-sm font-semibold
                hover:bg-primary/90 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center"
              >
                Back to sign in
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Icons ── */
function LockIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function MailIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M22 6 12 13 2 6" />
    </svg>
  );
}

function KeyIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  );
}

function CheckIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function EyeIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function Spinner({ size = "md" }) {
  return (
    <svg
      className={`animate-spin ${size === "sm" ? "w-3 h-3" : "w-4 h-4"}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
