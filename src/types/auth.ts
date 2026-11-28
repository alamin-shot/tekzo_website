// Auth / session shapes (Login server actions, navbar session display).

/**
 * State returned by loginAction / registerAction (useActionState).
 * `message` and `errors` come straight from the backend error when a call
 * fails (`error?.message`, `error?.errors`), so they stay unvalidated.
 */
export type AuthActionState = {
  success: boolean | null;
  message: unknown;
  errors?: unknown;
};

/** Login / register form fields kept in LoginPage state. */
export type AuthFormFields = {
  /** Email or mobile number (login mode). */
  login: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

/**
 * Logged-in customer as the navbar holds it: the raw /customer/profile
 * payload (or the localStorage "cachedNavUser" copy), unvalidated. `null`
 * for guests.
 */
export type NavUser = unknown;
