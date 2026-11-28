// Social sign-in (UPD-003): providers, the minimal browser SDK surfaces used
// by src/lib/socialAuth.ts, and the shapes exchanged with the server actions.

export type SocialProvider = "google" | "facebook" | "apple";

/** A provider token ready for POST /auth/social/{provider} or /customer/social-accounts/{provider}. */
export type SocialToken = {
  token: string;
  /** Apple only sends the user's name on the very first sign-in. */
  name?: string;
};

/** Result of the social sign-in server action. */
export type SocialAuthResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};

// ─── Google Identity Services (token client) ───────────────────────────────
export type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export type GoogleTokenClientConfig = {
  client_id: string;
  scope: string;
  callback: (response: GoogleTokenResponse) => void;
  error_callback?: (error: unknown) => void;
};

export type GoogleTokenClient = {
  requestAccessToken: () => void;
};

export type GoogleIdentity = {
  accounts: {
    oauth2: {
      initTokenClient: (config: GoogleTokenClientConfig) => GoogleTokenClient;
    };
  };
};

// ─── Facebook JS SDK ───────────────────────────────────────────────────────
export type FacebookLoginResponse = {
  status?: string;
  authResponse?: { accessToken?: string } | null;
};

export type FacebookInitOptions = {
  appId: string;
  version: string;
  cookie?: boolean;
  xfbml?: boolean;
};

export type FacebookSdk = {
  init: (options: FacebookInitOptions) => void;
  login: (callback: (response: FacebookLoginResponse) => void, options: { scope: string }) => void;
};

// ─── Sign in with Apple JS ─────────────────────────────────────────────────
export type AppleSignInResponse = {
  authorization?: { id_token?: string; code?: string };
  user?: { name?: { firstName?: string; lastName?: string }; email?: string };
};

export type AppleInitOptions = {
  clientId: string;
  scope: string;
  redirectURI: string;
  usePopup: boolean;
};

export type AppleIdSdk = {
  auth: {
    init: (options: AppleInitOptions) => void;
    signIn: () => Promise<AppleSignInResponse>;
  };
};

/** One row of GET /customer/social-accounts as the profile shows it. */
export type ConnectedAccountRow = {
  provider: SocialProvider;
  label: string;
  connected: boolean;
  /** Provider client configured in this build (NEXT_PUBLIC_* id present). */
  available: boolean;
};

export type SocialLoginButtonsProps = {
  redirectTo: string;
};
