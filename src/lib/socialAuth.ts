// Browser-side provider tokens for social sign-in / account linking (UPD-003).
// Each SDK is loaded on demand the first time its button is used; nothing is
// loaded on pages where no provider is configured.
//
// Google:   GIS token client (scope "openid email profile") → access_token
// Facebook: FB.login({ scope: "email" })                     → authResponse.accessToken
// Apple:    AppleID.auth.signIn() (popup)                    → authorization.id_token (+ name on first sign-in)
import type { SocialProvider, SocialToken } from "@/types/social";

// NEXT_PUBLIC_* values are inlined at build time, so they are read literally.
const CLIENT_IDS: Record<SocialProvider, string | undefined> = {
  google: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  facebook: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
  apple: process.env.NEXT_PUBLIC_APPLE_CLIENT_ID,
};

export const SOCIAL_PROVIDERS: SocialProvider[] = ["google", "facebook", "apple"];

/** Providers whose client id is configured in this build. */
export function enabledSocialProviders(): SocialProvider[] {
  return SOCIAL_PROVIDERS.filter((p) => Boolean(CLIENT_IDS[p]));
}

export function isSocialProvider(value: unknown): value is SocialProvider {
  return value === "google" || value === "facebook" || value === "apple";
}

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  const cached = scripts.get(src);
  if (cached) return cached;
  const promise = new Promise<void>((resolve, reject) => {
    const el = document.createElement("script");
    el.src = src;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scripts.delete(src);
      reject(new Error("Could not load the sign-in service. Check your connection and try again."));
    };
    document.head.appendChild(el);
  });
  scripts.set(src, promise);
  return promise;
}

function requireClientId(provider: SocialProvider): string {
  const id = CLIENT_IDS[provider];
  if (!id) throw new Error("This sign-in option isn't configured.");
  return id;
}

async function googleToken(): Promise<SocialToken> {
  const clientId = requireClientId("google");
  await loadScript("https://accounts.google.com/gsi/client");
  const google = window.google;
  if (!google) throw new Error("Google sign-in is unavailable.");
  return new Promise<SocialToken>((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: "openid email profile",
      callback: (response) => {
        if (response.access_token) resolve({ token: response.access_token });
        else reject(new Error(response.error_description || "Google sign-in was cancelled."));
      },
      error_callback: () => reject(new Error("Google sign-in was cancelled.")),
    });
    client.requestAccessToken();
  });
}

let facebookReady = false;

async function facebookToken(): Promise<SocialToken> {
  const appId = requireClientId("facebook");
  await loadScript("https://connect.facebook.net/en_US/sdk.js");
  const fb = window.FB;
  if (!fb) throw new Error("Facebook sign-in is unavailable.");
  if (!facebookReady) {
    fb.init({ appId, version: "v19.0", cookie: false, xfbml: false });
    facebookReady = true;
  }
  return new Promise<SocialToken>((resolve, reject) => {
    fb.login(
      (response) => {
        const token = response.authResponse?.accessToken;
        if (token) resolve({ token });
        else reject(new Error("Facebook sign-in was cancelled."));
      },
      { scope: "email" },
    );
  });
}

let appleReady = false;

async function appleToken(): Promise<SocialToken> {
  const clientId = requireClientId("apple");
  await loadScript("https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js");
  const apple = window.AppleID;
  if (!apple) throw new Error("Apple sign-in is unavailable.");
  if (!appleReady) {
    apple.auth.init({
      clientId,
      scope: "name email",
      redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || `${window.location.origin}/login`,
      usePopup: true,
    });
    appleReady = true;
  }
  const response = await apple.auth.signIn();
  const token = response.authorization?.id_token;
  if (!token) throw new Error("Apple sign-in was cancelled.");
  const first = response.user?.name?.firstName || "";
  const last = response.user?.name?.lastName || "";
  const name = `${first} ${last}`.trim();
  return name ? { token, name } : { token };
}

/** Run the provider's own sign-in UI and return its token. */
export function getSocialToken(provider: SocialProvider): Promise<SocialToken> {
  if (provider === "google") return googleToken();
  if (provider === "facebook") return facebookToken();
  return appleToken();
}
