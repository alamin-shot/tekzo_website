"use client";

import { useState } from "react";
import type { PhoneVerifyInlineProps, PhoneVerifyStep } from "@/types/props/dashboard";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { apiErrorMessage } from "@/lib/http/apiErrorMessage";
import { toDateInput } from "@/lib/json";

// Phone verification next to the profile phone (UPD-002):
// verified → "Verified ✓" (+ date); otherwise "Verify" → OTP to the phone →
// POST /customer/phone-verify → parent re-fetches GET /customer/profile.
export default function PhoneVerifyInline({ phone, verified, verifiedAt, onVerified }: PhoneVerifyInlineProps) {
  const [step, setStep] = useState<PhoneVerifyStep>("idle");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (verified) {
    const date = verifiedAt ? new Date(toDateInput(verifiedAt)) : null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        Verified ✓
        {date && !Number.isNaN(date.getTime()) && (
          <span className="font-medium normal-case tracking-normal text-emerald-700/80 dark:text-emerald-300/80">
            {date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        )}
      </span>
    );
  }

  if (!phone) return null;
  const phoneNumber = String(phone);

  const requestCode = async () => {
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/phone-verify-request", "POST", { phone_number: phoneNumber });
      setStep("code");
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to send the verification code."));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    if (code.trim().length < 4) {
      setError("Enter the code we sent to your phone.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await clientFetchAPI("/customer/phone-verify", "POST", { phone_number: phoneNumber, code: code.trim() });
      setStep("idle");
      setCode("");
      onVerified();
    } catch (err) {
      setError(apiErrorMessage(err, "Invalid code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1.5">
      {step === "idle" ? (
        <button
          type="button"
          onClick={requestCode}
          disabled={loading}
          className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 hover:underline disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          {loading ? "Sending…" : "Verify"}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="OTP"
            className="w-20 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/15 rounded-lg px-2 py-1 text-xs font-bold text-center text-slate-900 dark:text-white outline-none focus:border-sky-500"
          />
          <button
            type="button"
            onClick={verify}
            disabled={loading}
            className="text-[11px] font-bold uppercase tracking-wider text-white bg-slate-900 dark:bg-white dark:text-slate-900 rounded-lg px-2.5 py-1 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "…" : "Confirm"}
          </button>
          <button type="button" onClick={requestCode} disabled={loading} className="text-[10px] text-slate-400 underline cursor-pointer">
            Resend
          </button>
        </div>
      )}
      {error && <p className="text-[11px] text-rose-500 font-medium text-right max-w-[220px]">{error}</p>}
    </div>
  );
}
