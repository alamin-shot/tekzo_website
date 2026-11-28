"use client";

import { useCallback, useEffect, useState } from "react";
import type { ConnectedAccountRow, SocialProvider } from "@/types/social";
import clientFetchAPI from "@/utils/clientFetchAPI";
import { SOCIAL_LABELS, apiErrorMessage, socialErrorMessage } from "@/lib/http/apiErrorMessage";
import { SOCIAL_PROVIDERS, enabledSocialProviders, getSocialToken, isSocialProvider } from "@/lib/socialAuth";
import { fieldsOf, isList, rec } from "@/lib/json";

// "Connected accounts" on My Profile (UPD-003):
// GET    /customer/social-accounts            → which providers are linked
// POST   /customer/social-accounts/{provider} → link (provider token), 409 when taken
// DELETE /customer/social-accounts/{provider} → unlink
const linkedProviders = (res: unknown): SocialProvider[] => {
  const data = rec(res)?.data ?? res;
  const list = isList(data) ? data : rec(data)?.accounts ?? rec(data)?.social_accounts ?? [];
  if (!isList(list)) return [];
  return list.map((entry) => (typeof entry === "string" ? entry : fieldsOf(entry).provider)).filter(isSocialProvider);
};

export default function ConnectedAccounts() {
  const [linked, setLinked] = useState<SocialProvider[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [message, setMessage] = useState("");
  const enabled = enabledSocialProviders();

  const load = useCallback(async () => {
    try {
      const res = await clientFetchAPI("/customer/social-accounts", "GET");
      setLinked(linkedProviders(res));
    } catch (err) {
      setMessage(apiErrorMessage(err, "Couldn't load connected accounts."));
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    clientFetchAPI("/customer/social-accounts", "GET")
      .then((res) => {
        if (active) setLinked(linkedProviders(res));
      })
      .catch((err: unknown) => {
        if (active) setMessage(apiErrorMessage(err, "Couldn't load connected accounts."));
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const rows: ConnectedAccountRow[] = SOCIAL_PROVIDERS.map((provider) => ({
    provider,
    label: SOCIAL_LABELS[provider],
    connected: linked.includes(provider),
    available: enabled.includes(provider),
  })).filter((row) => row.connected || row.available);

  const connect = async (provider: SocialProvider) => {
    setBusy(provider);
    setMessage("");
    try {
      const { token, name } = await getSocialToken(provider);
      await clientFetchAPI(`/customer/social-accounts/${provider}`, "POST", name ? { token, name } : { token });
      await load();
    } catch (err) {
      setMessage(rec(err)?.status !== undefined ? socialErrorMessage(err, provider) : err instanceof Error ? err.message : `${SOCIAL_LABELS[provider]} connection failed.`);
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async (provider: SocialProvider) => {
    setBusy(provider);
    setMessage("");
    try {
      await clientFetchAPI(`/customer/social-accounts/${provider}`, "DELETE", {});
      await load();
    } catch (err) {
      setMessage(socialErrorMessage(err, provider));
    } finally {
      setBusy(null);
    }
  };

  if (loaded && rows.length === 0 && !message) return null;

  return (
    <section className="bg-white dark:bg-[#0f182c] rounded-3xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs p-6 lg:p-8">
      <div className="mb-5 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Connected accounts</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sign in faster with an account you already use</p>
      </div>
      {message && <p className="mb-4 text-xs text-rose-500 font-medium">{message}</p>}
      {!loaded ? (
        <p className="text-xs text-slate-400">Loading…</p>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.provider} className="flex items-center justify-between px-4 py-3 rounded-2xl border border-slate-200/70 dark:border-white/[0.06] bg-slate-50/70 dark:bg-white/[0.02]">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{row.label}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{row.connected ? "Connected" : "Not connected"}</p>
              </div>
              {row.connected ? (
                <button type="button" onClick={() => disconnect(row.provider)} disabled={busy !== null} className="text-[11px] font-bold uppercase tracking-wider text-rose-500 hover:text-rose-600 disabled:opacity-50 cursor-pointer">
                  {busy === row.provider ? "…" : "Disconnect"}
                </button>
              ) : (
                <button type="button" onClick={() => connect(row.provider)} disabled={busy !== null} className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 hover:underline disabled:opacity-50 cursor-pointer">
                  {busy === row.provider ? "…" : "Connect"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
