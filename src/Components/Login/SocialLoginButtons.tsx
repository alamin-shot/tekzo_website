"use client";

import { useState } from "react";
import type { SocialLoginButtonsProps, SocialProvider } from "@/types/social";
import { enabledSocialProviders, getSocialToken } from "@/lib/socialAuth";
import { SOCIAL_LABELS } from "@/lib/http/apiErrorMessage";
import { socialLoginAction } from "./actions";

// "Continue with Google / Facebook / Apple" (UPD-003). Only providers whose
// NEXT_PUBLIC_* client id is configured are shown; with none configured the
// component renders nothing.
export default function SocialLoginButtons({ redirectTo }: SocialLoginButtonsProps) {
  const providers = enabledSocialProviders();
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState("");

  if (providers.length === 0) return null;

  const handleClick = async (provider: SocialProvider) => {
    if (busy) return;
    setBusy(provider);
    setMessage("");
    try {
      const { token, name } = await getSocialToken(provider);
      const result = await socialLoginAction(provider, token, name, redirectTo);
      if (result.success) {
        // full navigation so the navbar and dashboard read the new auth cookie
        window.location.assign(result.redirectTo || "/");
        return;
      }
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : `${SOCIAL_LABELS[provider]} sign-in failed. Please try again.`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center my-3">
        <div className="grow border-t border-gray-300"></div>
        <span className="shrink mx-4 text-gray-400 text-sm font-light uppercase tracking-wider">or</span>
        <div className="grow border-t border-gray-300"></div>
      </div>
      {message && <p className="mb-3 p-3 rounded-xl text-sm font-medium bg-red-50 text-red-700 border border-red-200">{message}</p>}
      <div className="space-y-2">
        {providers.map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => handleClick(provider)}
            disabled={busy !== null}
            className="flex gap-2 justify-center items-center h-12 w-full rounded-xl bg-white lg:border border-gray-300 active:scale-95 duration-200 font-semibold cursor-pointer text-gray-700 disabled:opacity-60"
          >
            {busy === provider ? "Connecting…" : `Continue with ${SOCIAL_LABELS[provider]}`}
          </button>
        ))}
      </div>
    </div>
  );
}
